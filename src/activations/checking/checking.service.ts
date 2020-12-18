import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BehaviorSubject } from 'rxjs';
import * as Sentry from '@sentry/minimal';

import { SmsActivationStatus } from 'src/common/smsActivateClient/sms-activation-status.enum';
import { SmsActivateClient } from 'src/common/smsActivateClient/smsActivateClient';
import { ActivationCode } from '../entity/activation-code.entity';
import { Activation } from '../entity/activation.entity';
import { ActivationStatus } from '../types/activation-status.enum';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Money } from 'src/common/money';
import { ErrorType } from 'src/common/errors/error.type';

@Injectable()
export class CheckingService {
  private readonly _subject = new BehaviorSubject('');

  constructor(
    @InjectRepository(Activation)
    private readonly _activationRepository: Repository<Activation>,

    private readonly _smsActivateClient: SmsActivateClient,

    @Inject(forwardRef(() => TransactionsService))
    private readonly _transactionsService: TransactionsService,

    @InjectRepository(ActivationCode)
    private readonly _activationCodeRepository: Repository<ActivationCode>,
  ) {}

  async actualizeActivations() {
    const currentActivations = await this._activationRepository.find({
      where: {
        status: Not(
          In([
            ActivationStatus.FINISHED,
            ActivationStatus.CANCELLED,
            ActivationStatus.ERROR,
          ]),
        ),
      },
    });

    await Promise.all(
      currentActivations.map(activation =>
        this.checkOneActivation(activation).catch(err => {
          console.error(err);
          return Sentry.captureException(err);
        }),
      ),
    );
  }

  private async _runCheck() {
    await new Promise(res => setTimeout(res, 2000));
    await this.actualizeActivations();
    this._subject.next('');
  }

  async startChecker() {
    this._subject.subscribe(() => this._runCheck());
  }

  private async checkOneActivation(activation: Activation) {
    const apiActivation = await this._smsActivateClient.getStatus(
      activation.sourceActivationId,
    );
    switch (apiActivation.status) {
      case SmsActivationStatus.STATUS_CANCEL: {
        if (new Date(activation.expiresAt) <= new Date()) {
          activation.status = ActivationStatus.FINISHED;
          await activation.save();
        } else {
          activation.status = ActivationStatus.CANCELLED;
          await activation.save();
        }
        break;
      }
      case SmsActivationStatus.STATUS_OK: {
        // Синхронизируем полученный код
        await this._createIfNotExistsActivationCode(
          apiActivation.code,
          activation,
        );
        activation.status = ActivationStatus.SMS_RECIEVED;

        if (!activation.transactionId) {
          const transaction = await this._transactionsService.buy({
            money: new Money(activation.cost),
            userId: activation.userId,
          });

          if (!(transaction instanceof ErrorType)) {
            activation.transactionId = transaction.id;
          }
        }

        await activation.save();
        break;
      }
      case SmsActivationStatus.STATUS_WAIT_CODE: {
        activation.status = ActivationStatus.WAIT_CODE;
        await activation.save();
        break;
      }
      case SmsActivationStatus.STATUS_WAIT_RETRY: {
        // Синхронизируем ранее полученный код
        await this._createIfNotExistsActivationCode(
          apiActivation.lastCode,
          activation,
        );
        activation.status = ActivationStatus.WAIT_AGAIN;
        await activation.save();
        break;
      }
      case SmsActivationStatus.WRONG_ACTIVATION_ID: {
        activation.status = ActivationStatus.ERROR;
        console.error(
          `[ActivationsService._actualizeActivationStatus()] status: ${apiActivation.status}`,
        );
        await activation.save();
        break;
      }
      default:
        activation.status = ActivationStatus.ERROR;
        await activation.save();
        console.error(
          `[ActivationsService._actualizeActivationStatus()] Не обработанный case status: ${apiActivation.status}`,
        );
    }
  }

  private async _createIfNotExistsActivationCode(
    codeValue: string,
    activation: Activation,
  ) {
    const actCodeExists = await this._activationCodeRepository.findOne({
      where: { activationId: activation.id, code: codeValue },
    });
    if (!actCodeExists) {
      const actCode = new ActivationCode();
      actCode.code = codeValue;
      actCode.activation = activation;
      await actCode.save();
      return actCode;
    }
    return actCodeExists;
  }
}

import { Injectable } from '@nestjs/common';
import { In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SmsActivationStatus } from 'src/common/smsActivateClient/sms-activation-status.enum';
import { SmsActivateClient } from 'src/common/smsActivateClient/smsActivateClient';
import { ActivationCode } from '../entity/activation-code.entity';

import { Activation } from '../entity/activation.entity';
import { ActivationStatus } from '../types/activation-status.enum';

@Injectable()
export class CheckingService {
  constructor(
    @InjectRepository(Activation)
    private readonly _activationRepository: Repository<Activation>,

    private readonly _smsActivateClient: SmsActivateClient,

    @InjectRepository(ActivationCode)
    private readonly _activationCodeRepository: Repository<ActivationCode>,
  ) {
    Activation.subscibeOnSave(() => {
      this.actualizeActivations();
    });
  }

  async actualizeActivations() {
    const currentActivations = await this._activationRepository.find({
      where: {
        status: Not(
          In([ActivationStatus.FINISHED, ActivationStatus.CANCELLED]),
        ),
      },
    });

    currentActivations.forEach(activation =>
      this.checkOneActivation(activation),
    );
  }

  // async startChecker() {
  //   interval(1000).pipe();
  // }

  private async checkOneActivation(activation: Activation) {
    const apiActivation = await this._smsActivateClient.getStatus(
      activation.sourceActivationId,
    );
    switch (status) {
      case SmsActivationStatus.STATUS_CANCEL: {
        if (new Date(activation.expiresAt) <= new Date()) {
          activation.status = ActivationStatus.FINISHED;
        } else {
          activation.status = ActivationStatus.CANCELLED;
        }

        await activation.save();
        break;
      }
      case SmsActivationStatus.STATUS_OK: {
        // Синхронизируем полученный код
        await this._createIfNotExistsActivationCode(
          apiActivation.code,
          activation,
        );
        activation.status = ActivationStatus.SMS_RECIEVED;
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
      default:
        activation.status = ActivationStatus.ERROR;
        await activation.save();
        throw new Error(
          `[ActivationsService._actualizeActivationStatus()] Не обработанный case status: ${status}`,
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

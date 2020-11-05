import { forwardRef, Inject, Injectable } from '@nestjs/common';
import moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Activation } from './entity/activation.entity';
import { User } from 'src/users/user.entity';
import { ActivationStatus } from './types/activation-status.enum';
import { CreateActivationInput } from './input/create-activation.input';
import { ServicesService } from 'src/services/services.service';
import { createError } from 'src/common/errors/create-error';
import { ErrorType } from 'src/common/errors/error.type';
import { SmsActivateClient } from 'src/common/smsActivateClient/smsActivateClient';
import { CheckingService } from './checking/checking.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Money } from 'src/common/money';
import { ActivationType } from './types/activation.type';
import { BalanceService } from 'src/balance/balance.service';
import { NoNumbersException } from 'src/common/smsActivateClient/exceptions/no-numbers.exception';

@Injectable()
export class ActivationsService {
  constructor(
    @InjectRepository(Activation)
    private readonly _activationRepository: Repository<Activation>,

    private readonly _sercvicesService: ServicesService,
    private readonly _smsActivateClient: SmsActivateClient,
    private readonly _checkingService: CheckingService,

    @Inject(forwardRef(() => TransactionsService))
    private readonly _transactionsService: TransactionsService,

    @Inject(forwardRef(() => BalanceService))
    private readonly _balanceService: BalanceService,
  ) {
    this._checkingService.startChecker();
  }

  async myCurrentActivations(user: User): Promise<ActivationType[]> {
    const activations = await this._getUserCurrentActivations(user.id);
    return Promise.all(
      activations.map(async activation => {
        const price = await this._sercvicesService.getPriceById(
          activation.priceId,
        );

        return {
          ...activation,
          cost: new Money(activation.cost).toDecimal(),
          serviceCode: price?.service?.code,
        };
      }),
    );
  }

  private async _getUserCurrentActivations(
    userId: string,
  ): Promise<Activation[]> {
    const activations = await this._activationRepository.find({
      where: {
        userId,
        status: Not(
          In([ActivationStatus.FINISHED, ActivationStatus.CANCELLED]),
        ),
      },
      relations: ['activationCodes'],
    });
    return activations;
  }

  async getFreezedUserMoney(userId: string): Promise<Money> {
    const activations = await this._getUserCurrentActivations(userId);
    const money = activations.reduce(
      (m, activation) => m.add(new Money(activation.cost)),
      Money.ZERO(),
    );
    return money;
  }

  async create100StubActivations(
    user: User,
    createActivationInput: CreateActivationInput,
  ) {
    await Promise.all(
      Array(100)
        .fill('')
        .map(() => this.createStubActivation(user, createActivationInput)),
    );
  }

  async createStubActivation(
    user: User,
    createActivationInput: CreateActivationInput,
  ): Promise<ErrorType[] | null> {
    const { countryCode, serviceCode } = createActivationInput;
    // - Check price entity exists
    const priceFound = await this._sercvicesService.getPrice(
      serviceCode,
      countryCode,
    );

    if (!priceFound) {
      return [
        createError('countryCode', 'Не найдено price'),
        createError('serviceCode', 'Не найдено price'),
      ];
    }

    const apiOper = {
      number: Math.round(Math.random() * 10000000).toString(),
      operId: Math.round(Math.random() * 100000).toString(),
    };
    // console.log('apiOper', apiOper);

    const expiresAt = moment()
      .add('minutes', 20)
      .toDate();

    const activation = new Activation();
    activation.price = priceFound;
    activation.phoneNum = apiOper.number;
    activation.sourceActivationId = apiOper.operId;
    activation.cost = priceFound.amount;
    activation.user = user;
    activation.expiresAt = expiresAt;

    await activation.save();
    return null;
  }

  async createActivation(
    user: User,
    createActivationInput: CreateActivationInput,
  ): Promise<ErrorType[] | null> {
    const { countryCode, serviceCode } = createActivationInput;
    // - Check price entity exists
    const priceFound = await this._sercvicesService.getPrice(
      serviceCode,
      countryCode,
    );

    if (!priceFound) {
      return [
        createError('countryCode', 'Не найдено price'),
        createError('serviceCode', 'Не найдено price'),
      ];
    }

    const priceMoney = new Money(priceFound.amount);

    const noMoneyError = await this._transactionsService.returnErrorIfNoMoneyToBuy(
      priceMoney,
      user,
    );
    if (noMoneyError) {
      return [noMoneyError];
    }

    const apiOper = await this._smsActivateClient.getNumber(
      serviceCode,
      countryCode,
    );

    if (apiOper instanceof NoNumbersException) {
      return [
        createError('NO_NUMBERS', 'Нет доступных номеров для данного сервиса'),
      ];
    }

    const expiresAt = moment()
      .add('minutes', 20)
      .toDate();

    const activation = new Activation();
    activation.price = priceFound;
    activation.phoneNum = apiOper.number;
    activation.sourceActivationId = apiOper.operId;
    activation.cost = priceMoney.amount;
    activation.user = user;
    activation.expiresAt = expiresAt;
    // activation.transaction = transaction;

    await activation.save();
    return null;
  }

  async cancelActivation(
    user: User,
    activationId: number,
  ): Promise<ErrorType[] | null> {
    const activation = await this._activationRepository.findOne(activationId, {
      where: { userId: user.id, status: In([ActivationStatus.WAIT_CODE]) },
    });
    if (!activation) {
      return [createError('activationId', 'Не найдено активации')];
    }

    await this._smsActivateClient.cancelActivation(
      activation.sourceActivationId,
    );

    activation.status = ActivationStatus.CANCELLED;
    await activation.save();
    return null;
  }

  async finishActivationApi(
    user: User,
    activationId: number,
  ): Promise<ErrorType[] | null> {
    const activation = await this.finishActivation(user.id, activationId);
    if (!activation) {
      return [createError('activationId', 'Не найдено активации')];
    }

    return null;
  }

  async finishActivation(
    userId: string,
    activationId: number,
  ): Promise<Activation | null> {
    const activation = await this._activationRepository.findOne(activationId, {
      where: {
        userId,
        status: In([
          ActivationStatus.SMS_RECIEVED,
          ActivationStatus.WAIT_AGAIN,
        ]),
      },
    });
    if (!activation) {
      return null;
    }

    await this._smsActivateClient.finishActivation(
      activation.sourceActivationId,
    );

    activation.status = ActivationStatus.FINISHED;
    await activation.save();
    return activation;
  }
}

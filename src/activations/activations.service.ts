import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { Repository, Not } from 'typeorm';
import { Activation } from './entity/activation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { ActivationStatus } from './types/activation-status.enum';
import { CreateActivationInput } from './input/create-activation.input';
import { ServicesService } from 'src/services/services.service';
import { createError } from 'src/common/errors/create-error';
import { ErrorType } from 'src/common/errors/error.type';
import { SmsActivateClient } from 'src/common/smsActivateClient/smsActivateClient';

type Queue = {
  sourceActivationId: string;
};

@Injectable()
export class ActivationsService {
  private readonly _queue: Queue[] = [];

  constructor(
    @InjectRepository(Activation)
    private readonly _activationRepository: Repository<Activation>,
    private readonly _sercvicesService: ServicesService,
    private readonly _smsActivateClient: SmsActivateClient,
  ) {
    this._startPollingActivates();
  }

  // При закпуске сервера запрашиваем активные активации и запускаем опрос источника
  private async _startPollingActivates() {
    const activeActivations = await this._activationRepository.find({
      where: [
        { status: Not(ActivationStatus.FINISHED) },
        { status: Not(ActivationStatus.CANCELLED) },
      ],
    });

    activeActivations.forEach(activation => {
      this._queue.push({ sourceActivationId: activation.sourceActivationId });
    });

    await this._startHandlingQueue();
  }

  private async _startHandlingQueue() {
    this._queue.forEach(async () => {
      const item = this._queue.shift();
      await this._handleOneActivation(item);
    });
  }

  private async _handleOneActivation({ sourceActivationId }: Queue) {}

  async myCurrentActivations(user: User): Promise<Activation[]> {
    const activations = await this._activationRepository.find({
      where: [
        {
          userId: user.id,
          status: Not(ActivationStatus.FINISHED),
        },
        {
          userId: user.id,
          status: Not(ActivationStatus.CANCELLED),
        },
      ],
    });
    return activations;
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

    // - Check balance amount for buy
    // if (user.balanceAmount < priceFound.amount) {
    //   return [createError('balanceAmount', 'Недостаточно средств')];
    // }

    const apiOper = await this._smsActivateClient.getNumberStub(
      serviceCode,
      countryCode,
    );
    console.log('apiOper', apiOper);

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

    console.log(activation);

    // - Create transaction
    return null;
  }
}

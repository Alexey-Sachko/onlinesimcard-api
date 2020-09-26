import { Injectable } from '@nestjs/common';
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
import { ActivationCode } from './entity/activation-code.entity';
import { CheckingService } from './checking/checking.service';

@Injectable()
export class ActivationsService {
  constructor(
    @InjectRepository(Activation)
    private readonly _activationRepository: Repository<Activation>,

    @InjectRepository(ActivationCode)
    private readonly _sercvicesService: ServicesService,
    private readonly _smsActivateClient: SmsActivateClient,
    private readonly _checkingService: CheckingService,
  ) {
    this._checkingService.startChecker();
  }

  async myCurrentActivations(user: User): Promise<Activation[]> {
    const activations = await this._activationRepository.find({
      where: {
        userId: user.id,
        status: Not(
          In([ActivationStatus.FINISHED, ActivationStatus.CANCELLED]),
        ),
      },
      relations: ['activationCodes'],
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

    const apiOper = await this._smsActivateClient.getNumber(
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
    return null;
  }

  async cancelActivation(
    user: User,
    activationId: number,
  ): Promise<ErrorType[] | null> {
    const activation = await this._activationRepository.findOne(activationId, {
      where: { userId: user.id },
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

  async finishActivation(
    user: User,
    activationId: number,
  ): Promise<ErrorType[] | null> {
    const activation = await this._activationRepository.findOne(activationId, {
      where: { userId: user.id },
    });
    if (!activation) {
      return [createError('activationId', 'Не найдено активации')];
    }

    await this._smsActivateClient.finishActivation(
      activation.sourceActivationId,
    );

    activation.status = ActivationStatus.FINISHED;
    await activation.save();
    return null;
  }
}

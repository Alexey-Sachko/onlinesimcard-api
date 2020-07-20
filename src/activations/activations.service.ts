import { Injectable } from '@nestjs/common';
import { Repository, Not } from 'typeorm';
import { Activation } from './entity/activation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { ActivationStatus } from './types/activation-status.enum';
import { CreateActivationInput } from './input/create-activation.input';
import { ServicesService } from 'src/services/services.service';
import { createError } from 'src/common/errors/create-error';
import { ErrorType } from 'src/common/errors/error.type';

@Injectable()
export class ActivationsService {
  constructor(
    @InjectRepository(Activation)
    private readonly _activationRepository: Repository<Activation>,
    private readonly _sercvicesService: ServicesService,
  ) {}

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

    if (user.balanceAmount < priceFound.amount) {
      return [createError('balanceAmount', 'Недостаточно средств')];
    }

    // - Check balance amount for buy
    // - Create transaction
    return null;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Activation } from '../entity/activation.entity';
import { ActivationStatus } from '../types/activation-status.enum';

@Injectable()
export class CheckingService {
  constructor(
    @InjectRepository(Activation)
    private readonly _activationRepository: Repository<Activation>,
  ) {
    Activation.subscibeOnSave(() => {
      this.actualizeActivations();
    });
  }

  async actualizeActivations() {
    const currentActivations = await this._activationRepository.find({
      where: { status: ActivationStatus.WAIT_AGAIN },
    });
  }
}

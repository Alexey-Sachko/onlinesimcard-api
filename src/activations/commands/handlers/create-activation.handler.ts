import moment from 'moment';
// import { Repository } from 'typeorm';
// import { InjectRepository } from '@nestjs/typeorm';
import { v1 as uuid } from 'uuid';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Activation } from '../../entity/activation.entity';
import { ServicesService } from 'src/services/services.service';
import { SmsActivateClient } from 'src/common/smsActivateClient/smsActivateClient';
import { CreateActivationCommand } from '../impl/create-activation.command';
import { CreatedActivationEvent } from 'src/activations/events/impl/created-activation.event';

@CommandHandler(CreateActivationCommand)
export class CreateActivationHandler
  implements ICommandHandler<CreateActivationCommand> {
  constructor(
    private readonly _servicesService: ServicesService,
    private readonly _smsActivateClient: SmsActivateClient,
    private readonly _eventBus: EventBus,
  ) {}

  async execute(command: CreateActivationCommand) {
    const { countryCode, serviceCode } = command.createActivationInput;
    const price = await this._servicesService.getPrice(
      serviceCode,
      countryCode,
    );
    if (!price) {
      throw new Error('Not found price');
    }

    // const { number, operId } = await this._smsActivateClient.getNumber(
    //   serviceCode,
    //   countryCode,
    // );

    const activation = new Activation();
    activation.user = command.user;
    activation.price = price;
    activation.cost = price.amount;
    activation.phoneNum = '79080808008';
    activation.sourceActivationId = uuid();
    activation.expiresAt = moment()
      .add(20, 'minutes')
      .toDate();

    await activation.save();
    this._eventBus.publish(new CreatedActivationEvent(activation));
    return activation;
  }
}

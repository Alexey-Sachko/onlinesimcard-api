import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { ActivationsResolver } from './activations.resolver';
import { ActivationsService } from './activations.service';
import { Activation } from './entity/activation.entity';
import { ServicesModule } from 'src/services/services.module';
import { UsersModule } from 'src/users/users.module';
import { SmsActivateClient } from 'src/common/smsActivateClient/smsActivateClient';
import { ActivationCode } from './entity/activation-code.entity';
import { CreateActivationHandler } from './commands/handlers/create-activation.handler';
import { CreatedActivationEventHandler } from './events/handlers/created-activation-event.handler';

const commandHandlers = [CreateActivationHandler];
const eventHandlers = [CreatedActivationEventHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Activation, ActivationCode]),
    ServicesModule,
    UsersModule,
  ],
  providers: [
    ActivationsResolver,
    ActivationsService,
    SmsActivateClient,
    ...commandHandlers,
    ...eventHandlers,
  ],
})
export class ActivationsModule {}

import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ActivationsResolver } from './activations.resolver';
import { ActivationsService } from './activations.service';
import { Activation } from './entity/activation.entity';
import { ServicesModule } from 'src/services/services.module';
import { UsersModule } from 'src/users/users.module';
import { SmsActivateClient } from 'src/common/smsActivateClient/smsActivateClient';
import { ActivationCode } from './entity/activation-code.entity';
import { CheckingService } from './checking/checking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activation, ActivationCode]),
    ServicesModule,
    UsersModule,
  ],
  providers: [
    ActivationsResolver,
    ActivationsService,
    SmsActivateClient,
    CheckingService,
  ],
})
export class ActivationsModule {}

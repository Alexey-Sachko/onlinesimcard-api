import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ActivationsResolver } from './activations.resolver';
import { ActivationsService } from './activations.service';
import { Activation } from './entity/activation.entity';
import { ServicesModule } from 'src/services/services.module';
import { UsersModule } from 'src/users/users.module';
import { SmsActivateClient } from 'src/common/smsActivateClient/smsActivateClient';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activation]),
    ServicesModule,
    UsersModule,
  ],
  providers: [ActivationsResolver, ActivationsService, SmsActivateClient],
})
export class ActivationsModule {}

import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { ActivationsResolver } from './activations.resolver';
import { ActivationsService } from './activations.service';
import { Activation } from './entity/activation.entity';
import { ServicesModule } from 'src/services/services.module';
import { UsersModule } from 'src/users/users.module';
import { SmsActivateClient } from 'src/common/smsActivateClient/smsActivateClient';
import { ActivationCode } from './entity/activation-code.entity';
import { CheckingService } from './checking/checking.service';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { BalanceModule } from 'src/balance/balance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activation, ActivationCode]),
    ServicesModule,
    forwardRef(() => UsersModule),
    forwardRef(() => TransactionsModule),
    forwardRef(() => BalanceModule),
  ],
  providers: [
    ActivationsResolver,
    ActivationsService,
    SmsActivateClient,
    CheckingService,
  ],
  exports: [ActivationsService],
})
export class ActivationsModule {}

import { forwardRef, Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceResolver } from './balance.resolver';
import { ActivationsModule } from 'src/activations/activations.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [
    forwardRef(() => ActivationsModule),
    forwardRef(() => TransactionsModule),
  ],
  providers: [BalanceService, BalanceResolver],
  exports: [BalanceService],
})
export class BalanceModule {}

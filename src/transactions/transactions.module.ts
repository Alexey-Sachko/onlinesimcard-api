import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction.entity';
import { PassportModule } from '@nestjs/passport';
import { TransactionsResolver } from './transactions.resolver';
import { UsersModule } from 'src/users/users.module';
import { BalanceModule } from 'src/balance/balance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    PassportModule.register({
      defaultStrategy: 'jwt-perm',
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => BalanceModule),
  ],
  exports: [TransactionsService],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsResolver],
})
export class TransactionsModule {}

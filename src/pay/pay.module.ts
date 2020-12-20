import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { UsersModule } from 'src/users/users.module';
import { FreekassaController } from './freekassa/freekassa.controller';
import { FreekassaService } from './freekassa/freekassa.service';

import { OrderEntity } from './orders/order.entity';
import { OrdersService } from './orders/orders.service';
import { PayResolver } from './pay.resolver';
import { PayService } from './pay.service';
import { YoomoneyController } from './yoomoney/yoomoney.controller';
import { YoomoneyService } from './yoomoney/yoomoney.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
    UsersModule,
    TransactionsModule,
  ],
  controllers: [FreekassaController, YoomoneyController],
  providers: [
    PayResolver,
    PayService,
    OrdersService,
    FreekassaService,
    YoomoneyService,
  ],
})
export class PayModule {}

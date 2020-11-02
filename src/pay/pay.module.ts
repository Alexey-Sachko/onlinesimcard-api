import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from './orders/order.entity';
import { OrdersService } from './orders/orders.service';
import { PayResolver } from './pay.resolver';
import { PayService } from './pay.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity])],
  controllers: [],
  providers: [PayResolver, PayService, OrdersService],
})
export class PayModule {}

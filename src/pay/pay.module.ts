import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

import { OrderEntity } from './orders/order.entity';
import { OrdersService } from './orders/orders.service';
import { PayResolver } from './pay.resolver';
import { PayService } from './pay.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity]), UsersModule],
  controllers: [],
  providers: [PayResolver, PayService, OrdersService],
})
export class PayModule {}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { OrderStatus } from './order-status.enum';
import { OrderEntity } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly _ordersRepository: Repository<OrderEntity>,
  ) {}

  async createOrder(user: User, amount: number): Promise<OrderEntity> {
    const order = new OrderEntity();
    order.status = OrderStatus.WAIT_PAY;
    order.amount = amount;
    order.user = user;

    await order.save();
    return order;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Money } from 'src/common/money';
import { Transaction } from 'src/transactions/transaction.entity';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { OrderStatus } from './order-status.enum';
import { OrderEntity } from './order.entity';
import { OrderType } from './order.gql-type';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly _ordersRepository: Repository<OrderEntity>,
  ) {}

  async createOrder(user: User, amount: number): Promise<OrderEntity> {
    const money = Money.fromDecimal(amount);

    const order = new OrderEntity();
    order.status = OrderStatus.WAIT_PAY;
    order.amount = money.amount;
    order.user = user;

    await order.save();
    return order;
  }

  async getOrder({ id }: { id: number }): Promise<OrderEntity | null> {
    const order = await this._ordersRepository.findOne(id);
    return order || null;
  }

  async complete(
    order: OrderEntity,
    transaction: Transaction,
    { paymentId }: { paymentId: string },
  ): Promise<void> {
    await this._ordersRepository.update(
      { id: order.id },
      { status: OrderStatus.PAID, transactionId: transaction.id, paymentId },
    );
  }

  async getUserOrders(userId: string): Promise<OrderType[]> {
    const orders = await this._ordersRepository.find({ where: { userId } });
    return orders.map(order => ({
      ...order,
      amount: new Money(order.amount).toDecimal(),
    }));
  }
}

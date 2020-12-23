import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Money } from 'src/common/money';
import { Transaction } from 'src/transactions/transaction.entity';
import { TransactionsService } from 'src/transactions/transactions.service';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { PaymentVariant } from '../input/payment-variant.enum';
import { OrderStatus } from './order-status.enum';
import { OrderEntity } from './order.entity';
import { OrderType } from './order.gql-type';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly _ordersRepository: Repository<OrderEntity>,

    private readonly _transactionsService: TransactionsService,
  ) {}

  async createOrder({
    amount,
    user,
    formVariant,
  }: {
    user: User;
    amount: number;
    formVariant: PaymentVariant;
  }): Promise<OrderEntity> {
    const money = Money.fromDecimal(amount);

    const order = new OrderEntity();
    order.status = OrderStatus.WAIT_PAY;
    order.amount = money.amount;
    order.user = user;
    order.formVariant = formVariant;

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
    { paymentId, incomingMoney }: { paymentId: string; incomingMoney: Money },
  ): Promise<void> {
    await this._ordersRepository.update(
      { id: order.id },
      {
        status: OrderStatus.PAID,
        transactionId: transaction.id,
        paymentId,
        amount: incomingMoney.amount,
      },
    );
  }

  async completeOrder({
    orderId,
    amount,
    paymentId,
  }: {
    orderId: string | number;
    amount: number;
    paymentId: string;
  }) {
    const order = await this.getOrder({
      id: Number(orderId),
    });

    // Проверка наличия заказа
    if (!order) {
      throw new NotFoundException(`not found order`);
    }

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('order is already paid');
    }

    const incomingMoney = Money.fromDecimal(amount);

    // TODO: временный фикс
    // const orderMoney = new Money(order.amount);

    // // Проверка суммы заказа
    // if (!incomingMoney.equal(orderMoney)) {
    //   throw new BadRequestException(
    //     "order.amount and payment.AMOUNT aren't equals",
    //   );
    // }

    const transaction = await this._transactionsService.pay({
      money: incomingMoney,
      userId: order.userId,
    });

    await this.complete(order, transaction, {
      paymentId: String(paymentId),
      incomingMoney,
    });
  }

  async forceCompleteOrder({
    paymentId,
    orderId,
  }: {
    orderId: number;
    paymentId: string;
    amount: number;
  }) {
    const order = await this.getOrder({ id: orderId });

    const money = new Money(order.amount);

    const transaction = await this._transactionsService.pay({
      money,
      userId: order.userId,
    });

    // TODO получать money из параметров
    this.complete(order, transaction, { paymentId, incomingMoney: money });
  }

  async getUserOrders(userId: string): Promise<OrderType[]> {
    const orders = await this._ordersRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return orders.map(order => ({
      ...order,
      amount: new Money(order.amount).toDecimal(),
    }));
  }
}

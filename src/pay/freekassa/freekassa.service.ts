import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Money } from 'src/common/money';
import { TransactionsService } from 'src/transactions/transactions.service';
import { OrderStatus } from '../orders/order-status.enum';
import { OrdersService } from '../orders/orders.service';
import { PaymentDoneDto } from './dto/payment-done.dto';

@Injectable()
export class FreekassaService {
  constructor(
    private readonly _transactionsService: TransactionsService,
    private readonly _ordersService: OrdersService,
  ) {}

  async paymentDone({ MERCHANT_ORDER_ID, AMOUNT, intid }: PaymentDoneDto) {
    const order = await this._ordersService.getOrder({
      id: Number(MERCHANT_ORDER_ID),
    });
    // Проверка наличия заказа
    if (!order) {
      throw new NotFoundException(`not found order`);
    }

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('order is already paid');
    }

    const incomingMoney = Money.fromDecimal(AMOUNT);
    const orderMoney = new Money(order.amount);

    // Проверка суммы заказа
    if (!incomingMoney.equal(orderMoney)) {
      throw new BadRequestException(
        "order.amount and payment.AMOUNT aren't equals",
      );
    }

    const transaction = await this._transactionsService.pay({
      money: incomingMoney,
      userId: order.userId,
    });

    await this._ordersService.complete(order, transaction, {
      paymentId: String(intid),
    });

    return 'YES';
  }
}

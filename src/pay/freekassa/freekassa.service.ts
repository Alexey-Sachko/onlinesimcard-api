import { ForbiddenException, Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { PaymentDoneDto } from './dto/payment-done.dto';
import { fkIpAddresses } from './fk-ip-adress';

@Injectable()
export class FreekassaService {
  constructor(private readonly _ordersService: OrdersService) {}

  async paymentDone(
    { MERCHANT_ORDER_ID, AMOUNT, intid }: PaymentDoneDto,
    ipAdress: string,
  ) {
    if (!fkIpAddresses.includes(ipAdress)) {
      throw new ForbiddenException();
    }

    await this._ordersService.completeOrder({
      amount: AMOUNT,
      orderId: MERCHANT_ORDER_ID,
      paymentId: String(intid),
    });

    return 'YES';
  }
}

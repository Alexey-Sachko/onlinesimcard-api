import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { freekassa } from './client/free-kassa.client';
import { MakePaymentResType } from './gql-types/make-payment-res.type';

import { MakePaymentInput } from './input/make-payment.input';
import { OrdersService } from './orders/orders.service';

@Injectable()
export class PayService {
  constructor(private readonly _ordersService: OrdersService) {}

  async makePayment(
    user: User,
    makePaymentInput: MakePaymentInput,
  ): Promise<MakePaymentResType> {
    const order = await this._ordersService.createOrder(
      user,
      makePaymentInput.amount,
    );

    const paymentUrl = freekassa.getForm(
      makePaymentInput.amount,
      order.id.toString(),
      { email: user.email || undefined },
    );

    return {
      orderId: order.id,
      url: paymentUrl,
    };
  }
}

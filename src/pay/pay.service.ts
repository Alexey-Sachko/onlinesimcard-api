import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { freekassa } from './client/free-kassa.client';
import { yoomoneyClient } from './client/yoomoney.client';
// import { interkassa } from './client/interkassa.client';
import { Kassa } from './common/kassa.interface';
import { MakePaymentResType } from './gql-types/make-payment-res.type';

import { MakePaymentInput } from './input/make-payment.input';
import { PaymentVariant } from './input/payment-variant.enum';
import { OrdersService } from './orders/orders.service';

const kassaMap: Record<PaymentVariant, Kassa> = {
  [PaymentVariant.FREEKASSA]: freekassa,
  [PaymentVariant.BANK_CARD]: yoomoneyClient,
  // [PaymentVariant.INTERKASSA]: interkassa,
};
@Injectable()
export class PayService {
  constructor(private readonly _ordersService: OrdersService) {}

  async makePayment(
    user: User,
    makePaymentInput: MakePaymentInput,
  ): Promise<MakePaymentResType> {
    const { amount, variant } = makePaymentInput;

    const order = await this._ordersService.createOrder({
      user,
      amount,
      formVariant: variant,
    });

    const kassa = kassaMap[variant];

    const payment = kassa.getForm({
      orderAmount: amount,
      orderId: order.id.toString(),
      email: user.email || undefined,
    });

    return {
      orderId: order.id,
      formUrl: payment.formUrl,
      method: payment.method,
      fields: Object.entries(payment.params)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([name, value]) => ({
          name,
          value: String(value),
        })),
    };
  }
}

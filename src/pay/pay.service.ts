import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { MakePaymentResType } from './gql-types/make-payment-res.type';

import { MakePaymentInput } from './input/make-payment.input';

@Injectable()
export class PayService {
  async makePayment(
    user: User,
    makePaymentInput: MakePaymentInput,
  ): Promise<MakePaymentResType> {
    return {
      orderId: 123,
      url: 'http://some-url.com',
    };
  }
}

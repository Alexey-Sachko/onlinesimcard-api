import { Field, InputType } from '@nestjs/graphql';

import { PaymentVariant } from './payment-variant.enum';

@InputType()
export class MakePaymentInput {
  @Field()
  amount: number;

  @Field(type => PaymentVariant)
  variant: PaymentVariant;
}

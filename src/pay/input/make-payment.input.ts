import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class MakePaymentInput {
  @Field()
  amount: number;
}

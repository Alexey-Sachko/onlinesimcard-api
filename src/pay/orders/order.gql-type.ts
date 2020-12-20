import { Field, ObjectType } from '@nestjs/graphql';
import { PaymentVariant } from '../input/payment-variant.enum';
import { OrderStatus } from './order-status.enum';

@ObjectType()
export class OrderType {
  @Field()
  id: number;

  @Field({ nullable: true })
  paymentId: string;

  @Field()
  amount: number;

  @Field(type => OrderStatus)
  status: OrderStatus;

  @Field()
  createdAt: Date;

  @Field(type => PaymentVariant)
  formVariant: PaymentVariant;
}

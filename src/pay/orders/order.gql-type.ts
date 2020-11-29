import { Field, ObjectType } from '@nestjs/graphql';
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
}

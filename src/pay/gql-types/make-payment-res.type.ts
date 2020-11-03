import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MakePaymentResType {
  @Field()
  orderId: number;

  @Field()
  url: string;
}

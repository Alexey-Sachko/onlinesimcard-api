import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MakePaymentResType {
  orderId: number;
  url: string;
}

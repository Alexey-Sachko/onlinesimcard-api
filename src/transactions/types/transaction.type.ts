import { Field, ObjectType } from '@nestjs/graphql';
import { TransactionType } from '../transaction-type.enum';

@ObjectType()
export class TransactionGqlType {
  @Field(type => TransactionType)
  type: TransactionType;

  @Field()
  id: string;

  @Field()
  amount: number;

  @Field()
  balanceBefore: number;

  @Field()
  createdAt: string;

  @Field()
  userId: string;
}

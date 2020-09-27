import { Field, InputType } from '@nestjs/graphql';
import { TransactionType } from '../transaction-type.enum';

@InputType()
export class CreateTransactionDto {
  @Field()
  amount: number;

  @Field(type => TransactionType)
  type: TransactionType;
}

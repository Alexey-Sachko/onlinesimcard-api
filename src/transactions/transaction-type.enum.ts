import { registerEnumType } from '@nestjs/graphql';

export enum TransactionType {
  Payment = 'Payment',
  Bonus = 'Bonus',
  Buy = 'Buy',
}

registerEnumType(TransactionType, {
  name: 'TransactionType',
});

import { Money } from 'src/common/money';
import { TransactionType } from '../transaction-type.enum';

export class CreateTransactionDto {
  money: Money;
  type: TransactionType;
}

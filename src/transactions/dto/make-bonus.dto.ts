import { Money } from 'src/common/money';
import { MakeBonusInput } from '../input/make-bonus.input';

export class MakeBonusDto implements Omit<MakeBonusInput, 'amount'> {
  money: Money;
  targetUserId: string;
}

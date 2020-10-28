import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ActivationsService } from 'src/activations/activations.service';
import { Money } from 'src/common/money';
import { TransactionsService } from 'src/transactions/transactions.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class BalanceService {
  constructor(
    @Inject(forwardRef(() => ActivationsService))
    private readonly _activationsService: ActivationsService,

    @Inject(forwardRef(() => TransactionsService))
    private readonly _transactionsService: TransactionsService,
  ) {}

  async getDisplayUserBalance(user: User): Promise<number> {
    const balance = await this.getUserBalance(user.id);
    return balance.toDecimal();
  }

  async getUserBalance(userId: string): Promise<Money> {
    const lastTransaction = await this._transactionsService.getLastUserTransaction(
      userId,
    );
    const freezedBalance = await this._activationsService.getFreezedUserMoney(
      userId,
    );

    if (lastTransaction) {
      return new Money(lastTransaction.balanceBefore)
        .add(new Money(lastTransaction.amount))
        .subtract(freezedBalance);
    }

    return Money.ZERO();
  }
}

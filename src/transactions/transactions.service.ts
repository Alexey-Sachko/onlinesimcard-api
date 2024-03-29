import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { User } from '../users/user.entity';
import { MakeBonusInput } from './input/make-bonus.input';
import { UsersService } from 'src/users/users.service';
import { Money } from 'src/common/money';
import { NoMoneyException } from './exception/no-money.exception';
import { TransactionType } from './transaction-type.enum';
import { ErrorType } from 'src/common/errors/error.type';
import { createError } from 'src/common/errors/create-error';
import { BuyDto } from './dto/buy.dto';
import { MakeBonusDto } from './dto/make-bonus.dto';
import { BalanceService } from 'src/balance/balance.service';
import { PayDto } from './dto/pay.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly _transactionRepository: Repository<Transaction>,

    @Inject(forwardRef(() => UsersService))
    private readonly _usersService: UsersService,

    @Inject(forwardRef(() => BalanceService))
    private readonly _balanceService: BalanceService,
  ) {}

  async getLastUserTransaction(userId: string) {
    const [lastTransaction] = await this._transactionRepository.find({
      where: {
        userId,
      },
      take: 1,
      order: { createdAt: 'DESC' },
    });
    return lastTransaction;
  }

  async apiMakeBonus(
    makeBonusInput: MakeBonusInput,
  ): Promise<ErrorType | null> {
    return this.makeBonus({
      ...makeBonusInput,
      money: Money.fromDecimal(makeBonusInput.amount),
    });
  }

  async makeBonus(makeBonusDto: MakeBonusDto): Promise<ErrorType | null> {
    const { money, targetUserId } = makeBonusDto;

    const targetUser = await this._usersService.getUserById(targetUserId);
    if (!targetUser) {
      return createError(
        'targetUserId',
        `Нет пользователя с id: "${targetUserId}"`,
      );
    }

    const error = await this._createTransaction(
      {
        money,
        type: TransactionType.Bonus,
      },
      targetUser.id,
    );

    if (error instanceof NoMoneyException) {
      return error.toDisplayError();
    }

    return null;
  }

  async buy({ money, userId }: BuyDto): Promise<ErrorType | Transaction> {
    // Сделать инверсию методом в Money
    const transaction = await this._createTransaction(
      { money: money.multiply(-1), type: TransactionType.Buy },
      userId,
    );
    if (transaction instanceof NoMoneyException) {
      return transaction.toDisplayError();
    }

    return transaction;
  }

  async pay({ money, userId }: PayDto): Promise<Transaction> {
    const transaction = await this._createTransaction(
      { money, type: TransactionType.Payment },
      userId,
    );
    if (!(transaction instanceof Transaction)) {
      throw transaction;
    }

    return transaction;
  }

  async getTransactions() {
    return this._transactionRepository.find();
  }

  async returnErrorIfNoMoneyToBuy(
    operMoney: Money,
    user: User,
  ): Promise<ErrorType | null> {
    const userBalance = await this._balanceService.getUserBalance(user.id);

    console.log(operMoney.toDecimal(), userBalance.toDecimal());

    if (userBalance.subtract(operMoney).less(Money.ZERO())) {
      return new NoMoneyException().toDisplayError();
    }

    return null;
  }

  private async _createTransaction(
    createTransactionDto: CreateTransactionDto,
    userId: string,
  ): Promise<NoMoneyException | Transaction> {
    const userBalance = await this._balanceService.getUserBalance(userId);

    const { money, type } = createTransactionDto;

    const transactionMoney = new Money(money.toRoundLessAmount());

    const totalBalance = new Money(
      userBalance.add(transactionMoney).toRoundLessAmount(),
    );

    if (totalBalance.less(Money.ZERO())) {
      return new NoMoneyException();
    }

    const lastTransaction = await this.getLastUserTransaction(userId);

    const currentBalance = lastTransaction
      ? new Money(lastTransaction.balanceBefore).add(
          new Money(lastTransaction.amount),
        )
      : Money.ZERO();

    const transaction = new Transaction();
    transaction.userId = userId;
    transaction.amount = transactionMoney.amount;
    transaction.balanceBefore = currentBalance.amount;
    transaction.type = type;

    await transaction.save();
    return transaction;
  }

  async test() {
    const allUserIds = await this._transactionRepository.query(
      'SELECT DISTINCT "userId" from "transaction"',
    );

    const result: {
      userId: string;
      transactions: Transaction[];
    }[] = await Promise.all(
      allUserIds.map(async ({ userId }) => {
        const userTransactions = await this._transactionRepository.find({
          where: { userId },
          order: {
            createdAt: 'ASC',
          },
        });
        return { userId, transactions: userTransactions };
      }),
    );

    const filtered = result.filter(({ transactions }) =>
      transactions.some(({ amount }) => !Number.isInteger(amount)),
    );

    const calcBalance = (transactions: Transaction[]) => {
      return transactions.reduce((acc, { amount }) => acc + amount, 0);
    };

    return filtered.map(({ transactions, userId }) => {
      const oldBalance = calcBalance(transactions);

      const lastTransaction = transactions[transactions.length - 1];

      const nextTransactions = [];

      transactions.forEach((old, idx) => {
        const add = (balanceBefore: number) => {
          const newAmount = new Money(old.amount).toRoundMoreAmount();
          nextTransactions.push({
            ...old,
            amount: newAmount,
            balanceBefore,
          });
        };

        const prev = nextTransactions[idx - 1];
        if (prev) {
          const nextBalanceBefore = prev.amount + prev.balanceBefore;
          add(nextBalanceBefore);
        } else {
          add(0);
        }
      });

      return {
        userId,
        oldBalance,
        nextBalance: calcBalance(nextTransactions),
        transactionsBalance:
          lastTransaction.balanceBefore + lastTransaction.amount,
        transactions,
        nextTransactions,
      };
    });
  }
}

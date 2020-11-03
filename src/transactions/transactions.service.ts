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
    const totalBalance = userBalance.add(money);

    if (totalBalance.less(Money.ZERO())) {
      return new NoMoneyException();
    }

    const transaction = new Transaction();
    transaction.userId = userId;
    transaction.amount = money.amount;
    transaction.balanceBefore = userBalance.amount;
    transaction.type = type;

    await transaction.save();
    return transaction;
  }
}

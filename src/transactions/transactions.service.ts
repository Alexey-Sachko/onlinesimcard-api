import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { User } from '../users/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getTransactions() {
    return this.transactionRepository.find();
  }

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    user: User,
  ) {
    const [lastTransaction] = await this.transactionRepository.find({
      where: {
        userId: user.id,
      },
      take: 1,
      order: { createdAt: 'DESC' },
    });
    let lastBalance = 0;
    if (lastTransaction) {
      lastBalance = lastTransaction.balanceBefore + lastTransaction.amount; // TODO вынести
    }

    const { amount } = createTransactionDto;
    const totalBalance = lastBalance + amount;

    if (totalBalance < 0) {
      throw new HttpException('Payment required', HttpStatus.PAYMENT_REQUIRED);
    }

    const transaction = new Transaction();
    transaction.user = user;
    transaction.amount = amount;
    transaction.balanceBefore = lastBalance;

    await transaction.save();
    delete transaction.user;
    return transaction;
  }
}

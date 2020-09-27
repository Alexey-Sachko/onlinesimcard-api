import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ErrorType } from 'src/common/errors/error.type';
import { GetGqlUser } from 'src/users/get-user.decorator';
import { GqlAuthGuard } from 'src/users/gql-auth.guard';
import { User } from 'src/users/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';
import { TransactionGqlType } from './types/transaction.type';

@Resolver(of => TransactionGqlType)
export class TransactionsResolver {
  constructor(private readonly _transactionsService: TransactionsService) {}

  @Query(returns => [TransactionGqlType])
  transactions() {
    return this._transactionsService.getTransactions();
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(returns => [ErrorType], { nullable: true })
  createTransaction(
    @Args('createTransactionDto', { type: () => CreateTransactionDto })
    createTransactionDto: CreateTransactionDto,

    @GetGqlUser()
    user: User,
  ) {
    return this._transactionsService.createTransaction(
      createTransactionDto,
      user,
    );
  }
}

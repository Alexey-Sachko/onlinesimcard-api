import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ErrorType } from 'src/common/errors/error.type';
import { GqlAuthGuard } from 'src/users/gql-auth.guard';
import { Permissions } from 'src/users/permissions.enum';
import { MakeBonusInput } from './input/make-bonus.input';
import { TransactionsService } from './transactions.service';
import { TransactionGqlType } from './types/transaction.type';

@Resolver(of => TransactionGqlType)
export class TransactionsResolver {
  constructor(private readonly _transactionsService: TransactionsService) {}

  @UseGuards(GqlAuthGuard(Permissions.ReadAdminPage))
  @Query(returns => [TransactionGqlType])
  transactions() {
    return this._transactionsService.getTransactions();
  }

  @UseGuards(GqlAuthGuard(Permissions.MakeBonusMoney))
  @Mutation(returns => [ErrorType], { nullable: true })
  makeBonus(
    @Args('makeBonusInput', { type: () => MakeBonusInput })
    makeBonusInput: MakeBonusInput,
  ) {
    return this._transactionsService.apiMakeBonus(makeBonusInput);
  }
}

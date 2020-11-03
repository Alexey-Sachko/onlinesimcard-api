import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GetGqlUser } from 'src/users/get-user.decorator';
import { GqlAuthGuard } from 'src/users/gql-auth.guard';
import { User } from 'src/users/user.entity';
import { MakePaymentResType } from './gql-types/make-payment-res.type';
import { MakePaymentInput } from './input/make-payment.input';
import { PayService } from './pay.service';

@Resolver('Pay')
export class PayResolver {
  constructor(private readonly _payService: PayService) {}

  @UseGuards(GqlAuthGuard())
  @Mutation(returns => MakePaymentResType)
  async makePayment(
    @Args('makePaymenInput') makePaymenInput: MakePaymentInput,

    @GetGqlUser()
    user: User,
  ): Promise<MakePaymentResType> {
    return this._payService.makePayment(user, makePaymenInput);
  }
}

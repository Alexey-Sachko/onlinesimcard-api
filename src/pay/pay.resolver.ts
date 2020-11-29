import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { GetGqlUser } from 'src/users/get-user.decorator';
import { GqlAuthGuard } from 'src/users/gql-auth.guard';
import { User } from 'src/users/user.entity';
import { MakePaymentResType } from './gql-types/make-payment-res.type';
import { MakePaymentInput } from './input/make-payment.input';
import { OrderType } from './orders/order.gql-type';
import { OrdersService } from './orders/orders.service';
import { PayService } from './pay.service';

@Resolver('Pay')
export class PayResolver {
  constructor(
    private readonly _payService: PayService,
    private readonly _ordersService: OrdersService,
  ) {}

  @UseGuards(GqlAuthGuard())
  @Mutation(returns => MakePaymentResType)
  async makePayment(
    @Args('makePaymenInput') makePaymenInput: MakePaymentInput,

    @GetGqlUser()
    user: User,
  ): Promise<MakePaymentResType> {
    return this._payService.makePayment(user, makePaymenInput);
  }

  @UseGuards(GqlAuthGuard())
  @Query(returns => [OrderType])
  async myOrders(@GetGqlUser() user: User): Promise<OrderType[]> {
    return this._ordersService.getUserOrders(user.id);
  }
}

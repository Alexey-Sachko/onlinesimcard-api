import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ActivationsService } from './activations.service';
import { User } from 'src/users/user.entity';
import { CreateActivationInput } from './input/create-activation.input';
import { GqlAuthGuard } from 'src/users/gql-auth.guard';
import { GetGqlUser } from 'src/users/get-user.decorator';
import { ErrorType } from 'src/common/errors/error.type';
import { ActivationType } from './types/activation.type';

@Resolver('Activations')
export class ActivationsResolver {
  constructor(private readonly _acivationsService: ActivationsService) {}

  @UseGuards(GqlAuthGuard())
  @Query(returns => [ActivationType])
  async myCurrentActivations(
    @GetGqlUser()
    user: User,
  ) {
    return this._acivationsService.myCurrentActivations(user);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(returns => [ErrorType], { nullable: true })
  async createActivation(
    @GetGqlUser()
    user: User,

    @Args('createActivationInput')
    createActivationInput: CreateActivationInput,
  ) {
    //TODO validation
    return this._acivationsService.createActivation(
      user,
      createActivationInput,
    );
  }
}
import { CommandBus } from '@nestjs/cqrs';
import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { ActivationsService } from './activations.service';
import { User } from 'src/users/user.entity';
import { CreateActivationInput } from './input/create-activation.input';
import { GqlAuthGuard } from 'src/users/gql-auth.guard';
import { GetGqlUser } from 'src/users/get-user.decorator';
import { ErrorType } from 'src/common/errors/error.type';
import { ActivationType } from './types/activation.type';
import { CreateActivationCommand } from './commands/impl/create-activation.command';

@Resolver('Activations')
export class ActivationsResolver {
  constructor(
    private readonly _acivationsService: ActivationsService,
    private readonly _commandBus: CommandBus,
  ) {}

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

  @UseGuards(GqlAuthGuard())
  @Mutation(returns => [ErrorType], { nullable: true })
  async cancelActivation(
    @GetGqlUser()
    user: User,

    @Args('activationId', { type: () => Int }) activationId: number,
  ) {
    return this._acivationsService.cancelActivation(user, activationId);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(returns => [ErrorType], { nullable: true })
  async finishActivation(
    @GetGqlUser()
    user: User,

    @Args('activationId', { type: () => Int }) activationId: number,
  ) {
    return this._acivationsService.finishActivation(user, activationId);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(returns => ActivationType)
  async getNumber(
    @GetGqlUser()
    user: User,

    @Args('createActivationInput')
    createActivationInput: CreateActivationInput,
  ) {
    const x = await this._commandBus.execute(
      new CreateActivationCommand(user, createActivationInput),
    );

    return x;
  }
}

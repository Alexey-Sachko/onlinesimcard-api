import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { ActivationsService } from './activations.service';
import { User } from 'src/users/user.entity';
import { CreateActivationInput } from './input/create-activation.input';
import { GqlAuthGuard } from 'src/users/gql-auth.guard';
import { GetGqlUser } from 'src/users/get-user.decorator';
import { ErrorType } from 'src/common/errors/error.type';
import { ActivationType } from './types/activation.type';
import { Permissions } from 'src/users/permissions.enum';
import { GetActivationsInput } from './input/get-activations.input';
import { PaginationGqlInput } from 'src/common/pagination.gql-type';

@Resolver('Activations')
export class ActivationsResolver {
  constructor(private readonly _acivationsService: ActivationsService) {}

  @UseGuards(GqlAuthGuard())
  @Query(returns => [ActivationType])
  async myActivations(
    @GetGqlUser()
    user: User,

    @Args('pagination')
    pagination: PaginationGqlInput,

    @Args('isCurrent', { nullable: true })
    isCurrent?: boolean,
  ): Promise<ActivationType[]> {
    return this._acivationsService.getUsersActivations(pagination, {
      userId: user.id,
      isCurrent,
    });
  }

  @UseGuards(GqlAuthGuard())
  @Query(returns => Number)
  async myActivationsCount(
    @GetGqlUser()
    user: User,

    @Args('isCurrent', { nullable: true })
    isCurrent?: boolean,
  ): Promise<number> {
    return this._acivationsService.getActivationsCount({
      isCurrent,
      userId: user.id,
    });
  }

  @UseGuards(GqlAuthGuard(Permissions.ReadAdminPage))
  @Query(returns => [ActivationType])
  async activations(
    @Args('pagination')
    pagination: PaginationGqlInput,

    @Args('getActivationsInput', { nullable: true })
    getActivationsInput?: GetActivationsInput,
  ): Promise<ActivationType[]> {
    return this._acivationsService.getUsersActivations(
      pagination,
      getActivationsInput,
    );
  }

  @UseGuards(GqlAuthGuard(Permissions.WriteStubs))
  @Mutation(returns => [ErrorType], { nullable: true })
  async create100StubActivations(
    @GetGqlUser()
    user: User,

    @Args('createActivationInput')
    createActivationInput: CreateActivationInput,
  ) {
    return this._acivationsService.create100StubActivations(
      user,
      createActivationInput,
    );
  }

  @UseGuards(GqlAuthGuard(Permissions.WriteStubs))
  @Mutation(returns => [ErrorType], { nullable: true })
  async createStubActivation(
    @GetGqlUser()
    user: User,

    @Args('createActivationInput')
    createActivationInput: CreateActivationInput,
  ) {
    return this._acivationsService.createStubActivation(
      user,
      createActivationInput,
    );
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
    return this._acivationsService.finishActivationApi(user, activationId);
  }
}

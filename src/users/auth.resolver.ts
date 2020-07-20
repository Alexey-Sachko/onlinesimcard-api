import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { MyGqlContext } from '../common/my-gql-context';
import { ErrorType } from 'src/common/errors/error.type';
import { validate } from 'src/common/validate';
import { setTokenCookie } from './set-token-cookie';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { GetGqlUser } from './get-user.decorator';
import { GqlAuthGuard } from './gql-auth.guard';
import { MeResponse } from './types/me-response.type';

@Resolver('Auth')
export class AuthResolver {
  constructor(
    private readonly _authService: AuthService,
    private readonly _usersService: UsersService,
  ) {}

  @Query(returns => MeResponse)
  @UseGuards(GqlAuthGuard())
  async me(
    @GetGqlUser()
    user: User,
  ): Promise<MeResponse> {
    const role = await this._usersService.getUserRole(user);

    return {
      id: user.id,
      email: user.email,
      permissions: role?.permissions,
      firstName: user.fistName,
      lastName: user.lastName,
      balanceAmount: user.balanceAmount,
    };
  }

  @Mutation(returns => [ErrorType], { nullable: true })
  async login(
    @Context() context: MyGqlContext,
    @Args('authCredentialsDto')
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<ErrorType[] | null> {
    const validationErrors = await validate(
      authCredentialsDto,
      AuthCredentialsDto,
    );
    if (validationErrors) {
      return validationErrors;
    }

    const data = await this._authService.login(authCredentialsDto);

    if (data instanceof Array) {
      return data;
    }

    setTokenCookie(context.res, data);
    return null;
  }

  @Mutation(returns => Boolean)
  async logout(@Context() context: MyGqlContext) {
    context.res.clearCookie('accessToken');
    return true;
  }
}

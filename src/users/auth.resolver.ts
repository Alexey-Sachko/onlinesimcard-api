import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { MyGqlContext } from '../common/my-gql-context';
import { ErrorType } from 'src/common/errors/error.type';
import { validate } from 'src/common/validate';
import { setTokenCookie } from './set-token-cookie';
import { Permissions } from './permissions.enum';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { GetGqlUser } from './get-user.decorator';
import { GqlAuthGuard } from './gql-auth.guard';

@Resolver('Auth')
export class AuthResolver {
  constructor(
    private readonly _authService: AuthService,
    private readonly _usersService: UsersService,
  ) {}

  @Query(returns => [Permissions], { nullable: true })
  @UseGuards(GqlAuthGuard())
  async ownPermissions(
    @GetGqlUser()
    user: User,
  ): Promise<Permissions[] | null> {
    const role = await this._usersService.getUserRole(user);
    if (!role) {
      return null;
    }
    return role.permissions;
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

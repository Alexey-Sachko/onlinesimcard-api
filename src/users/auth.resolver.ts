import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { MyGqlContext } from '../common/my-gql-context';
import { ErrorType } from 'src/common/errors/error.type';
import { validate } from 'src/common/validate';
import { setTokenCookie } from './set-token-cookie';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly _authService: AuthService) {}

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

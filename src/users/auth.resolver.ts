import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponseType } from './types/auth-response.type';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { MyGqlContext } from '../../dist/common/my-gql-context.interface';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly _authService: AuthService) {}

  @Mutation(returns => AuthResponseType)
  async login(
    @Context() context: MyGqlContext,
    @Args('authCredentialsDto', ValidationPipe)
    authCredentialsDto: AuthCredentialsDto,
  ) {
    const data = await this._authService.login(authCredentialsDto);
    const res = context.res;
    res.cookie('accessToken', data.accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 15,
      path: '/',
    });
    return data;
  }

  @Mutation(returns => Boolean)
  async logout(@Context() context: MyGqlContext) {}
}

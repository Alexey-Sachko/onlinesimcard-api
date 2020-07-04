import {
  Resolver,
  Mutation,
  Args,
  Context,
  GraphQLExecutionContext,
  Query,
} from '@nestjs/graphql';
import { ValidationPipe, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponseType } from './types/auth-response.type';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { GqlAuthGuard } from './gql-auth.guard';

@Resolver(of => AuthResponseType)
export class AuthResolver {
  constructor(private readonly _authService: AuthService) {}

  @UseGuards(GqlAuthGuard)
  @Query(returns => Boolean)
  async something() {
    return false;
  }

  @Mutation(returns => AuthResponseType)
  async login(
    @Context() context: GraphQLExecutionContext,
    @Args('authCredentialsDto', ValidationPipe)
    authCredentialsDto: AuthCredentialsDto,
  ) {
    const data = await this._authService.login(authCredentialsDto);
    // @ts-ignore TODO
    const res: Response = context.res;
    res.cookie('accessToken', data.accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 15,
      path: '/',
    });
    return data;
  }
}
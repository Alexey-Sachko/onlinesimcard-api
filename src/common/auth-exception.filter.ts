import { Catch, ArgumentsHost } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { AuthenticationError } from 'apollo-server-express';

// Фильтр для выключени логирования Auth исключений
@Catch(AuthenticationError)
export class AuthExceptionFilter implements GqlExceptionFilter {
  catch(exception: AuthenticationError, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    return exception;
  }
}

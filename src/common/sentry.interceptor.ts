import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as Sentry from '@sentry/minimal';

const ignoreExceptions = [UnauthorizedException];

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(null, exception => {
        if (
          !ignoreExceptions.some(Exception => exception instanceof Exception)
        ) {
          Sentry.captureException(exception);
        }
      }),
    );
  }
}

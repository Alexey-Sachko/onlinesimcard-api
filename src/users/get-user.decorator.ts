import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../users/user.entity';

export const GetUser = createParamDecorator(
  (data: any, ctx: ExecutionContext): User => {
    return ctx.switchToHttp().getRequest().user;
  },
);

export const GetGqlUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context).getContext();
    return ctx.req.user;
  },
);

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthenticationError, ApolloError } from 'apollo-server-express';
import { JwtPayload } from './jwt-payload.type';
import { UsersService } from 'src/users/users.service';
import { Permissions } from './permissions.enum';
import { User } from './user.entity';
import { ErrorCodes } from '../common/error-codes.enum';

export function GqlAuthGuard(...neccessaryPermissions: Permissions[]) {
  @Injectable()
  class MixinGqlAuthGuard implements CanActivate {
    constructor(
      private readonly _jwtService: JwtService,
      private readonly _usersService: UsersService,
    ) {}

    private _extractToken(req: Request) {
      return req.cookies['accessToken'];
    }

    private async _authenticate(req: Request) {
      const token = this._extractToken(req);
      if (!token) {
        return null;
      }
      const { id }: JwtPayload = await this._jwtService.verifyAsync(token);
      const user = await this._usersService.getUserById(id);
      req.user = user;
      return user;
    }

    private _hasUserPersmissions(user: User) {
      if (!neccessaryPermissions) {
        return true;
      }

      return neccessaryPermissions.every(perm =>
        user.role?.permissions?.includes(perm),
      );
    }

    async canActivate(context: ExecutionContext) {
      const ctx = GqlExecutionContext.create(context);
      const req = ctx.getContext().req;
      const user = await this._authenticate(req);
      if (!user) {
        throw new AuthenticationError('Вы не авторизованы');
      }
      if (!this._hasUserPersmissions(user)) {
        throw new ApolloError('Нет доступа', ErrorCodes.FORBIDDEN);
      }

      return true;
    }
  }

  return mixin(MixinGqlAuthGuard);
}

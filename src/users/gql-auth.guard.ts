import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload.type';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
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
    const { email }: JwtPayload = await this._jwtService.verifyAsync(token);
    const user = await this._usersService.getUserByEmail(email);
    req.user = user;
    return user;
  }

  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const user = await this._authenticate(req);
    if (!user) {
      throw new UnauthorizedException();
    }

    return true;
  }
}

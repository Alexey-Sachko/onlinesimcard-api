import { PassportStrategy } from '@nestjs/passport';
import {
  UnauthorizedException,
  Inject,
  forwardRef,
  Body,
} from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { Strategy, VerifyCallback, VerifiedCallback } from 'passport-custom';
import { config } from 'dotenv';
import { JwtPayload } from './jwt-payload.type';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PERM_TOKEN_PREFIX } from './constants';

config();

const extractToken = ExtractJwt.fromAuthHeaderAsBearerToken();

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    super(handler);

    function handler(req: Request, done: VerifiedCallback) {
      let token = extractToken(req);
      if (!token) {
        done(true);
        return;
      }
      if (token.indexOf(PERM_TOKEN_PREFIX) === 0) {
      }
    }
  }

  async validate(payload: JwtPayload) {
    const { email } = payload;
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException(
        `Учетная запись с email "${email}" не существует`,
      );
    }

    return user;
  }
}

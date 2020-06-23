import { PassportStrategy } from '@nestjs/passport';
import { UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { Strategy, VerifiedCallback } from 'passport-custom';
import { config } from 'dotenv';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

config();

const extractToken = ExtractJwt.fromAuthHeaderAsBearerToken();

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private authService: AuthService,
  ) {
    super((req: Request, done: VerifiedCallback) => {
      const token = extractToken(req);
      if (!token) {
        done(new UnauthorizedException());
        return;
      }
      this.authService
        .validateToken(token)
        .then(user => done(null, user))
        .catch(err => done(err));
    });
  }
}

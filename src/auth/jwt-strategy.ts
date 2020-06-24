import { PassportStrategy, AbstractStrategy } from '@nestjs/passport';
import { UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-strategy';
import { config } from 'dotenv';
import { AuthService } from './auth.service';

config();

const extractToken = ExtractJwt.fromAuthHeaderAsBearerToken();

const DefaultStrategy = (name: string) =>
  class DefaultPassportStrategy extends Strategy {
    name = name;
  };

export class JwtStrategy extends PassportStrategy(DefaultStrategy('jwt-perm')) {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {
    super();
  }

  async authenticate(req: Request, options: any) {
    try {
      const token = extractToken(req);
      if (!token) {
        throw new UnauthorizedException();
      }
      const user = await this.authService.validateToken(token);
      this.success(user);
    } catch (error) {
      this.error(error);
    }
  }
}

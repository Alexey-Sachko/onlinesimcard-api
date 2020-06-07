import { PassportStrategy } from '@nestjs/passport';
import { UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { config } from 'dotenv';
import { JwtPayload } from './jwt-payload.type';
import { UsersService } from '../users/users.service';

config();

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
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

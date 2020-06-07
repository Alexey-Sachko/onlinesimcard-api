import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(authCredentialsDto: AuthCredentialsDto) {
    const email = await this.usersService.validatePassword(authCredentialsDto);
    if (!email) {
      throw new UnauthorizedException('Неправильные логин или пароль');
    }

    const payload: JwtPayload = { email };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }
}

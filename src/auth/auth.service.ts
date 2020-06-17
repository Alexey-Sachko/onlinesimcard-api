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
    const user = await this.usersService.validatePassword(authCredentialsDto);
    if (!user) {
      throw new UnauthorizedException('Неправильные логин или пароль');
    }

    const payload: JwtPayload = { email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }
}

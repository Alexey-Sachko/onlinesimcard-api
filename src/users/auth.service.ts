import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt-payload.type';
import { PermToken } from './perm-token.entity';
import { User } from '../users/user.entity';
import { PERM_TOKEN_PREFIX } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,

    @InjectRepository(PermToken)
    private permTokenRepository: Repository<PermToken>,
  ) {}

  async validateToken(tokenString: string): Promise<User | null> {
    if (tokenString.indexOf(PERM_TOKEN_PREFIX) === 0) {
      const permToken = await this.permTokenRepository.findOne(
        { value: tokenString },
        { relations: ['user'] },
      );
      if (!permToken) {
        throw new UnauthorizedException();
      }
      if (permToken.expires_at < new Date()) {
        throw new UnauthorizedException();
      }
      // TODO extract
      return permToken.user;
    }

    const { email }: JwtPayload = await this.jwtService.verifyAsync(
      tokenString,
    );
    const user = await this.usersService.getUserByEmail(email);
    return user;
  }

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
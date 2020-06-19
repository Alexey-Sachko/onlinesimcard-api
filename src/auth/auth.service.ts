import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt-payload.type';
import { PermToken } from './perm-token.entity';
import { User } from '../users/user.entity';
import { CreatePermTokenDto } from './dto/create-perm-token.dto';
import { PERM_TOKEN_PREFIX } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,

    @InjectRepository(PermToken)
    private permTokenRepository: Repository<PermToken>,
  ) {}

  async createPermToken(user: User, createPermTokenDto: CreatePermTokenDto) {
    const { expires_at, name } = createPermTokenDto;
    const permToken = new PermToken();
    permToken.expires_at = PermToken.prepareDate(expires_at);
    permToken.name = name;
    permToken.user = user;
    const payload: JwtPayload = { email: user.email, role: user.role };
    permToken.value =
      PERM_TOKEN_PREFIX + (await this.jwtService.signAsync(payload));
    await permToken.save();
    delete permToken.user;
    return permToken;
  }

  async getOwnPermTokens(user: User) {
    const permTokens = await this.permTokenRepository.find({ userId: user.id });
    return permTokens.map(perm => perm.toResponseObject());
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

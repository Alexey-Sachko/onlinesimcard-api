import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import moment from 'moment';
import { v1 as uuid } from 'uuid';

import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt-payload.type';
import { PermToken } from './perm-token.entity';
import { User } from '../users/user.entity';
import { PERM_TOKEN_PREFIX } from './constants';
import { ErrorType } from 'src/common/errors/error.type';
import { createError } from '../common/errors/create-error';
import { TokensDto } from './dto/tokens.dto';
import { RefreshToken } from './refresh-token.entity';
import { setTokenCookie } from './set-token-cookie';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,

    @InjectRepository(PermToken)
    private permTokenRepository: Repository<PermToken>,

    @InjectRepository(RefreshToken)
    private _refreshTokenRepository: Repository<RefreshToken>,
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

  private async _findRefreshToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this._refreshTokenRepository.findOne({
      where: {
        token,
      },
      relations: ['user'],
    });

    return refreshToken || null;
  }

  private async _createRefreshToken(userId: string): Promise<RefreshToken> {
    await this._refreshTokenRepository.delete({ userId }); // Удаляем старые

    const refreshToken = new RefreshToken();
    refreshToken.expiresAt = moment()
      .add(5, 'hours')
      .toDate();
    refreshToken.userId = userId;
    refreshToken.token = uuid();
    await refreshToken.save();
    return refreshToken;
  }

  async refreshToken(res: Response, req: Request) {
    const token = req.cookies['refreshToken'];
    if (!token) {
      throw new UnauthorizedException('missing cookie "refreshToken"');
    }

    const refreshTokenFound = await this._findRefreshToken(token);
    if (!refreshTokenFound) {
      throw new UnauthorizedException('refreshToken not found');
    }

    if (refreshTokenFound.expiresAt < new Date()) {
      // Удаляем протухший токен
      // TODO сделать cron задачу
      await this._refreshTokenRepository.delete({
        token: refreshTokenFound.token,
      });
      throw new UnauthorizedException('refreshToken has expired');
    }

    const tokens = await this.createTokensByUser(refreshTokenFound.user);
    setTokenCookie(res, tokens);
    res.send({ data: null });
  }

  async createTokensByUser(user: User): Promise<TokensDto> {
    const payload: JwtPayload = {
      email: user.email,
      id: user.id,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this._createRefreshToken(user.id);
    return { accessToken, refreshToken: refreshToken.token }; // TODO
  }

  async login(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<ErrorType[] | TokensDto> {
    const user = await this.usersService.validatePassword(authCredentialsDto);
    if (!user) {
      return [createError('email', 'Неправильные логин или пароль')];
    }

    if (!user.verified) {
      return [createError('email', 'Подтвердите учетную запись')];
    }

    const token = await this.createTokensByUser(user);
    return token;
  }

  async logout(userId: string): Promise<void> {
    await this._refreshTokenRepository.delete({ userId }); // Удаляем старые токены
  }
}

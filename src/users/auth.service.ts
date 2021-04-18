import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import moment from 'moment';
import { v1 as uuid } from 'uuid';

import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt-payload.type';
import { User } from '../users/user.entity';
import { ErrorType } from 'src/common/errors/error.type';
import { createError } from '../common/errors/create-error';
import { TokensDto } from './dto/tokens.dto';
import { RefreshToken } from './refresh-token.entity';
import { setTokenCookie } from './set-token-cookie';
import { validate } from 'src/common/validate';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,

    @InjectRepository(RefreshToken)
    private _refreshTokenRepository: Repository<RefreshToken>,
  ) {}

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

  async deleteAllUserRefreshTokens(user: User) {
    await this._refreshTokenRepository.delete({ userId: user.id });
  }

  async login(
    authCredentialsDto: AuthCredentialsDto,
    res: Response,
  ): Promise<ErrorType[]> {
    const validationErrors = await validate(
      authCredentialsDto,
      AuthCredentialsDto,
    );
    if (validationErrors) {
      return validationErrors;
    }

    const user = await this.usersService.validatePassword(authCredentialsDto);
    if (!user) {
      return [createError('email', 'Неправильные логин или пароль')];
    }

    if (!user.verified) {
      return [createError('email', 'Подтвердите учетную запись')];
    }

    await this.setUserTokens(user, res);
    return null;
  }

  async setUserTokens(user: User, res: Response) {
    const token = await this.createTokensByUser(user);
    setTokenCookie(res, token);
  }

  async logout(userId: string): Promise<void> {
    await this._refreshTokenRepository.delete({ userId }); // Удаляем старые токены
  }
}

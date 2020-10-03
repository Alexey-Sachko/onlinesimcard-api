import { Response } from 'express';

import { TokensDto } from './dto/tokens.dto';

const minute = 1000 * 60;
const hour = minute * 60;

export const setTokenCookie = (res: Response, tokensDto: TokensDto) => {
  const { accessToken, refreshToken } = tokensDto;

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: hour * 3,
    path: '/api/v1/auth/refresh',
  });

  return res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: minute * 15,
    path: '/',
  });
};

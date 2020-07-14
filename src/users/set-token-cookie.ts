import { Response } from 'express';

export const setTokenCookie = (res: Response, value: string) => {
  return res.cookie('accessToken', value, {
    httpOnly: true,
    maxAge: 1000 * 60 * 15,
    path: '/',
  });
};

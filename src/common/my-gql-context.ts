import { Request, Response } from 'express';

export type MyGqlContext = {
  req: Request;
  res: Response;
};

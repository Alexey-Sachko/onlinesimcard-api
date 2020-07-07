import { Request, Response } from 'express';

export interface MyGqlContext {
  req: Request;
  res: Response;
}

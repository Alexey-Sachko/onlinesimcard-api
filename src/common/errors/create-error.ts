import { ErrorType } from './error.type';

export const createError = (path: string, message: string): ErrorType => {
  const error = new ErrorType();
  error.path = path;
  error.message = message;
  return error;
};

import { ErrorType } from './error.type';

export const createError = (path: string, message: string): ErrorType => {
  return {
    path,
    message,
  };
};

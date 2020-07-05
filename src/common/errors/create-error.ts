import { ErrorType } from './error.type';
import { Constraint } from './constraint.type';

export const createError = (
  path: string,
  message: string,
  constraints?: Constraint[],
): ErrorType => {
  const err = new ErrorType();
  err.path = path;
  err.message = message;
  err.constraints = constraints;
  return err;
};

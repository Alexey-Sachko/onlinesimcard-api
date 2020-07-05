import { validate as _validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { ErrorType } from '../errors/error.type';
import { createError } from '../errors/create-error';

export const validate = async <T>(
  value: any,
  sourceCls: ClassType<T>,
): Promise<ErrorType[] | null> => {
  const parsedValue = plainToClass(sourceCls, value);
  const errors = await _validate(parsedValue);

  if (errors.length > 0) {
    return errors.map(err => {
      const constraints = Object.entries(
        err.constraints,
      ).map(([type, message]) => ({ type, message }));
      return createError(err.property, 'validation error', constraints);
    });
  }

  return null;
};

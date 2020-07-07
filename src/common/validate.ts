import { validate as _validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { ErrorType } from './errors/error.type';

export const validate = async <T>(
  value: any,
  sourceCls: ClassType<T>,
): Promise<ErrorType[] | null> => {
  const parsedValue = plainToClass(sourceCls, value);
  const errors = await _validate(parsedValue, {});

  if (errors.length > 0) {
    const result: ErrorType[] = errors.reduce((acc, err) => {
      Object.values(err.constraints).forEach(message => {
        acc.push({ path: err.property, message });
      });
      return acc;
    }, []);

    return result;
  }

  return null;
};

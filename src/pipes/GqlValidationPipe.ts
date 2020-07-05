import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ApolloError } from 'apollo-server-express';
import { ErrorCodes } from 'src/common/error-codes.enum';

@Injectable()
export class GqlValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      const transformedErrors = errors.map(err => ({
        path: err.property,
        constraints: err.constraints,
      }));
      throw new ApolloError(
        'validation error',
        ErrorCodes.VALIDATION,
        transformedErrors,
      );
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

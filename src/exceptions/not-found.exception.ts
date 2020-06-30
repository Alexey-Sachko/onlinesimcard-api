import { ApolloError } from 'apollo-server-express';
import { ErrorCodes } from './_error-codes.enum';

export class NotFoundException extends ApolloError {
  constructor(message?: string, extensions?: Record<string, any>) {
    super(message, ErrorCodes.NOT_FOUND, extensions);
  }
}

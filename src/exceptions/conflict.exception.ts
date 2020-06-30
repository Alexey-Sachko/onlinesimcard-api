import { ApolloError } from 'apollo-server-express';
import { ErrorCodes } from './_error-codes.enum';

export class ConflictException extends ApolloError {
  constructor(message?: string, extensions?: Record<string, any>) {
    super(message, ErrorCodes.CONFLICT, extensions);
  }
}

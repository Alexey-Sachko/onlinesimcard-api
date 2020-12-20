import { registerEnumType } from '@nestjs/graphql';

export enum FormMethod {
  POST = 'POST',
  GET = 'GET',
}

registerEnumType(FormMethod, { name: 'FormMethod' });

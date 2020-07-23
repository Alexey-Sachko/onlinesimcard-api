import { registerEnumType } from '@nestjs/graphql';

export enum AuthProviderType {
  VKONTAKTE = 'VKONTAKTE',
}
registerEnumType(AuthProviderType, { name: 'AuthProviderType' });

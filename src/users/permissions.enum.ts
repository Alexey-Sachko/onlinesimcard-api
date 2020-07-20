import { registerEnumType } from '@nestjs/graphql';

export enum Permissions {
  ReadUsers = 'ReadUsers',
  WriteUsers = 'WriteUsers',
  RolesRead = 'RolesRead',
  RolesWrite = 'RolesWrite',
  ReadEmail = 'ReadEmail',
  WriteEmail = 'WriteEmail',
  ReadAdminPage = 'ReadAdminPage',
  WriteArticles = 'WriteArticles',
  WriteServices = 'WriteServices',
}

registerEnumType(Permissions, {
  name: 'Permissions',
  description: 'Разрешения',
});

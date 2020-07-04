import { SetMetadata } from '@nestjs/common';
import { Permissions } from '../users/permissions.enum';

export const HasPermissions = (...permissions: Permissions[]) =>
  SetMetadata('permissions', permissions);

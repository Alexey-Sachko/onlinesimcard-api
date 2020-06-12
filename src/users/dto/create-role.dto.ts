import { Permissions } from '../permissions.enum';

export class CreateRoleDto {
  name: string;
  permissions: Permissions[];
}

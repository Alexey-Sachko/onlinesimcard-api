import { Role } from '../users/role.entity';

export type JwtPayload = {
  email: string;
  id: string;
  role: Role | null;
};

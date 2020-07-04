import { Role } from '../users/role.entity';

export type JwtPayload = {
  email: string;
  role: Role | null;
};

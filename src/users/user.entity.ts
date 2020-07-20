import {
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Entity,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { VerifyToken } from './verify-token.entity';
import { Role } from './role.entity';
import { AuthProvider } from './auth-provider.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  balanceAmount: number;

  @Column({ nullable: true })
  fistName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  salt?: string;

  @Column()
  verified: boolean;

  @Column({ nullable: true })
  roleId: number;

  @ManyToOne(
    type => Role,
    role => role.id,
  )
  role: Role;

  @OneToMany(
    type => AuthProvider,
    authProvider => authProvider.userId,
  )
  authProviders: AuthProvider[];

  @OneToMany(
    type => VerifyToken,
    token => token.userId,
  )
  verifyTokens: VerifyToken[];

  async validatePassword(password: string) {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}

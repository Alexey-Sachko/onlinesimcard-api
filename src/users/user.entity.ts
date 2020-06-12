import {
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Entity,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { VerifyToken } from './verify-token.entity';
import { Role } from './role.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  salt: string;

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
    type => VerifyToken,
    token => token.userId,
  )
  verifyTokens: VerifyToken[];

  async validatePassword(password: string) {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}

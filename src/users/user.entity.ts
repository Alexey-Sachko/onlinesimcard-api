import {
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Entity,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { VerifyToken } from './verify-token.entity';

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

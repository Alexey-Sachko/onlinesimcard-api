import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { AuthProviderType } from './auth-provider-type.enum';
import { User } from './user.entity';

@Entity()
export class AuthProvider extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @Column()
  type: AuthProviderType;

  @Column()
  userId: string;

  @ManyToOne(type => User, { onDelete: 'CASCADE' })
  user: User;
}

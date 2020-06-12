import {
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Entity,
  OneToMany,
} from 'typeorm';
import { Permissions } from './permissions.enum';
import { User } from './user.entity';

@Entity()
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'simple-array' })
  permissions: Permissions[];

  @OneToMany(
    type => User,
    user => user.id,
  )
  users: User[];
}

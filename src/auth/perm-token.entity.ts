import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import moment from 'moment';
import { v1 as uuidV1 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { PERM_TOKEN_PREFIX } from './constants';

@Entity()
export class PermToken extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  value: string;

  @Column({ type: 'date' })
  expires_at: Date;

  @Column()
  userId: string;

  @ManyToOne(
    type => User,
    user => user.id,
  )
  user: User;

  toResponseObject() {
    const copy = { ...this };
    delete copy.value;
    return copy;
  }

  static prepareDate(dateString?: string): Date {
    if (!dateString) {
      return moment()
        .add(1, 'month')
        .toDate();
    }
    return moment(dateString).toDate();
  }
}

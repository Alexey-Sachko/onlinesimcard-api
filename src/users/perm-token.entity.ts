import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import moment from 'moment';
import { User } from '../users/user.entity';

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

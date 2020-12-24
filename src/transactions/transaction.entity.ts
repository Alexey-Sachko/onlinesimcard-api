import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { TransactionType } from './transaction-type.enum';

@Entity()
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer' })
  amount: number;

  @Column({ type: 'integer' })
  balanceBefore: number;

  @Column({ type: 'varchar' })
  type: TransactionType;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  readonly createdAt: string;

  @Column()
  userId: string;

  @ManyToOne(
    type => User,
    user => user.id,
  )
  user: User;
}

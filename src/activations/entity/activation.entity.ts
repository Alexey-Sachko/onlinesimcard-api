import { PrimaryGeneratedColumn, Column, ManyToOne, Entity } from 'typeorm';
import { DefaultEntity } from 'src/common/default-entity';
import { User } from 'src/users/user.entity';
import { Transaction } from 'src/transactions/transaction.entity';
import { PriceEntity } from 'src/services/price.entity';
import { ActivationStatus } from '../types/activation-status.enum';

@Entity()
export class Activation extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ActivationStatus,
    default: ActivationStatus.NEW,
  })
  status: ActivationStatus;

  @Column()
  phoneNum: string;

  @Column()
  cost: number;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column()
  sourceActivationId: string;

  @Column()
  userId: string;

  @ManyToOne(
    type => User,
    user => user.id,
  )
  user: User;

  @ManyToOne(
    type => Transaction,
    transaction => transaction.id,
  )
  transaction: Transaction;

  @ManyToOne(
    type => PriceEntity,
    price => price.id,
  )
  price: PriceEntity;
}

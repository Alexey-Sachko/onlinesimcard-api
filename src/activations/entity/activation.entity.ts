import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Entity,
  OneToMany,
} from 'typeorm';
import { DefaultEntity } from 'src/common/default-entity';
import { User } from 'src/users/user.entity';
import { PriceEntity } from 'src/services/price.entity';
import { ActivationStatus } from '../types/activation-status.enum';
import { ActivationCode } from './activation-code.entity';
import { Transaction } from 'src/transactions/transaction.entity';

@Entity()
export class Activation extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ActivationStatus,
    default: ActivationStatus.WAIT_CODE,
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

  @Column({ nullable: true })
  transactionId: string;

  @ManyToOne(
    type => Transaction,
    transaction => transaction.id,
  )
  transaction: Transaction;

  @Column()
  priceId: number;

  @ManyToOne(
    type => PriceEntity,
    price => price.id,
  )
  price: PriceEntity;

  @OneToMany(
    type => ActivationCode,
    activationCode => activationCode.activation,
  )
  activationCodes: ActivationCode[];
}

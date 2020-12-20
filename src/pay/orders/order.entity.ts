import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from 'src/users/user.entity';
import { OrderStatus } from './order-status.enum';
import { DefaultEntity } from 'src/common/default-entity';
import { PaymentVariant } from '../input/payment-variant.enum';

@Entity()
export class OrderEntity extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  paymentId: string;

  @Column()
  amount: number;

  @Column()
  status: OrderStatus;

  @Column()
  userId: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column()
  formVariant: PaymentVariant;

  @ManyToOne(
    type => User,
    user => user.id,
  )
  user: User;
}

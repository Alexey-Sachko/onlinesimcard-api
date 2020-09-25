import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Entity,
  OneToMany,
  SaveOptions,
} from 'typeorm';
import { DefaultEntity } from 'src/common/default-entity';
import { User } from 'src/users/user.entity';
import { PriceEntity } from 'src/services/price.entity';
import { ActivationStatus } from '../types/activation-status.enum';
import { ActivationCode } from './activation-code.entity';

const saveHandlers: (() => void)[] = [];

const executeSubscribtions = async () => {
  await new Promise(res => {
    saveHandlers.forEach(handler => handler());
    res();
  });
};

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

  // @ManyToOne(
  //   type => Transaction,
  //   transaction => transaction.id,
  // )
  // transaction: Transaction;

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

  async save(options?: SaveOptions) {
    const result = await super.save(options);
    executeSubscribtions();
    return result;
  }

  static subscibeOnSave(handler: () => void) {
    saveHandlers.push(handler);
  }
}

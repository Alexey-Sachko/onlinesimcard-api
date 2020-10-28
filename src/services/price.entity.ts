import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { DefaultEntity } from 'src/common/default-entity';
import { Service } from './service.entity';

@Entity()
export class PriceEntity extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' }) // Хранение денежных сумм в целочисленных копейках
  amount: number;

  @Column()
  countryCode: string;

  @Column()
  serviceId: number;

  @ManyToOne(type => Service)
  service: Service;

  @DeleteDateColumn()
  deletedAt?: Date;
}

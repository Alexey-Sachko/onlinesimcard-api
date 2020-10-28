import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';
import { DefaultEntity } from 'src/common/default-entity';

@Entity()
export class Service extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}

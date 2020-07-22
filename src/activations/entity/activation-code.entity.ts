import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { DefaultEntity } from '../../common/default-entity';
import { Activation } from './activation.entity';

@Entity()
export class ActivationCode extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  activationId: number;

  @ManyToOne(
    type => Activation,
    activation => activation.id,
  )
  activation: Activation;
}

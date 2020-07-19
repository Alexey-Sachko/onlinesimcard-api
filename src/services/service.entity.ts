import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { DefaultEntity } from 'src/common/default-entity';

@Entity()
export class Service extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;
}

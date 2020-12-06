import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DefaultEntity } from 'src/common/default-entity';

@Entity()
export class ResetPassToken extends DefaultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column()
  email: string;
}

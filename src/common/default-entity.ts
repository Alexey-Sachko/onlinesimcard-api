import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class DefaultEntity extends BaseEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

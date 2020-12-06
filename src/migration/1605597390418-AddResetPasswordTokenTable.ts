import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class AddResetPasswordTokenTable1605597390418
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'reset_pass_token',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'uuid',
        },
        new TableColumn({
          name: 'expiresAt',
          type: 'timestamptz',
        }),
        new TableColumn({
          name: 'email',
          type: 'varchar',
        }),
        new TableColumn({
          name: 'createdAt',
          type: 'timestamp',
          default: 'now()',
        }),
        new TableColumn({
          name: 'updatedAt',
          type: 'timestamp',
          isNullable: true,
        }),
        new TableColumn({
          name: 'deletedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      ],
    });

    await queryRunner.createTable(table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reset_pass_token');
  }
}

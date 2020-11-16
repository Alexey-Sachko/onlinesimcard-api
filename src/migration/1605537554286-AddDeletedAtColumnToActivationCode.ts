import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDeletedAtColumnToActivationCode1605537554286
  implements MigrationInterface {
  private _created = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('activation_code', 'deletedAt'))) {
      this._created = true;
      await queryRunner.addColumn(
        'activation_code',
        new TableColumn({
          name: 'deletedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (this._created) {
      await queryRunner.dropColumn('activation_code', 'deletedAt');
    }
  }
}

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
import { PaymentVariant } from '../pay/input/payment-variant.enum';

export class AddFormVariantToOrderTable1608472250689
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'order_entity',
      new TableColumn({
        name: 'formVariant',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.query(
      `UPDATE order_entity SET "formVariant" = '${PaymentVariant.FREEKASSA}'`,
    );
    await queryRunner.changeColumn(
      'order_entity',
      'formVariant',
      new TableColumn({
        name: 'formVariant',
        type: 'varchar',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('order_entity', 'formVariant');
  }
}

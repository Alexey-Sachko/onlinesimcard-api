import { MigrationInterface, QueryRunner } from 'typeorm';

const changeTimestamp = ({
  column,
  table,
}: {
  table: string;
  column: string;
}) =>
  `alter table "${table}" alter column "${column}" type timestamp with time zone;`;

export class ChangeAddTimezone1605632422510 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      changeTimestamp({ table: 'activation', column: 'expiresAt' }),
    );

    await queryRunner.query(
      changeTimestamp({ table: 'activation', column: 'deletedAt' }),
    );
    await queryRunner.query(
      changeTimestamp({ table: 'activation', column: 'updatedAt' }),
    );
    await queryRunner.query(
      changeTimestamp({ table: 'activation', column: 'createdAt' }),
    );

    await queryRunner.query(
      changeTimestamp({ table: 'activation_code', column: 'deletedAt' }),
    );
    await queryRunner.query(
      changeTimestamp({ table: 'activation_code', column: 'updatedAt' }),
    );
    await queryRunner.query(
      changeTimestamp({ table: 'activation_code', column: 'createdAt' }),
    );

    await queryRunner.query(
      changeTimestamp({ table: 'order_entity', column: 'deletedAt' }),
    );
    await queryRunner.query(
      changeTimestamp({ table: 'order_entity', column: 'updatedAt' }),
    );
    await queryRunner.query(
      changeTimestamp({ table: 'order_entity', column: 'createdAt' }),
    );

    await queryRunner.query(
      changeTimestamp({ table: 'price_entity', column: 'deletedAt' }),
    );
    await queryRunner.query(
      changeTimestamp({ table: 'price_entity', column: 'updatedAt' }),
    );
    await queryRunner.query(
      changeTimestamp({ table: 'price_entity', column: 'createdAt' }),
    );

    await queryRunner.query(
      changeTimestamp({ table: 'refresh_token', column: 'expiresAt' }),
    );

    await queryRunner.query(
      changeTimestamp({ table: 'service', column: 'deletedAt' }),
    );
    await queryRunner.query(
      changeTimestamp({ table: 'service', column: 'updatedAt' }),
    );
    await queryRunner.query(
      changeTimestamp({ table: 'service', column: 'createdAt' }),
    );

    await queryRunner.query(
      changeTimestamp({ table: 'transaction', column: 'createdAt' }),
    );

    await queryRunner.query(
      changeTimestamp({ table: 'verify_token', column: 'created_at' }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // no revert
  }
}

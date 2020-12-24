import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { Money } from '../common/money';
import { Transaction } from '../transactions/transaction.entity';

export class ChangeTransactionsAmountType1608750268597
  implements MigrationInterface {
  private async _changeRows(queryRunner: QueryRunner) {
    const allUserIds = await queryRunner.query(
      'SELECT DISTINCT "userId" from "transaction"',
    );

    const result: {
      userId: string;
      transactions: Transaction[];
    }[] = await Promise.all(
      allUserIds.map(async ({ userId }) => {
        const userTransactions = await queryRunner.query(
          `SELECT * FROM "transaction" where "userId" = '${userId}' ORDER BY "createdAt" ASC`,
        );
        return { userId, transactions: userTransactions };
      }),
    );

    const filtered = result.filter(({ transactions }) =>
      transactions.some(({ amount }) => !Number.isInteger(amount)),
    );

    const calcBalance = (transactions: Transaction[]) => {
      return transactions.reduce((acc, { amount }) => acc + amount, 0);
    };

    const resultData = filtered.map(({ transactions, userId }) => {
      const oldBalance = calcBalance(transactions);

      const lastTransaction = transactions[transactions.length - 1];

      const nextTransactions = [];

      transactions.forEach((old, idx) => {
        const add = (balanceBefore: number) => {
          const newAmount = new Money(old.amount).toRoundMoreAmount();
          nextTransactions.push({
            ...old,
            amount: newAmount,
            balanceBefore,
          });
        };

        const prev = nextTransactions[idx - 1];
        if (prev) {
          const nextBalanceBefore = prev.amount + prev.balanceBefore;
          add(nextBalanceBefore);
        } else {
          add(0);
        }
      });

      return {
        userId,
        oldBalance,
        nextBalance: calcBalance(nextTransactions),
        transactionsBalance:
          lastTransaction.balanceBefore + lastTransaction.amount,
        transactions,
        nextTransactions,
      };
    });

    const transactionsToUpdate = resultData.reduce(
      (acc, { nextTransactions }) => {
        return [...acc, ...nextTransactions];
      },
      [] as Transaction[],
    );

    await Promise.all(
      transactionsToUpdate.map(async ({ id, amount, balanceBefore }) => {
        await queryRunner.query(`
        UPDATE "transaction"
        SET "amount" = ${amount}, "balanceBefore" = ${balanceBefore}
        WHERE "id" = '${id}'
      `);
      }),
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this._changeRows(queryRunner);

    await queryRunner.query(`
      ALTER TABLE "transaction"
      ALTER COLUMN "amount" TYPE integer;
    `);

    await queryRunner.query(`
      ALTER TABLE "transaction"
      ALTER COLUMN "balanceBefore" TYPE integer;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'transaction',
      'amount',
      new TableColumn({ name: 'amount', type: 'double' }),
    );

    await queryRunner.changeColumn(
      'transaction',
      'balanceBefore',
      new TableColumn({ name: 'balanceBefore', type: 'double' }),
    );
  }
}

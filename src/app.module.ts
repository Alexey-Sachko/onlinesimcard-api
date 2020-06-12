import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { VerifyToken } from './users/verify-token.entity';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { Transaction } from './transactions/transaction.entity';
import { ServicesModule } from './services/services.module';
import { Service } from './services/service.entity';
import { Role } from './users/role.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'alexey',
      password: 'example',
      database: 'onlinesimcard',
      entities: [User, VerifyToken, Transaction, Service, Role],
      synchronize: true,
    }),
    AuthModule,
    TransactionsModule,
    ServicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

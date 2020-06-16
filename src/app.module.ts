import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { VerifyToken } from './users/verify-token.entity';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { Transaction } from './transactions/transaction.entity';
import { ServicesModule } from './services/services.module';
import { Service } from './services/service.entity';
import { Role } from './users/role.entity';
import { TransformInterceptor } from './common/transform.interceptor';

dotenv.config();

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot({
      type: process.env.TYPEORM_CONNECTION as any,
      host: process.env.TYPEORM_HOST,
      port: parseInt(process.env.TYPEORM_PORT),
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      entities: [User, VerifyToken, Transaction, Service, Role],
      synchronize: !!process.env.TYPEORM_SYNCHRONIZE,
    }),
    AuthModule,
    TransactionsModule,
    ServicesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}

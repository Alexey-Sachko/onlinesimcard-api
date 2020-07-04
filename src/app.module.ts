import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { VerifyToken } from './users/verify-token.entity';
import { TransactionsModule } from './transactions/transactions.module';
import { Transaction } from './transactions/transaction.entity';
import { ServicesModule } from './services/services.module';
import { Service } from './services/service.entity';
import { Role } from './users/role.entity';
import { TransformInterceptor } from './common/transform.interceptor';
import { FreeModule } from './free/free.module';
import { ArticlesModule } from './articles/articles.module';
import { ArticleORM } from './articles/article.entity';
import { PermToken } from './users/perm-token.entity';

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
      entities: [
        User,
        VerifyToken,
        Transaction,
        Service,
        Role,
        PermToken,
        ArticleORM,
      ],
      synchronize: !!process.env.TYPEORM_SYNCHRONIZE,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      path: 'api/v1/graphql',
      context: ({ req, res }) => ({ req, res }),
    }),
    TransactionsModule,
    ServicesModule,
    FreeModule,
    ArticlesModule,
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

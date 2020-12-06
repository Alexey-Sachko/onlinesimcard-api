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
import { AuthProvider } from './users/auth-provider.entity';
import { PriceEntity } from './services/price.entity';
import { ActivationsModule } from './activations/activations.module';
import { Activation } from './activations/entity/activation.entity';
import { ActivationCode } from './activations/entity/activation-code.entity';
import { RefreshToken } from './users/refresh-token.entity';
import { BalanceModule } from './balance/balance.module';
import { OrderEntity } from './pay/orders/order.entity';
import { PayModule } from './pay/pay.module';
import { ResetPassToken } from './users/reset-pass/reset-pass-token.entity';

dotenv.config();

@Module({
  imports: [
    // StatusMonitorModule.setUp({
    //   pageTitle: 'Nest.js Monitoring Page',
    //   port: 4500,
    //   path: '/status',
    //   ignoreStartsWith: '/health/alive',
    //   spans: [
    //     {
    //       interval: 1, // Every second
    //       retention: 60, // Keep 60 datapoints in memory
    //     },
    //     {
    //       interval: 5, // Every 5 seconds
    //       retention: 60,
    //     },
    //     {
    //       interval: 15, // Every 15 seconds
    //       retention: 60,
    //     },
    //   ],
    //   chartVisibility: {
    //     cpu: true,
    //     mem: true,
    //     load: true,
    //     responseTime: true,
    //     rps: true,
    //     statusCodes: true,
    //   },
    //   healthChecks: [],
    // }),
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
        ArticleORM,
        AuthProvider,
        PriceEntity,
        Activation,
        ActivationCode,
        RefreshToken,
        OrderEntity,
        ResetPassToken,
      ],
      synchronize: JSON.parse(process.env.TYPEORM_SYNCHRONIZE || 'false'),
      migrationsRun: true,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      path: 'api/v1/graphql',
      cors: {
        credentials: true,
        origin: ['http://localhost:3000'],
      },
      context: ({ req, res }) => ({ req, res }),
    }),
    TransactionsModule,
    ServicesModule,
    FreeModule,
    ArticlesModule,
    ActivationsModule,
    BalanceModule,
    PayModule,
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

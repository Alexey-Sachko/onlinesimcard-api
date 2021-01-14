import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { Service } from './service.entity';
import { SmsActivateClient } from '../common/smsActivateClient/smsActivateClient';
import { ServicesResolver } from './services.resolver';
import { PriceEntity } from './price.entity';
import { UsersModule } from 'src/users/users.module';
import Axios from 'axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, PriceEntity]),
    PassportModule.register({
      defaultStrategy: 'jwt-perm',
    }),
    forwardRef(() => UsersModule),
  ],
  controllers: [],
  exports: [ServicesService],
  providers: [
    ServicesService,
    {
      provide: SmsActivateClient,
      useValue: new SmsActivateClient(
        Axios.create({
          baseURL: process.env.SMS_ACTIVATE_API_URL,
        }),
      ),
    },
    ServicesResolver,
  ],
})
export class ServicesModule {}

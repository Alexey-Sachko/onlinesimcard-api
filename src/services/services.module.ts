import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { Service } from './service.entity';
import { SmsActivateClient } from '../common/smsActivateClient/smsActivateClient';
import { ServicesResolver } from './services.resolver';
import { PriceEntity } from './price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, PriceEntity]),
    PassportModule.register({
      defaultStrategy: 'jwt-perm',
    }),
  ],
  controllers: [],
  providers: [ServicesService, SmsActivateClient, ServicesResolver],
})
export class ServicesModule {}

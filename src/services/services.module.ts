import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from './service.entity';
import { SmsActivateClient } from '../common/smsActivateClient/smsActivateClient';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service]),
    PassportModule.register({
      defaultStrategy: 'jwt-perm',
    }),
  ],
  controllers: [ServicesController],
  providers: [ServicesService, SmsActivateClient],
})
export class ServicesModule {}

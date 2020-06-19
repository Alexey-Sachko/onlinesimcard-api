import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from './service.entity';
import { SmsActivateClient } from '../common/smsActivateClient/smsActivateClient';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service]),
    PassportModule.register({
      defaultStrategy: 'custom',
    }),
  ],
  controllers: [ServicesController],
  providers: [ServicesService, SmsActivateClient],
})
export class ServicesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { EmailClient } from '../common/email.client';
import { VerifyToken } from './verify-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, VerifyToken])],
  controllers: [UsersController],
  providers: [UsersService, EmailClient],
  exports: [UsersService],
})
export class UsersModule {}

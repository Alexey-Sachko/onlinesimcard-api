import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { EmailClient } from '../common/email.client';
import { VerifyToken } from './verify-token.entity';
import { AuthModule } from '../auth/auth.module';
import { Role } from './role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, VerifyToken, Role]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, EmailClient],
  exports: [UsersService],
})
export class UsersModule {}

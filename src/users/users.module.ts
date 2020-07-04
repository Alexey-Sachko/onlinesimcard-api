import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { EmailClient } from '../common/email.client';
import { VerifyToken } from './verify-token.entity';
import { Role } from './role.entity';
import { AuthService } from './auth.service';
import { PermToken } from './perm-token.entity';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, VerifyToken, Role, PermToken]),
    PassportModule.register({
      defaultStrategy: 'jwt-perm',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, EmailClient, AuthService],
  exports: [UsersService],
})
export class UsersModule {}

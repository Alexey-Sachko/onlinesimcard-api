import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { EmailClient } from '../common/email.client';
import { VerifyToken } from './verify-token.entity';
import { Role } from './role.entity';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { AuthResolver } from './auth.resolver';
import { UserResolver } from './user.resolver';
import { AuthController } from './auth.controller';
import { VkAuthService } from './vk/vk-auth.service';
import { AuthProvider } from './auth-provider.entity';
import { RefreshToken } from './refresh-token.entity';
import { BalanceModule } from 'src/balance/balance.module';
import { ResetPassToken } from './reset-pass/reset-pass-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      VerifyToken,
      Role,
      AuthProvider,
      RefreshToken,
      ResetPassToken,
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt-perm',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    }),
    forwardRef(() => BalanceModule),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    EmailClient,
    AuthService,
    AuthResolver,
    UserResolver,
    VkAuthService,
  ],
  exports: [UsersService, JwtModule],
})
export class UsersModule {}

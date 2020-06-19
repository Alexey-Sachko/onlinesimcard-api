import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { SwaggerTags } from 'src/swagger/tags';
import { GetUser } from './get-user.decorator';
import { User } from '../users/user.entity';
import { CreatePermTokenDto } from './dto/create-perm-token.dto';

@ApiTags(SwaggerTags.Auth)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Залогиниться по логину и паролю' })
  @Post('/login')
  async login(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto) {
    return this.authService.login(authCredentialsDto);
  }

  @ApiOperation({ summary: 'Получить список персональных постоянных токенов' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/permtokens')
  async getOwnPermTokens(@GetUser() user: User) {
    return this.authService.getOwnPermTokens(user);
  }

  @ApiOperation({ summary: 'Создать персональный постоянный токен' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('/permtokens')
  async createPermToken(
    @GetUser() user: User,
    @Body(ValidationPipe) createPermTokenDto: CreatePermTokenDto,
  ) {
    return this.authService.createPermToken(user, createPermTokenDto);
  }
}

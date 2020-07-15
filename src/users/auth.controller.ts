import { Response } from 'express';
import { Controller, Get, Query, Res, ValidationPipe } from '@nestjs/common';
import { VkAuthService } from './vk/vk-auth.service';
import { VkCallbackQueryDto } from './vk/dto/vk-calback-query.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly _vkAuthService: VkAuthService) {}

  @Get('/vkontakte')
  async vk(
    @Res() res: Response,
    @Query('redirect_uri') redirect_uri: string | null,
  ) {
    return this._vkAuthService.authorize(res, redirect_uri);
  }

  @Get('/vkontakte/callback')
  async vkCallback(
    @Res() res: Response,
    @Query(ValidationPipe) vkCallbackQueryDto: VkCallbackQueryDto,
  ) {
    return this._vkAuthService.authorizeCallback(res, vkCallbackQueryDto);
  }
}

import { Response } from 'express';
import { Controller, Get, Query, Res, ValidationPipe } from '@nestjs/common';
import { VkAuthService } from './vk/vk-auth.service';
import { VkCakkbackQueryDto } from './vk/dto/vk-calback-query.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly _vkAuthService: VkAuthService) {}

  @Get('/vkontakte')
  async vk(@Res() res: Response) {
    return this._vkAuthService.authorize(res);
  }

  @Get('/vkontakte/callback')
  async vkCallback(
    @Query(ValidationPipe) vkCallbackQueryDto: VkCakkbackQueryDto,
  ) {
    return this._vkAuthService.authorizeCallback(vkCallbackQueryDto);
  }
}

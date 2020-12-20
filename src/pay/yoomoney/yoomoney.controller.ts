import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { yoomoneyClient } from '../client/yoomoney.client';
import { YoomoneyNotificationDto } from './dto/yoomoney-notification.dto';
import { YoomoneyService } from './yoomoney.service';

@Controller('/pay/yoomoney')
export class YoomoneyController {
  constructor(private readonly _yoomoneyService: YoomoneyService) {}

  @Post('/done')
  @UsePipes(new ValidationPipe({ transform: true }))
  async paymentDone(
    @Body()
    yoomoneyNotificationDto: YoomoneyNotificationDto,
  ) {
    const sign = yoomoneyClient.getNotificationSign(yoomoneyNotificationDto);
    if (sign !== yoomoneyNotificationDto.sha1_hash) {
      console.log(
        'wrong sign /pay/yoomoney/done body:',
        sign,
        yoomoneyNotificationDto,
      );
      throw new BadRequestException('sha1_hash is not valid');
    }

    return this._yoomoneyService.paymentDone(yoomoneyNotificationDto);
  }
}

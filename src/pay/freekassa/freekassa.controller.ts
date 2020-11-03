import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentDoneDto } from './dto/payment-done.dto';
import { FreekassaService } from './freekassa.service';

@Controller('/pay/freekassa')
export class FreekassaController {
  constructor(private readonly _freekassaService: FreekassaService) {}

  @Post('/done')
  async paymentDone(
    @Body() paymentDoneDto: PaymentDoneDto,
    @Res() res: Response,
  ) {
    const result = await this._freekassaService.paymentDone(paymentDoneDto);
    res.end(result);
  }
}

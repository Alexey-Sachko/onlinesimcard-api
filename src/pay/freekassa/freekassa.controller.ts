import { Body, Controller, Post, Headers, Res } from '@nestjs/common';
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
    @Headers('x-forwarded-for') ipAdress: string,
  ) {
    console.log('[freekassa done] ipAdress', ipAdress); // TODO

    const result = await this._freekassaService.paymentDone(
      paymentDoneDto,
      ipAdress,
    );
    res.end(result);
  }
}

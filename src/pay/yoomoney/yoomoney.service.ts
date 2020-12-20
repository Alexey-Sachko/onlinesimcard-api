import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { YoomoneyNotificationDto } from './dto/yoomoney-notification.dto';

@Injectable()
export class YoomoneyService {
  constructor(private readonly _ordersService: OrdersService) {}

  async paymentDone({
    label: orderId,
    amount,
    operation_id,
  }: YoomoneyNotificationDto) {
    await this._ordersService.completeOrder({
      amount,
      orderId,
      paymentId: operation_id,
    });
  }
}

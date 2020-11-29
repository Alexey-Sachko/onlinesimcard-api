import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
  WAIT_PAY = 'WAIT_PAY',
  ERROR = 'ERROR',
  PAID = 'PAID',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

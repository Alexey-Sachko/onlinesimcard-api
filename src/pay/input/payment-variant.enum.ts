import { registerEnumType } from '@nestjs/graphql';

export enum PaymentVariant {
  FREEKASSA = 'FREEKASSA',
  // INTERKASSA = 'INTERKASSA',
}

registerEnumType(PaymentVariant, { name: 'PaymentVariant' });

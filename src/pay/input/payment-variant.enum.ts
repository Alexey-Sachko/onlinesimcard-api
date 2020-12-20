import { registerEnumType } from '@nestjs/graphql';

export enum PaymentVariant {
  FREEKASSA = 'FREEKASSA',
  BANK_CARD = 'BANK_CARD',
  // INTERKASSA = 'INTERKASSA',
}

registerEnumType(PaymentVariant, { name: 'PaymentVariant' });

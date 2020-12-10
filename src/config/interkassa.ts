import * as dotenv from 'dotenv';

dotenv.config();

export const interkassaConfig = {
  merchantId: process.env.INTERKASSA_MERCHANT_ID,
};

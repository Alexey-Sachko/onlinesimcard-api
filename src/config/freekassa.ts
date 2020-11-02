import * as dotenv from 'dotenv';

dotenv.config();

export const freekassaConfig = {
  firstSecret: process.env.FREE_KASSA_FIRST_SECRET,
  secondSecret: process.env.FREE_KASSA_SECOND_SECRET,
  merchantId: process.env.FREE_KASSA_MERCHANT_ID,
};

import * as dotenv from 'dotenv';

dotenv.config();

export const mailConfig = {
  mailFromAdress: process.env.MAIL_FROM_ADRESS,
  mailFromName: process.env.MAIL_FROM_NAME,
};

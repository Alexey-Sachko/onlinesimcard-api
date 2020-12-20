import dotenv from 'dotenv';

dotenv.config();

export const yoomoneyConfig = {
  targetWallet: process.env.YOOMONEY_TARGET_WALLET,
  secret: process.env.YOOMONEY_SECRET,
};

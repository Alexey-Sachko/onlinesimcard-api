import * as dotenv from 'dotenv';

dotenv.config();

export const googleConfig = {
  CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
  CLEINT_SECRET: process.env.GOOGLE_OAUTH_SECRET,
};

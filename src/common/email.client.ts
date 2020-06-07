import * as sgMail from '@sendgrid/mail';
import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';

config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

@Injectable()
export class EmailClient {
  async sendEmail(options: sgMail.MailDataRequired) {
    try {
      const res = await sgMail.send(options);
      return res;
    } catch (error) {
      if (error.response) {
        const { message, code, response } = error;
        const { headers, body } = response;
        console.error(body); // TODO logging
      }
      throw error;
    }
  }
}

import Axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { GetAvailableNumbersRO, GetPricesRO } from './smsActivateClient.types';

config();

@Injectable()
export class SmsActivateClient {
  private Api: AxiosInstance;

  constructor() {
    this.Api = Axios.create({
      baseURL: process.env.SMS_ACTIVATE_API_URL,
    });
  }

  private callApi<ResponseType>(action: string, query?: Record<string, any>) {
    return this.Api.get<ResponseType>('', {
      params: {
        action,
        // eslint-disable-next-line @typescript-eslint/camelcase
        api_key: process.env.SMS_ACTIVATE_API_TOKEN,
        ...(query || {}),
      },
    });
  }

  private parseTextData(data: string) {
    const match = /([^:]*)(:(.*))?/.exec(data);
    const name = match[1];
    const value = match[3];
    return { name, value };
  }

  async hasService(code: string): Promise<boolean> {
    const numsCount = await this.getNumbersCount();
    if (`${code}_0` in numsCount) {
      return true;
    }
    return false;
  }

  async getNumbersCount() {
    const res = await this.callApi<GetAvailableNumbersRO | string>(
      'getNumbersStatus',
    );

    if (typeof res.data === 'string') {
      const { name } = this.parseTextData(res.data);
      throw new Error(`Ошибка sms-activate: '${name}'`);
    }

    return res.data;
  }

  async getBalance() {
    const res = await this.callApi<string>('getBalance');
    const { name, value } = this.parseTextData(res.data);

    if (name !== 'ACCESS_BALANCE') {
      throw new Error(`Ошибка sms-activate: '${name}'`);
    }

    return value;
  }

  async getNumber() {
    const res = await this.callApi<string>('getNumber');
    const { name, value } = this.parseTextData(res.data);

    if (name !== 'ACCESS_NUMBER') {
      throw new Error(`Ошибка sms-activate: '${name}'`);
    }

    const [operId, number] = value.split(':');
    return { operId, number };
  }

  async getPrices() {
    const res = await this.callApi<GetPricesRO>('getPrices');
    return res.data;
  }
}

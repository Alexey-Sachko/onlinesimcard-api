import { AxiosInstance, AxiosResponse } from 'axios';
import { from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Inject, Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { createEvent, restore } from 'effector';
import moment from 'moment';

import { GetAvailableNumbersRO, GetPricesRO } from './smsActivateClient.types';
import { SmsActivationStatus } from './sms-activation-status.enum';
import { NoNumbersException } from './exceptions/no-numbers.exception';
import { PricesCountMap } from './prices-count.map';

config();

// TODO вынести

const setCacheGetPricesAllCountries = createEvent<{
  data: GetPricesRO;
  time: Date;
}>();
const cacheGetPricesAllCountries = restore<{
  data: GetPricesRO;
  time: Date | null;
}>(setCacheGetPricesAllCountries, { data: {}, time: null });

@Injectable()
export class SmsActivateClient {
  // private Api: AxiosInstance;

  constructor(private readonly Api: AxiosInstance) {
    // this.Api =
    // TODO logger
  }

  private callApi<ResponseType>(action: string, query?: Record<string, any>) {
    return this.Api.get<ResponseType>('', {
      params: {
        action,
        // eslint-disable-next-line @typescript-eslint/camelcase
        api_key: process.env.SMS_ACTIVATE_API_TOKEN,
        ...(query || {}),
      },
      timeout: 30000,
    }).then(res => {
      this._checkHttpStatus(res);
      return res;
    });
  }

  private parseTextData(data: string) {
    const match = /([^:]*)(:(.*))?/s.exec(data);
    const name = match[1];
    const value = match[3];
    return { name, value };
  }

  private _checkHttpStatus(res: AxiosResponse): never | void {
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`Ошибка sms-activate: '${res.statusText}' ${res.status}`);
    }
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

  async getNumber(
    serviceCode: string,
    countryCode: string,
  ): Promise<{ operId: string; number: string } | NoNumbersException> {
    const res = await this.callApi<string>('getNumber', {
      service: serviceCode,
      country: countryCode,
    });
    const { name, value = '' } = this.parseTextData(res.data);

    if (res.status < 200 || res.status >= 300) {
      throw new Error(`Ошибка sms-activate: '${res.statusText}' ${res.status}`);
    }

    if (name === 'NO_NUMBERS') {
      return new NoNumbersException();
    }

    if (name !== 'ACCESS_NUMBER') {
      throw new Error(`Ошибка sms-activate: '${name}'`);
    }

    const [operId, number] = value.split(':');
    return { operId, number };
  }

  async getPricesAllCountries() {
    return this.getPrices();
  }

  async getPrices() {
    const cache = cacheGetPricesAllCountries.getState();

    if (
      moment(cache.time)
        .add(5, 'seconds')
        .isAfter(moment(new Date()))
    ) {
      return cache.data;
    }

    const res = await this.callApi<GetPricesRO>('getPrices');

    if (typeof res.data === 'string') {
      console.error(`Ошибка sms-activate: ${res.data}`);
      return cache.data;
    }

    setCacheGetPricesAllCountries({ time: new Date(), data: res.data });

    return res.data;
  }

  async getPriceCountMap() {
    const data = await this.getPrices();
    const pricesCountMap = new PricesCountMap(data);
    return pricesCountMap;
  }

  // async getNumberStub(serviceCode: string, countryCode: string) {
  //   const activation = {
  //     operId: uuid(),
  //     number: '+7' + Math.round(Math.random() * 10000000),
  //     status: SmsActivationStatus.STATUS_OK,
  //     code: 'asdasdad',
  //   };

  //   activationsSTUB[activation.operId] = activation;
  //   return activation;
  // }

  countRequests = 0;

  async getStatus(operId: string) {
    this.countRequests++;
    console.log('start getStatus', this.countRequests);

    const res = await this.callApi<string>('getStatus', { id: operId });
    const { name: status, value = '' } = this.parseTextData(res.data);

    if (
      !Object.values(SmsActivationStatus).includes(
        status as SmsActivationStatus,
      )
    ) {
      throw new Error(`Ошибка sms-activate: '${res.data}'`);
    }

    if (status === SmsActivationStatus.STATUS_WAIT_RETRY) {
      return { status, lastCode: value };
    }

    console.log('end getStatus', this.countRequests);

    return { status, code: value };
  }

  async cancelActivation(operId: string) {
    const res = await this.callApi<string>('setStatus', {
      id: operId,
      status: 8,
    });
    const { name: status, value = '' } = this.parseTextData(res.data);
    if (status !== SmsActivationStatus.ACCESS_CANCEL) {
      throw new Error(`Ошибка sms-activate: '${res.data}'`);
    }
    return true;
  }

  async finishActivation(operId: string) {
    const res = await this.callApi<string>('setStatus', {
      id: operId,
      status: 6,
    });

    const { name: status, value = '' } = this.parseTextData(res.data);
    if (status !== SmsActivationStatus.ACCESS_ACTIVATION) {
      throw new Error(`Ошибка sms-activate: '${res.data}'`);
    }
    return true;
  }
}

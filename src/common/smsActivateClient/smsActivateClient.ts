import Axios, { AxiosInstance } from 'axios';
import { from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { GetAvailableNumbersRO, GetPricesRO } from './smsActivateClient.types';
import { SmsActivationStatus } from './sms-activation-status.enum';
import { NoNumbersException } from './exceptions/no-numbers.exception';

config();

// TODO вынести
export class PricesCountMap {
  private readonly _countMap: Record<
    string,
    { price: number; count: number }[]
  >;

  constructor(private readonly _source: GetPricesRO) {
    this._countMap = Object.entries(_source).reduce(
      (acc, [country, serviceMap]) => {
        Object.entries(serviceMap).forEach(([service, priceMap]) => {
          acc[this._buildCountKey({ country, service })] = Object.entries(
            priceMap,
          ).map(([price, count]) => ({ price, count }));
        });

        return acc;
      },
      {},
    );
  }

  private _buildCountKey({
    country,
    service,
  }: {
    service: string;
    country: string;
  }) {
    return `${country}:${service}`;
  }

  getServiceCount({
    service,
    country,
    maxPrice,
  }: {
    country: string;
    service: string;
    maxPrice?: number;
  }): number {
    return (
      this._countMap[this._buildCountKey({ service, country })]
        ?.filter(({ price }) => (maxPrice ? price <= maxPrice : true))
        .reduce((total, { count }) => total + count, 0) || 0
    );
  }
}

@Injectable()
export class SmsActivateClient {
  private Api: AxiosInstance;

  constructor() {
    this.Api = Axios.create({
      baseURL: process.env.SMS_ACTIVATE_API_URL,
    });
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
    }).catch(() => process.exit(0));
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

  async getPrices({ country }: { country?: string }) {
    const res = await this.callApi<GetPricesRO>('getPrices', { country });
    const pricesCountMap = new PricesCountMap(res.data);
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

  getStatusObs(operId: string) {
    return from(
      this.callApi<string>('getStatus', { id: operId }),
    ).pipe(
      map(res => ({ ...this.parseTextData(res.data), res })),
      tap(({ name, res }) => {
        if (
          !Object.values(SmsActivationStatus).includes(
            name as SmsActivationStatus,
          )
        ) {
          throw new Error(`Ошибка sms-activate: '${res.data}'`);
        }
      }),
      map(({ name, value }) => {
        if (name === SmsActivationStatus.STATUS_WAIT_RETRY) {
          return { name, lastCode: value };
        }

        return { name, code: value };
      }),
    );
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

import { Injectable } from '@nestjs/common';
import Axios from 'axios';
import { FreeNumType } from './types/free-num.type';
import { FreeCountryType } from './types/free-country.type';
import { FreeMessagesType } from './types/free-messages.type';

const ONLINESIM = 'https://onlinesim.ru/api';

@Injectable()
export class FreeService {
  async getNumbers(country?: number): Promise<FreeNumType[]> {
    const res = await Axios.get(`${ONLINESIM}/getFreePhoneList`, {
      params: {
        country,
      },
    });
    return res.data.numbers;
  }

  async getCountries(): Promise<FreeCountryType[]> {
    const res = await Axios.get(`${ONLINESIM}/getFreeCountryList`);
    return res.data.countries;
  }

  async getMessagesByNumber(
    num: string,
    page?: number,
  ): Promise<FreeMessagesType> {
    const res = await Axios.get(`${ONLINESIM}/getFreeMessageList`, {
      params: {
        phone: num,
        page,
      },
    });
    return res.data.messages;
  }
}

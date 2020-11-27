import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { createEvent, createStore } from 'effector';
import moment from 'moment';

import { Service } from './service.entity';
import {
  PricesCountMap,
  SmsActivateClient,
} from '../common/smsActivateClient/smsActivateClient';
import { PriceEntity } from './price.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { ErrorType } from 'src/common/errors/error.type';
import { CountryApiType } from './types/country-api.type';
import { countriesDictionary } from './data/countries-dictionary';
import { createError } from 'src/common/errors/create-error';
import { CreateServiceWithPricesDto } from './dto/create-service-with-prices.dto';
import { ServiceType } from './types/service.type';
import { serviceDictionary } from './service-dictionary';
import { Money } from 'src/common/money';
import { PriceType } from './types/price.type';

const addNumbersCountCache = createEvent<{
  country: string;
  countMap: PricesCountMap;
  writeTime: Date;
}>();
const numbersCountCache = createStore<{
  [country: string]:
    | {
        writeTime: Date;
        countMap: PricesCountMap;
      }
    | undefined;
}>({}).on(addNumbersCountCache, (cache, { country, countMap, writeTime }) => ({
  ...cache,
  [country]: {
    countMap,
    writeTime,
  },
}));

const MIN_PRICE_MULTIPLIER = 1.15; // Коэффициент минимальной наценки

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly _serviceRepository: Repository<Service>,

    @InjectRepository(PriceEntity)
    private readonly _priceRepository: Repository<PriceEntity>,

    private readonly _smsActivateClient: SmsActivateClient,
  ) {}

  async getDisplayServices(countryCode: string): Promise<ServiceType[]> {
    const prices = await this.getDisplayPrices({ countryCode });

    const oldCountMap = numbersCountCache.getState()[countryCode];

    let apiCountMap: PricesCountMap;
    if (
      oldCountMap &&
      moment(oldCountMap.writeTime)
        .add(2, 'second')
        .isAfter(moment())
    ) {
      apiCountMap = oldCountMap.countMap;
    } else {
      apiCountMap = await this._smsActivateClient.getPrices({
        country: countryCode,
      });

      addNumbersCountCache({
        writeTime: new Date(),
        countMap: apiCountMap,
        country: countryCode,
      });
    }

    const services = await this._serviceRepository.find();
    const filtered: ServiceType[] = services
      .filter(service => prices.some(price => service.id === price.serviceId))
      .map(service => {
        const price = prices.find(
          price =>
            price.countryCode === countryCode && price.serviceId === service.id,
        );

        if (!price) {
          return null;
        }

        return {
          ...service,
          name: serviceDictionary[service.code],
          priceAmount: price.amount,
          count: apiCountMap.getServiceCount({
            service: service.code,
            country: countryCode,
            maxPrice: price.amount / MIN_PRICE_MULTIPLIER, // TODO сделать правильную цену
          }),
        };
      })
      .filter(Boolean);
    return filtered;
  }

  async getDisplayPrices(filter?: {
    countryCode?: string;
    serviceId?: number;
  }): Promise<PriceType[]> {
    const prices = await this.getPrices(filter);
    return prices.map(price => ({
      ...price,
      amount: new Money(price.amount).toDecimal(),
    }));
  }

  async getPrices(filter?: {
    countryCode?: string;
    serviceId?: number;
  }): Promise<PriceEntity[]> {
    const defaultFilter = {};

    if (filter) {
      Object.assign(defaultFilter, filter);
    }

    return this._priceRepository.find({ where: defaultFilter });
  }

  async getPrice(serviceCode: string, countryCode: string) {
    // TODO можно упростить 2 запросами: сначала найти сервис, а потом price по serviceId
    return this._priceRepository.findOne({
      join: { alias: 'price', leftJoin: { service: 'price.service' } },
      where: qb => {
        qb.where({ countryCode }).andWhere('service.code = :serviceCode', {
          serviceCode,
        });
      },
      relations: ['service'],
    });
  }

  async getPriceById(id: number) {
    return this._priceRepository.findOne(id, {
      relations: ['service'],
    });
  }

  async createOrUpdateService(
    createServiceDto: CreateServiceDto,
    countryCode: string,
    price: number,
  ): Promise<ErrorType[] | null> {
    const { code } = createServiceDto;
    const amount = price;

    if (!serviceDictionary[code]) {
      return [createError('code', `Нет такого сервиса '${code}' в словаре`)];
    }

    const serviceExists = await this._serviceRepository.findOne({
      where: { code },
    });

    if (serviceExists) {
      await serviceExists.save();

      const priceErrors = await this.createOrUpdatePrice({
        serviceCode: serviceExists.code,
        countryCode,
        amount,
      });

      return priceErrors;
    }

    if (!(await this._smsActivateClient.hasService(code))) {
      return [createError('code', `Нет такого сервиса '${code}' в API`)];
    }

    const service = new Service();
    service.code = code;
    await service.save();

    const priceErrors = await this.createOrUpdatePrice({
      serviceCode: service.code,
      countryCode,
      amount,
    });

    return priceErrors;
  }

  async deleteService(code: string): Promise<ErrorType[] | null> {
    const service = await this._serviceRepository.findOne({ code });
    if (!service) {
      return [createError('code', 'Нет сервиса с таким кодом')];
    }

    await this._priceRepository.softDelete({ serviceId: service.id });
    await service.softRemove();

    return null;
  }

  async restoreService(code: string): Promise<ErrorType[] | null> {
    const service = await this._serviceRepository.findOne({
      where: {
        code,
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
    });

    if (!service) {
      return [createError('code', 'Нет удаленного сервиса с таким кодом')];
    }

    await service.recover();

    const prices = await this._priceRepository.find({
      where: {
        deletedAt: Not(IsNull()),
        serviceId: service.id,
      },
      withDeleted: true,
    });

    await Promise.all(prices.map(price => price.recover()));

    return null;
  }

  async createOrUpdateServicesWithPrices(
    servicesWithPrices: CreateServiceWithPricesDto[],
    countryCode: string,
  ) {
    const promises = servicesWithPrices.map(async service => {
      const errors = await this.createOrUpdateService(
        service,
        countryCode,
        service.price,
      );
      if (errors) {
        return errors;
      }

      return null;
    });

    const allErrors = (await Promise.all(promises)).filter(Boolean);

    if (allErrors.length) {
      return allErrors.reduce(
        (acc, errors) => [...acc, ...errors],
        [] as ErrorType[],
      );
    }

    return null;
  }

  async createOrUpdatePrice(
    createPriceDto: CreatePriceDto,
  ): Promise<ErrorType[] | null> {
    const { amount, serviceCode, countryCode } = createPriceDto;
    const money = Money.fromDecimal(amount);

    if (!(countryCode in countriesDictionary)) {
      return [
        createError(
          'countryCode',
          `Нет поля '${countryCode}' в countriesDictionary`,
        ),
      ];
    }

    const service = await this._serviceRepository.findOne({
      where: {
        code: serviceCode,
      },
    });

    if (!service) {
      return [
        createError('serviceCode', `Нет сервиса с code: '${serviceCode}'`),
      ];
    }

    const priceFound = await this._priceRepository.findOne({
      where: {
        countryCode,
        serviceId: service.id,
      },
    });

    if (priceFound) {
      priceFound.amount = money.amount;
      await priceFound.save();
      return null;
    }

    const price = new PriceEntity();
    price.amount = money.amount;
    price.service = service;
    price.countryCode = countryCode;

    await price.save();
    return null;
  }

  async getApiCountries() {
    const pricesInfo = await this._smsActivateClient.getPrices({});
    const entries = Object.entries(pricesInfo);
    const countries: CountryApiType[] = entries
      .map(([code]) => ({
        code,
        name: countriesDictionary[code],
      }))
      .filter(({ name }) => Boolean(name));

    return countries;
  }
}

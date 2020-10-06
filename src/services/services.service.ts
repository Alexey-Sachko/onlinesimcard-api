import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Service } from './service.entity';
import { SmsActivateClient } from '../common/smsActivateClient/smsActivateClient';
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

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly _serviceRepository: Repository<Service>,

    @InjectRepository(PriceEntity)
    private readonly _priceRepository: Repository<PriceEntity>,

    private readonly _smsActivateClient: SmsActivateClient,
  ) {}

  async getServices(countryCode: string): Promise<ServiceType[]> {
    const prices = await this.getPrices(countryCode);

    const services = await this._serviceRepository.find();
    const filtered: ServiceType[] = services
      .filter(service => prices.some(price => service.id === price.serviceId))
      .map(service => ({
        ...service,
        name: serviceDictionary[service.code],
        priceAmount: prices.find(
          price =>
            price.countryCode === countryCode && price.serviceId === service.id,
        )?.amount,
      }));
    return filtered;
  }

  async createOrUpdateService(
    createServiceDto: CreateServiceDto,
    countryCode: string,
    price: number,
  ): Promise<ErrorType[] | null> {
    const { code } = createServiceDto;

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
        amount: price,
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
      amount: price,
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

  async getPrices(countryCode?: string): Promise<PriceEntity[]> {
    return this._priceRepository.find(
      countryCode ? { where: { countryCode } } : undefined,
    );
  }

  async getPricesByService(service: Service) {
    return this._priceRepository.find({ where: { serviceId: service.id } });
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

  async getPriceAmount(serviceCode: string, countryCode: string) {
    const price = await this.getPrice(serviceCode, countryCode);
    return price?.amount;
  }

  async createOrUpdatePrice(
    createPriceDto: CreatePriceDto,
  ): Promise<ErrorType[] | null> {
    const { amount, serviceCode, countryCode } = createPriceDto;

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
      priceFound.amount = amount;
      await priceFound.save();
      return null;
    }

    const price = new PriceEntity();
    price.amount = amount;
    price.service = service;
    price.countryCode = countryCode;

    await price.save();
    return null;
  }

  async getApiCountries() {
    const pricesInfo = await this._smsActivateClient.getPrices();
    const entries = Object.entries(pricesInfo);
    const countries: CountryApiType[] = entries
      .map(([code]) => ({
        code,
        name: countriesDictionary[code],
      }))
      .filter(({ name }) => Boolean(name));

    return countries;
  }

  async getApiPrices() {
    return this._smsActivateClient.getPrices();
  }
}

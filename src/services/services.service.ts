import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { SmsActivateClient } from '../common/smsActivateClient/smsActivateClient';
import { PriceEntity } from './price.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { ErrorType } from 'src/common/errors/error.type';
import { CountryApiType } from './types/country-api.type';
import { countriesDictionary } from './data/countries-dictionary';
import { createError } from 'src/common/errors/create-error';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly _serviceRepository: Repository<Service>,

    @InjectRepository(PriceEntity)
    private readonly _priceRepository: Repository<PriceEntity>,

    private readonly _smsActivateClient: SmsActivateClient,
  ) {}

  async getServices(): Promise<Service[]> {
    return this._serviceRepository.find();
  }

  async createOrUpdateService(
    createServiceDto: CreateServiceDto,
  ): Promise<ErrorType[] | null> {
    const { code, name } = createServiceDto;
    const serviceExists = await this._serviceRepository.findOne({
      where: { code },
    });

    if (serviceExists) {
      serviceExists.name = name;
      await serviceExists.save();
      return null;
    }

    if (!(await this._smsActivateClient.hasService(code))) {
      return [createError('code', `Нет такого сервиса '${code}' в API`)];
    }

    const service = new Service();
    service.code = code;
    service.name = name;
    await service.save();
    return null;
  }

  async getPrices(): Promise<PriceEntity[]> {
    return this._priceRepository.find();
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

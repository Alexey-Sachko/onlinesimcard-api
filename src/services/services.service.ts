import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { SmsActivateClient } from '../common/smsActivateClient/smsActivateClient';
import { PriceEntity } from './price.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { ErrorType } from 'src/common/errors/error.type';

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

  async createService(
    createServiceDto: CreateServiceDto,
  ): Promise<ErrorType | null> {
    const { code, name } = createServiceDto; // TODO check if service exists in api sms-hub
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

  async createOrUpdatePrice(
    createPriceDto: CreatePriceDto,
  ): Promise<ErrorType[] | null> {
    const { amount, serviceCode, countryCode } = createPriceDto; // TODO check existing country in api
    const service = await this._serviceRepository.findOne({
      where: {
        code: serviceCode,
      },
    });

    if (!service) {
      throw new Error(`Нет сервиса с code: '${serviceCode}'`);
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
}

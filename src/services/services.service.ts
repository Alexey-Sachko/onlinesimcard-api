import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { SmsActivateClient } from '../common/smsActivateClient/smsActivateClient';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    private smsActivateClient: SmsActivateClient,
  ) {}

  async getServices() {
    const services = await this.serviceRepository.find();
    const prices = await this.getPrices();
    const servicesWithPrices = services.map(service => {
      const price = prices[service.code];
      return { ...service, price };
    });

    return servicesWithPrices;
  }

  async createService(createServiceDto: CreateServiceDto) {
    const { code, name } = createServiceDto;
    const smsActivateServices = await this.smsActivateClient.getNumbersStatus();

    if (!smsActivateServices[`${code}_0`]) {
      throw new BadRequestException(
        `сервис с code: '${code}' отстутствует у sms-activate`,
      );
    }

    const service = new Service();
    service.code = code;
    service.name = name;
    try {
      await service.save();
      return service;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(`сервис с code: '${code}' уже существует`);
      } else {
        throw error;
      }
    }
  }

  async deleteService(id: string) {
    const rows = await this.serviceRepository.delete({ id });
    if (!rows.affected) {
      throw new NotFoundException(`нет сервиса с id: '${id}'`);
    }
  }

  private async getPrices() {
    return this.smsActivateClient.getPrices();
  }
}

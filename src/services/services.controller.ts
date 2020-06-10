import {
  Controller,
  Post,
  Get,
  Body,
  ValidationPipe,
  Delete,
  Param,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get()
  async getServices() {
    return this.servicesService.getServices();
  }

  @Post()
  async createService(
    @Body(ValidationPipe)
    createServiceDto: CreateServiceDto,
  ) {
    return this.servicesService.createService(createServiceDto);
  }

  @Delete(':id')
  async deleteService(@Param('id') id: string) {
    return this.servicesService.deleteService(id);
  }
}

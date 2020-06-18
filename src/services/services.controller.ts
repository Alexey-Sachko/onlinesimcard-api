import {
  Controller,
  Post,
  Get,
  Body,
  ValidationPipe,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServicesService } from './services.service';
import { SwaggerTags } from 'src/swagger/tags';

@ApiTags(SwaggerTags.Services)
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

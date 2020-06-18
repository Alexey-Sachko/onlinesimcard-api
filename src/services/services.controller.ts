import {
  Controller,
  Post,
  Get,
  Body,
  ValidationPipe,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateServiceDto } from './dto/create-service.dto';
import { ServicesService } from './services.service';
import { SwaggerTags } from 'src/swagger/tags';
import { AuthGuard } from '@nestjs/passport';

@ApiTags(SwaggerTags.Services)
@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @ApiOperation({
    summary: 'Получить список сервисов с ценами и количеством номеров',
  })
  @Get()
  async getServices() {
    return this.servicesService.getServices();
  }

  // TODO permissions
  @ApiOperation({ summary: 'Добавить сервис' })
  @UseGuards(AuthGuard())
  @Post()
  async createService(
    @Body(ValidationPipe)
    createServiceDto: CreateServiceDto,
  ) {
    return this.servicesService.createService(createServiceDto);
  }

  @ApiOperation({ summary: 'Удалить сервис' })
  @UseGuards(AuthGuard())
  @Delete(':id')
  async deleteService(@Param('id') id: string) {
    return this.servicesService.deleteService(id);
  }
}

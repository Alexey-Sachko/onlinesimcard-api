import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { validate } from 'src/common/validate';
import { ErrorType } from 'src/common/errors/error.type';
import { ServiceType } from './types/service.type';
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceType } from './types/price.type';
import { Service } from './service.entity';
import { CountryApiType } from './types/country-api.type';

@Resolver(of => ServiceType)
export class ServicesResolver {
  constructor(private readonly _servicesService: ServicesService) {}

  @Query(returns => [CountryApiType])
  async countriesFromApi() {
    return this._servicesService.getApiCountries();
  }

  async pricesFromApi() {
    return this._servicesService.getApiPrices();
  }

  @Query(returns => [ServiceType])
  async services() {
    return this._servicesService.getServices();
  }

  @ResolveField(returns => [PriceType])
  async prices(@Parent() service: Service) {
    return this._servicesService.getPricesByService(service);
  }

  @Mutation(returns => [ErrorType], { nullable: true })
  async saveService(
    @Args('createServiceDto') createServiceDto: CreateServiceDto,
  ) {
    const errors = await validate(createServiceDto, CreateServiceDto);
    if (errors) {
      return errors;
    }
    return this._servicesService.createOrUpdateService(createServiceDto);
  }

  @Mutation(returns => [ErrorType], { nullable: true })
  async savePrice(
    @Args('createPriceDto')
    createPriceDto: CreatePriceDto,
  ): Promise<ErrorType[] | null> {
    const errors = await validate(createPriceDto, CreatePriceDto);
    if (errors) {
      return errors;
    }

    return this._servicesService.createOrUpdatePrice(createPriceDto);
  }
}
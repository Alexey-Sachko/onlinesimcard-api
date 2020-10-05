import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { validate } from 'src/common/validate';
import { ErrorType } from 'src/common/errors/error.type';
import { ServiceType } from './types/service.type';
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceType } from './types/price.type';
import { Service } from './service.entity';
import { CountryApiType } from './types/country-api.type';
import { GqlAuthGuard } from 'src/users/gql-auth.guard';
import { Permissions } from 'src/users/permissions.enum';
import { CreateServiceWithPricesDto } from './dto/create-service-with-prices.dto';

@Resolver(of => ServiceType)
export class ServicesResolver {
  constructor(private readonly _servicesService: ServicesService) {}

  @Query(returns => [CountryApiType])
  async countriesFromApi() {
    return this._servicesService.getApiCountries();
  }

  @Query(returns => [ServiceType])
  async services(@Args('countryCode') countryCode: string) {
    return this._servicesService.getServices(countryCode);
  }

  @Query(returns => [PriceType])
  async prices() {
    return this._servicesService.getPrices();
  }

  @UseGuards(GqlAuthGuard(Permissions.WriteServices))
  @Mutation(returns => [ErrorType], { nullable: true })
  async saveService(
    @Args('createServiceDto') createServiceDto: CreateServiceDto,
    @Args('countryCode') countryCode: string,
    @Args('price') price: number,
  ) {
    const errors = await validate(createServiceDto, CreateServiceDto);
    if (errors) {
      return errors;
    }
    return this._servicesService.createOrUpdateService(
      createServiceDto,
      countryCode,
      price,
    );
  }

  @UseGuards(GqlAuthGuard(Permissions.WriteServices))
  @Mutation(returns => [ErrorType], { nullable: true })
  async saveServicesWithPrices(
    @Args('servicesWithPrices', { type: () => [CreateServiceWithPricesDto] })
    servicesWithPrices: CreateServiceWithPricesDto[],

    @Args('countryCode') countryCode: string,
  ) {
    return this._servicesService.createOrUpdateServicesWithPrices(
      servicesWithPrices,
      countryCode,
    );
  }

  @UseGuards(GqlAuthGuard(Permissions.WriteServices))
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

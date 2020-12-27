import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { validate } from 'src/common/validate';
import { ErrorType } from 'src/common/errors/error.type';
import { ServiceType } from './types/service.type';
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceType } from './types/price.type';
import { CountryType } from './types/country-api.type';
import { GqlAuthGuard } from 'src/users/gql-auth.guard';
import { Permissions } from 'src/users/permissions.enum';
import { CreateServiceWithPricesDto } from './dto/create-service-with-prices.dto';
import { serviceDictionary } from './service-dictionary';
import { ServiceDictionaryItemType } from './types/service-dictionary-item.type';
import { CountriesQueryInput } from './input/country-query.input';
import { ServiceFromApi } from './types/api-services-count';
import { ServicesApiQueryInput } from './input/services-api-query.input';

@Resolver(of => ServiceType)
export class ServicesResolver {
  constructor(private readonly _servicesService: ServicesService) {}

  @UseGuards(GqlAuthGuard())
  @Query(returns => [CountryType])
  async countries(
    @Args('countriesQueryInput', { nullable: true })
    countriesQueryInput?: CountriesQueryInput,
  ) {
    return this._servicesService.getCountries(countriesQueryInput);
  }

  @UseGuards(GqlAuthGuard())
  @Query(returns => [ServiceType])
  async services(@Args('countryCode') countryCode: string) {
    return this._servicesService.getDisplayServices(countryCode);
  }

  @UseGuards(GqlAuthGuard())
  @Query(returns => [PriceType])
  async prices() {
    return this._servicesService.getDisplayPrices();
  }

  @Query(returns => [ServiceDictionaryItemType])
  async allServices() {
    return Object.entries(serviceDictionary).map(([code, name]) => ({
      code,
      name,
    }));
  }

  @UseGuards(GqlAuthGuard())
  @Query(returns => [ServiceFromApi])
  async apiServices(
    @Args('servicesApiQueryInput') servicesApiQueryInput: ServicesApiQueryInput,
  ) {
    return this._servicesService.getApiServices(servicesApiQueryInput);
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
  async deleteService(@Args('code') code: string) {
    return this._servicesService.deleteService(code);
  }

  @UseGuards(GqlAuthGuard(Permissions.WriteServices))
  @Mutation(returns => [ErrorType], { nullable: true })
  async restoreService(@Args('code') code: string) {
    return this._servicesService.restoreService(code);
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

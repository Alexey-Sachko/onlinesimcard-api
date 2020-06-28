import { Resolver, Query, ResolveField } from '@nestjs/graphql';
import { FreeCountryType } from './types/free-country.type';
import { FreeService } from './free.service';
import { FreeMessageType } from './types/free-message.type';

@Resolver(of => FreeCountryType)
export class FreeResolver {
  constructor(private readonly _freeService: FreeService) {}

  @Query(returns => [FreeCountryType])
  async freeCountries() {
    const countries = await this._freeService.getCountries();
    return countries;
  }

  @Query(returns => FreeCountryType)
  async freeCountry() {
    return {
      country: 1,
      country_text: 'adasdsad',
    };
  }

  @Query(returns => FreeMessageType)
  freeMessage() {
    return {
      text: 'string',
    };
  }
}

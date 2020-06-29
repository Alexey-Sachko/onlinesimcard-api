import { Resolver, Query, ResolveField, Parent } from '@nestjs/graphql';
import { FreeCountryType } from './types/free-country.type';
import { FreeService } from './free.service';
import { FreeNumType } from './types/free-num.type';

@Resolver(of => FreeCountryType)
export class FreeCountryResolver {
  constructor(private readonly _freeService: FreeService) {}

  @Query(returns => [FreeCountryType])
  freeCountries() {
    return this._freeService.getCountries();
  }

  @ResolveField(type => [FreeNumType])
  numbers(@Parent() country: FreeCountryType) {
    return this._freeService.getNumbers(country.country);
  }
}

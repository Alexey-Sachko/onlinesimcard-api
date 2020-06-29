import { Module } from '@nestjs/common';
import { FreeService } from './free.service';
import { FreeCountryResolver } from './free-country.resolver';
import { FreeNumberResolver } from './free-number.resolver';

@Module({
  providers: [FreeService, FreeCountryResolver, FreeNumberResolver],
})
export class FreeModule {}

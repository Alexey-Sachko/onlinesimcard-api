import { Module } from '@nestjs/common';
import { FreeService } from './free.service';
import { FreeResolver } from './free.resolver';

@Module({
  providers: [FreeService, FreeResolver],
})
export class FreeModule {}

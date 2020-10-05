import { Field, InputType } from '@nestjs/graphql';
import { CreateServiceDto } from './create-service.dto';

@InputType()
export class CreateServiceWithPricesDto extends CreateServiceDto {
  @Field()
  price: number;
}

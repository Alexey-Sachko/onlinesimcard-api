import { Field, InputType } from '@nestjs/graphql';
import { CreateServiceDto } from './create-service.dto';

@InputType()
class Price {
  @Field()
  amount: number;

  @Field()
  countryCode: string;
}

@InputType()
export class CreateServiceWithPricesDto extends CreateServiceDto {
  @Field(type => [Price])
  prices: Price[];
}

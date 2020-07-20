import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePriceDto {
  @Field()
  serviceCode: string;

  @Field()
  countryCode: string;

  @Field()
  amount: number;
}

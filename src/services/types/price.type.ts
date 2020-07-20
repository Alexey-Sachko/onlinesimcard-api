import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class PriceType {
  @Field()
  id: number;

  @Field()
  amount: number;

  @Field()
  countryCode: string;

  @Field()
  serviceId: number;
}

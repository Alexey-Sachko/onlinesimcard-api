import { ObjectType, Field } from '@nestjs/graphql';
import { PriceType } from './price.type';

@ObjectType()
export class ServiceType {
  @Field()
  id: number;

  @Field()
  code: string;

  @Field()
  name: string;

  @Field(type => [PriceType])
  prices: PriceType[];
}

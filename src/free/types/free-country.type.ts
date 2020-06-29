import { ObjectType, Field, Int } from '@nestjs/graphql';
import { FreeNumType } from './free-num.type';

@ObjectType()
export class FreeCountryType {
  @Field(type => Int)
  country: number;

  @Field({ nullable: true })
  country_text: string;

  @Field(type => [FreeNumType])
  numbers: FreeNumType[];
}

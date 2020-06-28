import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType('FreeCountryType')
export class FreeCountryType {
  @Field(type => Int)
  country: number;

  @Field({ nullable: true })
  country_text: string;
}

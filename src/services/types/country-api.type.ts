import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CountryType {
  @Field()
  code: string;

  @Field()
  alpha2Code: string;

  @Field({ nullable: true })
  name: string;
}

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CountryApiType {
  @Field()
  code: string;

  @Field({ nullable: true })
  name: string;
}

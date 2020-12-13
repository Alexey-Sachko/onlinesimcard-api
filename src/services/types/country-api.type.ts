import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CountryType {
  @Field()
  code: string;

  @Field({ nullable: true })
  name: string;
}

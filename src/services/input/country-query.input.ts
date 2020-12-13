import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CountriesQueryInput {
  @Field({ nullable: true })
  notEmpty?: boolean;
}

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ServicesApiQueryInput {
  @Field()
  country: string;
}

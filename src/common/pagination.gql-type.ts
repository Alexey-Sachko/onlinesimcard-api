import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PaginationGqlInput {
  @Field()
  limit: number;

  @Field()
  offset: number;
}

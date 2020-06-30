import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ArticleType {
  @Field(type => ID)
  id: number;

  @Field()
  alias: string;

  @Field()
  title: string;

  @Field()
  text: string;
}

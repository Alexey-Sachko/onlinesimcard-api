import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateArticleDto {
  @Field()
  alias: string;

  @Field()
  title: string;

  @Field()
  text: string;
}

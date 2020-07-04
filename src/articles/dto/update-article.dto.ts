import { Field, InputType, Int } from '@nestjs/graphql';
import { CreateArticleDto } from './create-article.dto';

@InputType()
export class UpdateArticleDto extends CreateArticleDto {
  @Field(type => Int)
  id: number;
}

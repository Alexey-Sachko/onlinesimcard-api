import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateArticleDto {
  @IsNotEmpty()
  @Field()
  alias: string;

  @IsNotEmpty()
  @Field()
  title: string;

  @Field()
  text: string;
}

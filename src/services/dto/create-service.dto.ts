import { MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateServiceDto {
  @MinLength(1)
  @Field()
  code: string;

  @MinLength(1)
  @Field()
  name: string;
}

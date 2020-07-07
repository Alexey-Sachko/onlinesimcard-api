import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ErrorType {
  @Field()
  path: string;

  @Field()
  message: string;
}

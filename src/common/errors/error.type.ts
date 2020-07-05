import { ObjectType, Field } from '@nestjs/graphql';
import { Constraint } from './constraint.type';

@ObjectType()
export class ErrorType {
  @Field()
  path: string;

  @Field()
  message: string;

  @Field(type => [Constraint], { nullable: true })
  constraints?: Constraint[];
}

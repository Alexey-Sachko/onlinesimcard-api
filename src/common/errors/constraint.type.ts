import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Constraint {
  @Field({ nullable: true })
  type?: string;

  @Field()
  message: string;
}

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Permissions } from '../permissions.enum';

@ObjectType()
export class MeResponse {
  @Field(type => ID)
  id: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(type => [Permissions], { nullable: true })
  permissions: Permissions[];
}

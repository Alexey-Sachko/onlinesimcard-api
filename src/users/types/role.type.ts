import { ObjectType, Field } from '@nestjs/graphql';
import { Permissions } from '../permissions.enum';

@ObjectType()
export class RoleType {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field(type => [Permissions])
  permissions: Permissions[];
}

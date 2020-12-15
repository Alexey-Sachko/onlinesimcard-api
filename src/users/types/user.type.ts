import { ObjectType, Field } from '@nestjs/graphql';
import { RoleType } from './role.type';

@ObjectType()
export class UserType {
  @Field()
  id: string;

  @Field({ nullable: true })
  email?: string;

  @Field(type => RoleType, { nullable: true })
  role: RoleType;

  @Field()
  balance: number;
}

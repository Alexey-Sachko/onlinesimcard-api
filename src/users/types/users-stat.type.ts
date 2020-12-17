import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UsersStat {
  @Field()
  totalBalance: number;

  @Field()
  usersCount: number;
}

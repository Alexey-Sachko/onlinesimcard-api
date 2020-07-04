import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthResponseType {
  @Field()
  accessToken: string;
}

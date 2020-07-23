import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ActivationCodeType {
  @Field()
  id: number;

  @Field()
  code: string;

  @Field()
  activationId: number;
}

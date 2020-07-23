import { ObjectType, Field } from '@nestjs/graphql';
import { ActivationStatus } from './activation-status.enum';
import { ActivationCodeType } from './activation-code.type';

@ObjectType()
export class ActivationType {
  @Field()
  id: number;

  @Field(type => ActivationStatus)
  status: ActivationStatus;

  @Field()
  phoneNum: string;

  @Field()
  cost: number;

  @Field()
  expiresAt: Date;

  @Field()
  sourceActivationId: string;

  @Field(type => [ActivationCodeType])
  activationCodes: ActivationCodeType[];
}

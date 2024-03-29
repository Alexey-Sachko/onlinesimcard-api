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
  serviceCode: string;

  @Field()
  countryCode: string;

  @Field()
  expiresAt: Date;

  @Field()
  sourceActivationId: string;

  @Field(type => [ActivationCodeType], { nullable: true })
  activationCodes: ActivationCodeType[];
}

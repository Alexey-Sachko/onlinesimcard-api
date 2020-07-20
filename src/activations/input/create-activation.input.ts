import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateActivationInput {
  @Field()
  serviceCode: string;

  @Field()
  countryCode: string;
}

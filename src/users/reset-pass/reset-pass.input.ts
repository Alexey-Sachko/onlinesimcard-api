import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ResetPassInput {
  @Field()
  email: string;
}

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ResetPassConfirmInput {
  @Field()
  newPassword: string;

  @Field()
  tokenId: string;
}

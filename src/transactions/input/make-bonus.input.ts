import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class MakeBonusInput {
  @Field()
  amount: number;

  @Field()
  targetUserId: string;
}

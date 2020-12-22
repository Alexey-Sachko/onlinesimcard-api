import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetActivationsInput {
  @Field({ nullable: true })
  isCurrent?: boolean;

  @Field({ nullable: true })
  userId?: string;
}

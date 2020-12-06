import { Field, ObjectType } from '@nestjs/graphql';

import { ErrorType } from 'src/common/errors/error.type';

@ObjectType()
export class ResetPassResponse {
  @Field({ nullable: true })
  accessAgain?: Date;

  @Field(type => ErrorType, { nullable: true })
  error?: ErrorType;
}

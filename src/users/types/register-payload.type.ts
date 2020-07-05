import { ObjectType, Field } from '@nestjs/graphql';
import { ErrorType } from 'src/common/errors/error.type';

@ObjectType()
export class RegisterPayloadType {
  @Field(type => Boolean, { nullable: true })
  result?: boolean;

  @Field(type => [ErrorType], { nullable: true })
  errors?: ErrorType[];
}

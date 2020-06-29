import { ObjectType, Field, Int } from '@nestjs/graphql';
import { FreeMessageType } from './free-message.type';

@ObjectType()
export class FreeMessagesType {
  @Field(type => Int)
  current_page: number;

  @Field(type => Int, { nullable: true })
  from: number;

  @Field(type => Int, { nullable: true })
  to: number;

  @Field(type => Int)
  per_page: number;

  @Field(type => Int)
  total: number;

  @Field(type => [FreeMessageType])
  data: FreeMessageType[];
}

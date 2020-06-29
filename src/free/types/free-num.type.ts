import { ObjectType, Field, Int } from '@nestjs/graphql';
import { FreeMessagesType } from './free-messages.type';

@ObjectType()
export class FreeNumType {
  @Field({ nullable: true })
  maxdate: string;

  @Field()
  number: string;

  @Field(type => Int)
  country: number;

  @Field()
  updated_at: string;

  @Field()
  data_humans: string;

  @Field()
  full_number: string;

  @Field()
  country_text: string;

  @Field(type => FreeMessagesType)
  messages: FreeMessagesType;
}

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ServiceDictionaryItemType {
  @Field()
  code: string;

  @Field()
  name: string;
}

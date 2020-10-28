import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ServiceType {
  @Field()
  id: number;

  @Field()
  code: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  priceAmount?: number;
}

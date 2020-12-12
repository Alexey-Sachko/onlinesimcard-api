import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class PriceCountFromApi {
  @Field()
  price: number;

  @Field()
  count: number;
}

@ObjectType()
export class ServiceFromApi {
  @Field()
  code: string;

  @Field({ nullable: true })
  name?: string;

  @Field(type => [PriceCountFromApi])
  prices: PriceCountFromApi[];
}

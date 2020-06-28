import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('FreeMessage')
export class FreeMessageType {
  @Field()
  text: string;
  in_number: string;
  my_number: number;
  created_at: string;
  data_humans: string;
}

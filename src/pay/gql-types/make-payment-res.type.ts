import { Field, ObjectType } from '@nestjs/graphql';
import { FormMethod } from './form-method.enum';

@ObjectType()
class PayFormField {
  @Field()
  name: string;

  @Field()
  value: string;
}

@ObjectType()
export class MakePaymentResType {
  @Field()
  orderId: number;

  @Field()
  formUrl: string;

  @Field(type => FormMethod)
  method: FormMethod;

  @Field(type => [PayFormField])
  fields: PayFormField[];
}

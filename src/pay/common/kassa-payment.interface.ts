import { FormMethod } from '../gql-types/form-method.enum';

export interface KassaPayment {
  formUrl: string;
  method: FormMethod;
  params: Record<string, string | number | null | undefined>;
}

import { interkassaConfig } from 'src/config/interkassa';
import { KassaPayment } from '../common/kassa-payment.interface';
import { GetFormOptions, Kassa } from '../common/kassa.interface';
import { FormMethod } from '../gql-types/form-method.enum';

class InterkassaClient implements Kassa {
  private readonly _formUrl = 'https://sci.interkassa.com';
  private readonly _merchantId = interkassaConfig.merchantId;

  getForm({ orderId, orderAmount, email }: GetFormOptions): KassaPayment {
    return {
      formUrl: this._formUrl,
      method: FormMethod.POST,
      params: {
        ik_co_id: this._merchantId,
        ik_pm_no: orderId,
        ik_am: orderAmount,
        ik_cur: 'RUB',
        ik_desc: 'virtualnum.ru (пополнение баланса)',
        ik_cli: email,
      },
    };
  }
}

export const interkassa = new InterkassaClient();

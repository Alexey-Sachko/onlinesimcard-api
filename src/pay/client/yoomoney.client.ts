import crypto from 'crypto';
import { yoomoneyConfig } from 'src/config/yoomoney';

import { KassaPayment } from '../common/kassa-payment.interface';
import { GetFormOptions, Kassa } from '../common/kassa.interface';
import { FormMethod } from '../gql-types/form-method.enum';
import { YoomoneyNotificationDto } from '../yoomoney/dto/yoomoney-notification.dto';

const INSECURE_ALGORITHM = 'sha1';
const getInsecureSHA1 = function(input: string) {
  return crypto
    .createHash(INSECURE_ALGORITHM)
    .update(input)
    .digest('hex');
};

class YoomoneyClient implements Kassa {
  private _formUrl = 'https://yoomoney.ru/quickpay/confirm.xml';
  private _targetsText = 'Пополнение баланса Virtualnum';

  getForm({ orderAmount, orderId, email }: GetFormOptions): KassaPayment {
    return {
      formUrl: this._formUrl,
      method: FormMethod.POST,
      params: {
        receiver: yoomoneyConfig.targetWallet,
        'quickpay-form': 'shop',
        targets: this._targetsText,
        paymentType: 'AC',
        sum: orderAmount * 1.02, // Считаем комиссию
        label: orderId,
        formcomment: this._targetsText,
        'short-dest': this._targetsText,
        comment: `orderId: ${orderId}; email: ${email}`,
        // successURL: 'dashboard'
      },
    };
  }

  getNotificationSign({
    amount,
    notification_type,
    operation_id,
    currency,
    datetime,
    sender,
    codepro,
    label,
  }: YoomoneyNotificationDto) {
    const notification_secret = yoomoneyConfig.secret;
    const str = `${notification_type}&${operation_id}&${amount}&${currency}&${datetime}&${sender}&${codepro}&${notification_secret}&${label}`;
    return getInsecureSHA1(str);
  }
}

export const yoomoneyClient = new YoomoneyClient();

import md5 from 'md5';
import { freekassaConfig } from 'src/config/freekassa';

class FreekassaClient {
  firstSecret: string;
  secondSecret: string;
  merchantId: string;

  private readonly _formBaseUrl = 'http://www.free-kassa.ru/merchant/cash.php';

  constructor({
    firstSecret,
    secondSecret,
    merchantId,
  }: {
    firstSecret: string;
    secondSecret: string;
    merchantId: string;
  }) {
    if (!firstSecret) {
      throw new Error('firstSecret is required param');
    } else if (!secondSecret) {
      throw new Error('secondSecret is required param');
    } else if (!merchantId) {
      throw new Error('merchantId is required param');
    }
    // else if (!walletToken) {
    //   throw new Error('walletToken is required param')
    // }
    // else if (!walletId) {
    //   throw new Error('walletId is required param')
    // }

    this.firstSecret = firstSecret;
    this.secondSecret = secondSecret;
    this.merchantId = merchantId;
    // this.walletToken = walletToken
    // this.walletId = walletId
  }

  getFormBaseUrl() {
    return this._formBaseUrl;
  }

  getFormFields(
    orderAmount: number,
    orderId: string,
    options?: { email: string },
  ) {
    return {
      m: this.merchantId,
      oa: orderAmount,
      o: orderId,
      s: this.getFormSign(orderAmount, orderId),
      em: options?.email,
    };
  }

  getForm(orderAmount: number, orderId: string, options?: { email: string }) {
    const paramsString = this._params(
      this.getFormFields(orderAmount, orderId, options),
    );
    return `${this._formBaseUrl}?${paramsString}`;
  }

  getFormSign(orderAmount: number, orderId: string) {
    return md5(
      [this.merchantId, orderAmount, this.firstSecret, orderId].join(':'),
    );
  }

  getPaymentSign(orderAmount: number, orderId: string) {
    return md5(
      [this.merchantId, orderAmount, this.secondSecret, orderId].join(':'),
    );
  }

  private _params(p: Record<string | number, string | number>) {
    return Object.entries(p)
      .filter(([, value]) => value !== undefined)
      .reduce((acc, [key, value]) => {
        return acc + `${key}=${value}&`;
      }, '')
      .replace(/\&$/, '');
  }

  //   async getBalance() {
  //     const { data } = await axios.post(
  //       'https://www.fkwallet.ru/api_v1.php',
  //       qs.stringify({
  //         wallet_id: this.walletId,
  //         sign: md5([this.walletId, this.walletToken].join('')),
  //         action: 'get_balance',
  //       }),
  //     );

  //     return data;
  //   }

  //   async sendPayment({ wallet, amount, currency, description }) {
  //     const { data } = await axios.post(
  //       'https://www.fkwallet.ru/api_v1.php',
  //       qs.stringify({
  //         wallet_id: this.walletId,
  //         purse: wallet,
  //         desc: description,
  //         action: 'cashout',
  //         sign: md5(
  //           [this.walletId, currency, amount, wallet, this.walletToken].join(''),
  //         ),
  //         currency,
  //         amount,
  //       }),
  //     );

  //     return data;
  //   }
}

export const freekassa = new FreekassaClient({
  firstSecret: freekassaConfig.firstSecret,
  secondSecret: freekassaConfig.secondSecret,
  merchantId: freekassaConfig.merchantId,
});

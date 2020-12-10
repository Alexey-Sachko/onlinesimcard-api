import { KassaPayment } from './kassa-payment.interface';

export type GetFormOptions = {
  orderAmount: number;
  orderId: string;
  email?: string;
};

export interface Kassa {
  getForm(options: GetFormOptions): KassaPayment;
}

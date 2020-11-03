export class PaymentDoneDto {
  MERCHANT_ID: string;
  AMOUNT: number;
  intid: string | number;
  MERCHANT_ORDER_ID: string;
  P_EMAIL: string;
  P_PHONE?: string | null;
  CUR_ID: number;
  SIGN: string;
}

/**
 
MERCHANT_ID	ID Вашего магазина
AMOUNT	Сумма заказа
intid	Номер операции Free-Kassa
MERCHANT_ORDER_ID	Ваш номер заказа
P_EMAIL	Email плательщика
P_PHONE	Телефон плательщика (если указан)
CUR_ID	ID электронной валюты, который был оплачен заказ (список валют)
SIGN	Подпись (методика формирования подписи в данных оповещения)
us_key	Дополнительные параметры с префиксом us_, переданные в форму оплаты

 */

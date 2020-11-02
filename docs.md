# Free-kassa integration

## Эндпоинт для нотификации от free-kassa

- `/pay/freekassa/notification`

### Параметры:

- MERCHANT_ID
- AMOUNT
- intid - номер операции в free-kassa
- MERCHANT_ORDER_ID - номер заказа (наш)
- P_EMAIL
- P_PHONE
- CUR_ID - id валюты
- SIGN - подпись (md5)
- us\_\* - переданные ключи из формы оплаты

_Так же, нужно добавить проверку на сумму платежа и не была ли эта заявка уже оплачена или отменена_

**Эндпоинт должен ответить YES**

## Ip адреса free-kassa

- '136.243.38.147'
- '136.243.38.149'
- '136.243.38.150'
- '136.243.38.151'
- '136.243.38.189'
- '136.243.38.108'

## Резольвер для клиента

```graphql
mutation {
  makePayment(makePaymentInput: { amount: 100 }) {
    orderId
    url
  }
}
```

## Логика

1. Клиент создаёт платеж makePayment
2. Создается Order
3. Генерируется ссылка для оплаты и отдается клиенту
4. Клиент переходит по ссылке, оплачивает
5. При возникновении ошибки free-kassa редиректит на ui страницу `virtualnum.ru/pay/fail`
6. Free-kassa делает запрос `/pay/freekassa/notification`
7. При успешной оплате free-kassa редиректит на ui страницу `virtualnum.ru/pay/success`

## Таблица Order

- id
- paymentId
- amount
- userId
- status: [WAIT_PAY,ERROR,PAID]

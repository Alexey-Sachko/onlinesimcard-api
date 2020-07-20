export enum ActivationStatus {
  NEW = 'NEW', // Только созданная активация
  SENT_AGAIN = 'SENT_AGAIN', // Повторно отправлен код
  SENDING_CONFIRMED = 'SENDING_CONFIRMED', // Подтверждена отправка
  SMS_RECIEVED = 'SMS_RECIEVED', // СМС пришло,
  CANCELLED = 'CANCELLED', // Номер отменен
  FINISHED = 'FINISHED', // Активация завершена
  ERROR = 'ERROR', // Произошла ошибка
}

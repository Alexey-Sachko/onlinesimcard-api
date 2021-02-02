import { registerEnumType } from '@nestjs/graphql';

export enum ActivationStatus {
  // NEW = 'NEW', // Только созданная активация
  WAIT_CODE = 'WAIT_CODE', // Ждем код
  WAIT_AGAIN = 'WAIT_AGAIN', // Ждем повторный код
  SMS_RECIEVED = 'SMS_RECIEVED', // СМС пришло,
  CANCELLED = 'CANCELLED', // Номер отменен
  FINISHED = 'FINISHED', // Активация завершена
  ERROR = 'ERROR', // Произошла ошибка
}
registerEnumType(ActivationStatus, { name: 'ActivationStatus' });

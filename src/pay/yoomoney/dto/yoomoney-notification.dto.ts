import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsString,
} from 'class-validator';

enum NotificationType {
  P2P = 'p2p-incoming',
  CARD = 'card-incoming',
}

export class YoomoneyNotificationDto {
  @IsNotEmpty()
  @IsString()
  notification_type: NotificationType;

  @IsNotEmpty()
  @IsString()
  operation_id: string; // Идентификатор операции в истории счета получателя.

  @IsNotEmpty()
  @IsNumberString()
  amount: string; // Сумма, которая зачислена на счет получателя.

  @IsNotEmpty()
  @IsNumberString()
  withdraw_amount: string; // Сумма, которая списана со счета отправителя.

  @IsNotEmpty()
  @IsString()
  currency: string; // Код валюты — всегда 643 (рубль РФ согласно ISO 4217).

  @IsNotEmpty()
  @IsString()
  datetime: string; // datetime	Дата и время совершения перевода.

  @IsString()
  sender: string; // Для переводов из кошелька — номер кошелька отправителя. Для переводов с произвольной карты — параметр содержит пустую строку.

  @Transform(value => JSON.parse(value))
  @IsBoolean()
  codepro: boolean; // Для переводов из кошелька — перевод защищен кодом протекции. Для переводов с произвольной карты — всегда false.

  @IsString()
  @IsNotEmpty()
  label: string; // Метка платежа. Если ее нет, параметр содержит пустую строку.

  @IsString()
  @IsNotEmpty()
  sha1_hash: string; // SHA-1 hash параметров уведомления.

  @Transform(value => JSON.parse(value))
  @IsBoolean()
  unaccepted: boolean; // boolean	Перевод еще не зачислен. Получателю нужно освободить место в кошельке или использовать код протекции (если codepro=true).
}

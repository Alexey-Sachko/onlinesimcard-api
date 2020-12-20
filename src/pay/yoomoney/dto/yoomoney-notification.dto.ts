import { Transform } from 'class-transformer';

enum NotificationType {
  P2P = 'p2p-incoming',
  CARD = 'card-incoming',
}

export class YoomoneyNotificationDto {
  notification_type: NotificationType;

  operation_id: string; // Идентификатор операции в истории счета получателя.

  amount: string; // Сумма, которая зачислена на счет получателя.

  withdraw_amount: string; // Сумма, которая списана со счета отправителя.

  currency: string; // Код валюты — всегда 643 (рубль РФ согласно ISO 4217).

  datetime: string; // datetime	Дата и время совершения перевода.

  sender: string; // Для переводов из кошелька — номер кошелька отправителя. Для переводов с произвольной карты — параметр содержит пустую строку.

  @Transform(value => JSON.parse(value))
  codepro: boolean; // Для переводов из кошелька — перевод защищен кодом протекции. Для переводов с произвольной карты — всегда false.

  label: string; // Метка платежа. Если ее нет, параметр содержит пустую строку.

  sha1_hash: string; // SHA-1 hash параметров уведомления.

  @Transform(value => JSON.parse(value))
  unaccepted: boolean; // boolean	Перевод еще не зачислен. Получателю нужно освободить место в кошельке или использовать код протекции (если codepro=true).
}

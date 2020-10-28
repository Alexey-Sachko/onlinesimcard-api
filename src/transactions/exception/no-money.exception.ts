import { createError } from 'src/common/errors/create-error';
import { ErrorType } from 'src/common/errors/error.type';

export class NoMoneyException {
  readonly type = 'NoMoneyException';

  toDisplayError(): ErrorType {
    return createError('balanceAmount', 'Недостаточно средств');
  }
}

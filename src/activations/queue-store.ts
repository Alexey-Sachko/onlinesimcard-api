import { timer, from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

type Operation = () => Promise<void>;

export class QueueStore {
  private _operations: Operation[] = [];
  private _inProgressCount = 0;

  private get _inProgress() {
    return this._inProgressCount > 0;
  }

  // TODO сделать выключение интервала, если задачи кончились и включать как только появляются
  private _startTaskManagement() {
    timer(0, 100).subscribe(() => {
      this._runAvailableTask();
    });
  }

  private _runAvailableTask() {
    console.log('_runAvailableTask', this._operations.length);

    if (!this._inProgress && this._operations.length > 0) {
      console.log('task started, oper length:', this._operations.length);
      this._inProgressCount += 1;
      const oper = this._operations.shift();
      from(oper())
        .pipe(
          catchError(err => {
            console.error(`[QueueStore]: Ошибка выполнения операции`, err);
            return err;
          }),
          tap(() => {
            this._inProgressCount -= 1;
          }),
        )
        .subscribe();
    }
  }

  push(oper: Operation) {
    this._operations.push(oper);
  }

  start() {
    this._startTaskManagement();
  }

  // recursive style
  /* async _handleOne() {
    if (this._operations.length === 0) {
      return;
    }

    const oper = this._operations.shift();
    await oper();
    await this._handleOne();
  } */
}

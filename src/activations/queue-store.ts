type Operation = () => Promise<void>;

export class QueueStore {
  private _operations: Operation[] = [];
  private _inProgressCount = 0;

  private get _inProgress() {
    return this._inProgressCount > 0;
  }

  // TODO сделать выключение интервала, если задачи кончились и включать как только появляются
  private _startTaskManagement() {
    // Запускаем скрипт по интервалу
    setInterval(async () => {
      if (!this._inProgress && this._operations.length > 0) {
        console.log('task started, oper length:', this._operations.length);
        this._inProgressCount += 1;
        const oper = this._operations.shift();
        try {
          await oper();
        } catch (error) {
          console.error(`[QueueStore]: Ошибка выполнения операции`, error);
        }
        this._inProgressCount -= 1;
      }
    }, 100);
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

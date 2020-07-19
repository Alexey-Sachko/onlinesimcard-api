const DEFAULT_RATIO = 100; // Коэффициент для приведения к минимальной еденице расчета валюты

export class Money {
  private readonly _amount: number;

  constructor(amount: number) {
    this._amount = amount * DEFAULT_RATIO;
  }

  get amount() {
    return this._amount;
  }

  toDecimal() {
    return this._amount / DEFAULT_RATIO;
  }

  plus(money: Money): Money {
    return new Money(this._amount + money._amount);
  }
}

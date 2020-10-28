const DEFAULT_RATIO = 100; // Коэффициент для приведения к минимальной еденице расчета валюты

export class Money {
  constructor(private readonly _amount: number) {}

  get amount() {
    return this._amount;
  }

  static ZERO(): Money {
    return new Money(0);
  }

  static fromDecimal(amount: number): Money {
    return new Money(amount * DEFAULT_RATIO);
  }

  toDecimal() {
    return this._amount / DEFAULT_RATIO;
  }

  // operations
  add(money: Money): Money {
    return new Money(this._amount + money._amount);
  }

  subtract(money: Money) {
    return new Money(this._amount - money._amount);
  }

  multiply(multiplier: number) {
    return new Money(this._amount * multiplier);
  }

  divide(divisor: number) {
    return new Money(this._amount / divisor);
  }

  // comparing
  less(money: Money) {
    return this.amount < money.amount;
  }

  lessOrEqual(money: Money) {
    return this.amount <= money.amount;
  }

  more(money: Money) {
    return this.amount > money.amount;
  }

  moreOrEqual(money: Money) {
    return this.amount >= money.amount;
  }

  equal(money: Money) {
    return this.amount === money.amount;
  }
}

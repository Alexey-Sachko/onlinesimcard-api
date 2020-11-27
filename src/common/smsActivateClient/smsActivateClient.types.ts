export type GetAvailableNumbersRO = Record<string, string>;

export type GetPricesRO = {
  [country: number]: {
    [serviceName: string]: {
      [cost: number]: number; // количество номеров
    };
  };
};

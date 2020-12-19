import { GetPricesRO } from './smsActivateClient.types';

export class PricesCountMap {
  private readonly _countMap: Record<
    string,
    { price: number; count: number; country: string; service: string }[]
  >;

  constructor(private readonly _source: GetPricesRO) {
    this._countMap = Object.entries(_source).reduce(
      (acc, [country, serviceMap]) => {
        Object.entries(serviceMap).forEach(([service, priceMap]) => {
          acc[this._buildCountKey({ country, service })] = Object.entries(
            priceMap,
          ).map(([price, count]) => ({ price, count, country, service }));
        });

        return acc;
      },
      {},
    );
  }

  private _buildCountKey({
    country,
    service,
  }: {
    service: string;
    country: string;
  }) {
    return `${country}:${service}`;
  }

  getServiceCount({
    service,
    country,
    maxPrice,
  }: {
    country: string;
    service: string;
    maxPrice?: number;
  }): number {
    return (
      this._countMap[this._buildCountKey({ service, country })]
        ?.filter(({ price }) => (maxPrice ? price <= maxPrice : true))
        .reduce((total, { count }) => total + count, 0) || 0
    );
  }
}

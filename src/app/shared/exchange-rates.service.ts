import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

export interface ExchangeRate {
  ccy: string;
  base_ccy: string;
  buy: string;
  sale: string;
}

export type Currencies = 'UAH' | 'USD' | 'EUR' | 'RUR' | 'BTC';

@Injectable({providedIn: 'root'})
export class ExchangeRatesService {
  constructor(private http: HttpClient) {}

  fetchExchangeRates(currencies: Currencies[] = ['USD', 'EUR']) {
    return this.http
      .get<ExchangeRate[]>('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5')
      .pipe(
        map(rates => {
          return rates.filter(rate => {
            return currencies.includes(rate.ccy as Currencies);
          });
        })
      );
  }
}

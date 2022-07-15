import { Component, OnInit } from '@angular/core';
import { ExchangeRate, ExchangeRatesService } from '../shared/exchange-rates.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  exchangeRates: ExchangeRate[] = [];

  constructor(private exchangeRatesService: ExchangeRatesService) { }

  ngOnInit(): void {
    this.exchangeRatesService.fetchExchangeRates().subscribe(rates => {
      this.exchangeRates = rates.slice();
    });
  }

}

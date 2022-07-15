import { Component, OnDestroy, OnInit } from '@angular/core';
import { Currencies, ExchangeRate, ExchangeRatesService } from '../shared/exchange-rates.service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-converter',
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.css']
})
export class ConverterComponent implements OnInit, OnDestroy {
  exchangeRates: ExchangeRate[] = [];
  converterForm: FormGroup;
  baseCcyQty$: BehaviorSubject<number> = new BehaviorSubject<number>(10);
  private subscription: Subscription;

  constructor(private exchangeRatesService: ExchangeRatesService) { }

  ngOnInit(): void {
    this.exchangeRatesService.fetchExchangeRates().subscribe(rates => {
      this.exchangeRates = rates.slice();
      this.initForm();
      this.subscription = this.baseCcyQty$.subscribe(qty => {
        const fromQtyValue = this.convert(qty, this.fromCtrl.value.currency);
        this.fromQtyCtrl.setValue(fromQtyValue, {emitEvent: false});

        const toQtyValue = this.convert(qty, this.toCtrl.value.currency);
        this.toQtyCtrl.setValue(toQtyValue, {emitEvent: false});
      });
    });
  }

  private initForm() {
    this.converterForm = new FormGroup({
      'from': new FormGroup({
        'quantity': new FormControl(this.convert(this.baseCcyQty$.value, 'UAH'),
          [Validators.pattern('^[0-9.]*$')]),
        'currency': new FormControl('UAH')
      }),
      'to': new FormGroup({
        'quantity': new FormControl(this.convert(this.baseCcyQty$.value, 'EUR'),
          [Validators.pattern('^[0-9.]*$')]),
        'currency': new FormControl('EUR')
      })
    });

    this.handleQtyCtrlsChanges([this.fromCtrl, this.toCtrl]);
  }

  private handleQtyCtrlsChanges(ctrls: AbstractControl[]) {
    for (let ctrl of ctrls) {
      ctrl.valueChanges.subscribe(value => {
        if (ctrl.invalid) {
          return;
        }
        const baseCcyQty = this.convertToBaseCcy(+value.quantity, ctrl.value.currency);
        this.baseCcyQty$.next(baseCcyQty);
      });
    }
  }

  private get fromCtrl(): AbstractControl {
    return this.converterForm.get('from');
  }

  private get fromQtyCtrl(): AbstractControl {
    return this.converterForm.get('from.quantity');
  }

  private get toCtrl(): AbstractControl {
    return this.converterForm.get('to');
  }

  private get toQtyCtrl(): AbstractControl {
    return this.converterForm.get('to.quantity');
  }

  private getRate(ccy: Currencies): number {
    const exchangeRate: ExchangeRate = this.exchangeRates.find(rate => {
      return rate.ccy === ccy;
    });
    return exchangeRate ? +exchangeRate.buy : 1;
  }

  private convert(qty: number, ccy: Currencies): number {
    const rate = this.getRate(ccy);
    return Math.floor(qty / rate * 100) / 100;
  }

  private convertToBaseCcy(qty: number, ccy: Currencies): number {
    const rate = this.getRate(ccy);
    return qty * rate;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

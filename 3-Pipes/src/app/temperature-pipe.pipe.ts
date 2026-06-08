import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'temp',
  standalone: true,
})
export class TemperaturePipe implements PipeTransform {
  transform(
    value: string | number | null,
    inputType: 'cel' | 'fah',
    outputType?: 'cel' | 'fah',
  ): string | null {
    if (!value) {
      return null;
    }
    let output: string;
    let symbol = (t: 'cel' | 'fah') => (t === 'cel' ? ' C' : ' F');
    let val: number;
    if (typeof value === 'string') {
      val = parseFloat(value);
    } else {
      val = value;
    }
    if (inputType === 'cel' && outputType === 'fah') {
      output = ((val * 9) / 5 + 32).toFixed(2) + symbol('fah');
    } else if (inputType === 'fah' && outputType === 'cel') {
      output = ((val - 32) * (5 / 9)).toFixed(2) + symbol('cel');
    } else {
      output = (val).toFixed(2) + symbol(inputType);
    }
    return output;
  }
}

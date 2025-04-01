import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateMesString',
  standalone: true
})
export class DateMesStringPipe implements PipeTransform {
  transform(value: Date): unknown {
    const mes = value.toLocaleString('default', { month: 'long' });
    return mes.charAt(0).toUpperCase() + mes.slice(1);
  }
}

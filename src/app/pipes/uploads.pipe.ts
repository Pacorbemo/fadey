import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environments';

@Pipe({
  name: 'uploads',
  standalone: true
})
export class UploadsPipe implements PipeTransform {
  transform(value: string | null | undefined, carpeta: string = 'uploads'): string {
    if (!value) return '';
    if (/^https?:\/\//.test(value)) return value;
    if (value.startsWith('assets/')) return value;
    return `${environment.serverUrl}/${carpeta}/${value}`;
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatLocation',
  standalone: true
})
export class FormatLocationPipe implements PipeTransform {
  transform(city: string, country: string): string {
    if (!city || !country) {
      return '';
    }
    return `${city}, ${country}`;
  }
}

import { Pipe, PipeTransform } from '@angular/core';

interface Guest {
  type: 'Adults' | 'Children';
  count: number;
}

@Pipe({
  name: 'formatGuests',
  standalone: true
})
export class FormatGuestsPipe implements PipeTransform {
  transform(guests: Guest[]): string {
    return guests
      .filter(g => g.count > 0)
      .map(g => `${g.count} ${g.type}`)
      .join(', ');
  }
}

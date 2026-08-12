import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterCheckInDate',
  standalone: true
})
export class FilterCheckInDatePipe implements PipeTransform {
  transform(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }
}

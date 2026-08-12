import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterCheckOutDate',
  standalone: true
})
export class FilterCheckOutDatePipe implements PipeTransform {
  transform(date: Date | null, checkInDate: Date | null): boolean {
    if (!date) return false;

    if (!checkInDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }

    const minDate = new Date(checkInDate);
    minDate.setHours(0, 0, 0, 0);
    return date >= minDate;
  }
}

import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FormsModule
  ]
})
export class HomeComponent {
  title = 'Home page';
  
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  
  @ViewChild('checkInPicker') checkInPicker!: MatDatepicker<Date>;
  @ViewChild('checkOutPicker') checkOutPicker!: MatDatepicker<Date>;

  openCheckIn() {
    this.checkInPicker.open();
  }

  onCheckInSelect(event: any) {
    this.checkInDate = event.value;
    if (this.checkInDate && this.checkOutDate && this.checkInDate > this.checkOutDate) {
      this.checkOutDate = this.checkInDate;
    }
  }

  openCheckOut() {
    this.checkOutPicker.open();
  }

  onCheckOutSelect(event: any) {
    this.checkOutDate = event.value;
  }

  get checkInDateFormatted(): string {
    if (!this.checkInDate) return 'Choose date';
    return formatDate(this.checkInDate, 'dd.MM.yyyy', 'en-US');
  }

  get checkOutDateFormatted(): string {
    if (!this.checkOutDate) return 'Choose date';
    return formatDate(this.checkOutDate, 'dd.MM.yyyy', 'en-US');
  }

  checkInFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  checkOutFilter = (date: Date | null): boolean => {
    if (!date) return false;

    if (!this.checkInDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }

    const minDate = new Date(this.checkInDate);
    minDate.setHours(0, 0, 0, 0);
    return date >= minDate;
  }
}

import { Component, ViewChild } from '@angular/core';

import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms'; 


interface Guest {
  type: 'Adults' | 'Children';
  count: number;
}
interface Location {
  name: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FormsModule
]
})

export class HomeComponent {
  title = 'Home page';
  guestText: string = '';
  
  guests: Guest[] = [
    { type: 'Adults', count: 0 },
    { type: 'Children', count: 0 }
  ];
  locations: Location[] = [
    { name: 'New York' },
    { name: 'Los Angeles' },
    { name: 'Chicago' },
    { name: 'Houston' },
    { name: 'Miami' }
  ];
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  
  @ViewChild('checkInPicker') checkInPicker!: MatDatepicker<Date>;
  @ViewChild('checkOutPicker') checkOutPicker!: MatDatepicker<Date>;




  activeDialog: 'location' | 'checkin' | 'checkout' | 'guests' | null = null;


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
    ngOnInit() {
    document.addEventListener('click', () => {
      if(this.activeDialog === 'guests')
        this.closeGuests();
      if(this.activeDialog === 'location')
        this.closeLocation();
    });
  }

    openGuests() {
    this.activeDialog = 'guests';
  }
    openLocation() {
    this.activeDialog = 'location';
  }
    getGuestCounts(): string {
    return this.guests
      .filter(g => g.count > 0)
      .map(g => `${g.count} ${g.type}`)
      .join(', ');
  }
    closeGuests() {
      this.activeDialog = null;
      this.guestText = this.getGuestCounts();
  } 
    closeLocation() {
      this.activeDialog = null;
    }

    closeDialog() {
      this.activeDialog = null;
    }
}

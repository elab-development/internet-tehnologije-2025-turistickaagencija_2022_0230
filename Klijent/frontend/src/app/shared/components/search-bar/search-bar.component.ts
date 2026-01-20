import { Component, ViewChild } from '@angular/core';

import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { FilterCheckInDatePipe, FilterCheckOutDatePipe, FormatGuestsPipe, FormatLocationPipe } from '../../pipes'; 


interface Guest {
  type: 'Adults' | 'Children';
  count: number;
}
interface Location {
  country: string;
  cities: string[];
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FormsModule
]
})

export class SearchBarComponent {
  guestText: string = '';
  selectedCity: string = '';
  selectedLocationText: string = '';

  guests: Guest[] = [
    { type: 'Adults', count: 0 },
    { type: 'Children', count: 0 }
  ];
  locations: Location[] = [
    { country: 'USA', cities: ['New York', 'Los Angeles', 'Chicago'] },
    { country: 'France', cities: ['Paris', 'Lyon', 'Marseille'] },
    { country: 'Japan', cities: ['Tokyo', 'Kyoto', 'Osaka'] },
    { country: 'Brazil', cities: ['Rio de Janeiro', 'São Paulo', 'Salvador'] },
    { country: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane'] },
    { country: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal'] },
    { country: 'Italy', cities: ['Rome', 'Milan', 'Venice'] },
    { country: 'Germany', cities: ['Berlin', 'Munich', 'Frankfurt'] },
    { country: 'India', cities: ['Delhi', 'Mumbai', 'Bangalore'] },
    { country: 'South Africa', cities: ['Cape Town', 'Johannesburg', 'Durban'] }
  ];
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  
  @ViewChild('checkInPicker') checkInPicker!: MatDatepicker<Date>;
  @ViewChild('checkOutPicker') checkOutPicker!: MatDatepicker<Date>;

  activeDialog: 'location' | 'checkin' | 'checkout' | 'guests' | null = null;
  locationDialogView: 'countries' | 'cities' = 'countries';
  selectedCountry: string = '';

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
    return new FilterCheckInDatePipe().transform(date);
  }

  checkOutFilter = (date: Date | null): boolean => {
    return new FilterCheckOutDatePipe().transform(date, this.checkInDate);
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

  openCountries() {
    this.activeDialog = 'location';
    this.locationDialogView = 'countries';
  }

  openCities(country: string) {
    this.selectedCountry = country;
    this.locationDialogView = 'cities';
  }

  getGuestCounts(): string {
    return new FormatGuestsPipe().transform(this.guests);
  }

  closeGuests() {
    this.activeDialog = null;
    this.guestText = new FormatGuestsPipe().transform(this.guests);
  } 

  closeLocation() {
    this.activeDialog = null;
  }

  selectCity(city: string) {
    this.selectedCity = city;
    this.selectedLocationText = new FormatLocationPipe().transform(city, this.selectedCountry);
    this.closeLocation();
  }

  closeDialog() {
    this.activeDialog = null;
  }
}

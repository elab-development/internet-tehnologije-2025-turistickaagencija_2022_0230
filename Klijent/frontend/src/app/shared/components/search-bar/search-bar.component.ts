import { Component, ViewChild, OnInit } from '@angular/core';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { FilterCheckInDatePipe, FilterCheckOutDatePipe, FormatGuestsPipe, FormatLocationPipe } from '../../pipes'; 
import { Router } from '@angular/router';
import { SearchApiService } from '../../../core/services/component-api/search-api.service';
import { Destination } from '../../../core/models/destination.model';

interface Guest {
  type: 'Adults' | 'Children';
  count: number;
}

interface Location {
  id: number;
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
export class SearchBarComponent implements OnInit {

  guestText: string = '';
  selectedCity: string = '';
  selectedLocationText: string = '';
  selectedCountry: string = '';

  guests: Guest[] = [
    { type: 'Adults', count: 0 },
    { type: 'Children', count: 0 }
  ];
  
  destinations: Destination[] = [];
  locations: Location[] = [];

  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  
  @ViewChild('checkInPicker') checkInPicker!: MatDatepicker<Date>;
  @ViewChild('checkOutPicker') checkOutPicker!: MatDatepicker<Date>;

  activeDialog: 'location' | 'checkin' | 'checkout' | 'guests' | null = null;
  locationDialogView: 'countries' | 'cities' = 'countries';

  constructor(
    private apiService: SearchApiService,
    private router: Router
  ) {
    // Čitanje stanja iz navigacije (ako postoji)
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { searchData: any };

    if (state && state.searchData) {
      const data = state.searchData;
      this.selectedCity = data.selectedCity;
      this.selectedCountry = data.selectedCountry;
      this.selectedLocationText = data.selectedLocationText;
      this.checkInDate = data.checkInDate ? new Date(data.checkInDate) : null;
      this.checkOutDate = data.checkOutDate ? new Date(data.checkOutDate) : null;
      this.guests = data.guests;
      this.guestText = data.guestText;
    }
  }

  ngOnInit() {
    // 1. Učitavanje lokacija (samo jednom)
    this.apiService.getAllLocations().subscribe(response => {
      if (response && response.success) {
        this.destinations = response.data;
        this.locations = this.convertDestinationsToLocations(this.destinations);
      }
    });

    // 2. Inicijalizuj guestText ako je prazan (npr. na refresh)
    if (!this.guestText) {
      this.updateGuestText();
    }

    // 3. Globalni listener za zatvaranje (proveri da li se klasa u HTML-u zove baš 'search-container')
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (this.activeDialog && !target.closest('.search-container')) {
        this.closeDialog();
      }
    }); 
  }

  updateGuestText() {
    this.guestText = new FormatGuestsPipe().transform(this.guests);
  }

  convertDestinationsToLocations(destinations: Destination[]): Location[] {
    const locationMap: { [key: string]: Location } = {};
  
    destinations.forEach(dest => {
      if (!locationMap[dest.drzava.naziv]) {
        locationMap[dest.drzava.naziv] = {
          id: dest.drzava.id,
          country: dest.drzava.naziv,
          cities: []
        };
      }
      if (!locationMap[dest.drzava.naziv].cities.includes(dest.naziv)) {
        locationMap[dest.drzava.naziv].cities.push(dest.naziv);
      }
    });

    return Object.values(locationMap);
  }

  openCheckIn() { this.checkInPicker.open(); }
  
  onCheckInSelect(event: any) {
    this.checkInDate = event.value;
    if (this.checkInDate && this.checkOutDate && this.checkInDate > this.checkOutDate) {
      this.checkOutDate = this.checkInDate;
    }
  }

  openCheckOut() { this.checkOutPicker.open(); }
  onCheckOutSelect(event: any) { this.checkOutDate = event.value; }

  checkInFilter = (date: Date | null) => new FilterCheckInDatePipe().transform(date);
  checkOutFilter = (date: Date | null) => new FilterCheckOutDatePipe().transform(date, this.checkInDate);

  openGuests() { this.activeDialog = 'guests'; }
  openCountries() { 
    this.activeDialog = 'location';
    this.locationDialogView = 'countries';
  }

  openCities(country: string) {
    this.selectedCountry = country;
    this.locationDialogView = 'cities';
  }

  closeGuests() {
    this.activeDialog = null;
    this.updateGuestText();
  } 

  selectCity(city: string) {
    this.selectedCity = city;
    this.selectedLocationText = new FormatLocationPipe().transform(city, this.selectedCountry);
    this.activeDialog = null;
  }

  closeDialog() {
    this.activeDialog = null;
    this.updateGuestText();
  }

  getDestinationId(city: string): number | null {
    const loc = this.locations.find(l => l.cities.includes(city));
    return loc ? loc.id : null;
  }

  getTotalGuests(): number {
    return this.guests.reduce((total, guest) => total + guest.count, 0);
  }

  search() {
    const queryParams = {
        destinacija_id: this.getDestinationId(this.selectedCity),
        datum_pocetka: this.checkInDate ? this.checkInDate.toISOString().split('T')[0] : null,
        datum_zavrsetka: this.checkOutDate ? this.checkOutDate.toISOString().split('T')[0] : null,
        broj_mesta: this.getTotalGuests() > 0 ? this.getTotalGuests() : null
    };

    // Navigacija sa čuvanjem trenutnog stanja u 'state' objektu
    this.router.navigate(['/arrangement-offer'], { 
        queryParams,
        state: { 
          searchData: {
            selectedCity: this.selectedCity,
            selectedCountry: this.selectedCountry,
            selectedLocationText: this.selectedLocationText,
            checkInDate: this.checkInDate,
            checkOutDate: this.checkOutDate,
            guests: [...this.guests],
            guestText: this.guestText
          }
        }
    });
  }
}
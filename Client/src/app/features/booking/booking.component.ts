import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArrangementApiService } from '../../core/services/component-api/arrangement-api.service';
import { BookingApiService } from '../../core/services/component-api/booking-api.service';
import { Arrangement } from '../../core/models/arrangement.model';
import { environment } from '../../../environments/environment';

export interface TravelPackage {
  id: string;
  name: string;
  country: string;
  image: string;
  rating: number;
  description: string;
  longDescription: string;
  durationDays: number;
  pricePerAdult: number;
  pricePerChild: number;
  totalCapacity: number;
  remainingCapacity: number;
  availableDates: string[];
  includes: string[];
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent {
  // Mock podataka — u realnoj aplikaciji ovo dolazi iz servisa/rute (resolver ili API poziv po ID-u)
  package = signal<TravelPackage>({
    id: 'prolece-u-parizu',
    name: 'Prolece u Parizu',
    country: 'Francuska',
    image:
      'https://images.unsplash.com/photo-1502602898536-47ad22581b52?q=80&w=1600&auto=format&fit=crop',
    rating: 4.9,
    description: 'Dozivite Pariz u svom najlepsem sjaju.',
    longDescription:
      'Provedite tri nezaboravna dana u srcu Pariza. Setnja pored Sene, poseta Ajfelovoj kuli, ' +
      'Luvru i Monmartru, uz smestaj u centru grada i doruk ukljucen svakog jutra. Idealno za parove ' +
      'i ljubitelje kulture koji zele da otkriju grad svetlosti bez zurbe.',
    durationDays: 3,
    pricePerAdult: 260,
    pricePerChild: 180,
    totalCapacity: 40,
    remainingCapacity: 12,
    availableDates: ['12. Sep 2026.', '19. Sep 2026.', '26. Sep 2026.', '3. Okt 2026.'],
    includes: ['Avionske karte', 'Smestaj (3 nocenja)', 'Doruk', 'Vodic na srpskom jeziku'],
  });

  selectedDateIndex = signal(0);
  adults = signal(2);
  children = signal(0);

  selectedDate = computed(() => this.package().availableDates[this.selectedDateIndex()]);

  totalGuests = computed(() => this.adults() + this.children());

  totalPrice = computed(
    () =>
      this.adults() * this.package().pricePerAdult +
      this.children() * this.package().pricePerChild
  );

  spotsLeftAfterBooking = computed(() => this.package().remainingCapacity - this.totalGuests());

  canBook = computed(
    () => this.adults() > 0 && this.spotsLeftAfterBooking() >= 0
  );

  loading = false;
  error: string | null = null;
  bookingMessage: string | null = null;
  arrangementId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private arrangementApi: ArrangementApiService,
    private bookingApi: BookingApiService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Arrangement not found.';
      return;
    }

    this.arrangementId = id;
    this.loading = true;

    this.arrangementApi.getArrangement(id).subscribe({
      next: response => {
        if (response.success) {
          this.updatePackage(response.data);
        } else {
          this.error = response.message || 'Arrangement not found.';
        }
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message || 'Unable to load arrangement.';
        this.loading = false;
      }
    });
  }

  selectDate(index: number): void {
    this.selectedDateIndex.set(index);
  }

  incrementAdults(): void {
    if (this.totalGuests() < this.package().remainingCapacity) {
      this.adults.update((value) => value + 1);
    }
  }

  decrementAdults(): void {
    if (this.adults() > 1) {
      this.adults.update((value) => value - 1);
    }
  }

  incrementChildren(): void {
    if (this.totalGuests() < this.package().remainingCapacity) {
      this.children.update((value) => value + 1);
    }
  }

  decrementChildren(): void {
    if (this.children() > 0) {
      this.children.update((value) => value - 1);
    }
  }

  bookNow(): void {
    if (!this.canBook() || !this.arrangementId) {
      return;
    }

    this.error = null;
    this.bookingMessage = null;

    this.bookingApi.createBooking({
      aranzman_id: this.arrangementId,
      guests: this.totalGuests()
    }).subscribe({
      next: response => {
        if (response.success) {
          this.bookingMessage = 'Booking confirmed. Redirecting to My Bookings...';
          setTimeout(() => this.router.navigate(['/my-bookings']), 1200);
        } else {
          this.error = response.message || 'Booking failed.';
        }
      },
      error: err => {
        this.error = err.error?.message || 'Booking failed.';
      }
    });
  }

  private updatePackage(arrangement: Arrangement): void {
    const imagePath = arrangement.hotel?.slika || arrangement.destinacija.slika || '';
    this.package.set({
      id: arrangement.id.toString(),
      name: arrangement.naziv,
      country: arrangement.destinacija.drzava.naziv,
      image: imagePath ? `${environment.apiUrl}${imagePath}` : '',
      rating: arrangement.hotel?.ocena ? Number(arrangement.hotel.ocena) : 0,
      description: arrangement.opis || '',
      longDescription: arrangement.opis || '',
      durationDays: arrangement.broj_nocenja,
      pricePerAdult: Number(arrangement.cena),
      pricePerChild: Number(arrangement.cena),
      totalCapacity: arrangement.broj_mesta,
      remainingCapacity: arrangement.broj_mesta,
      availableDates: [this.formatDate(arrangement.datum_pocetka)],
      includes: [
        `Hotel: ${arrangement.hotel?.naziv ?? 'Not available'}`,
        `Destination: ${arrangement.destinacija.naziv}`,
        `Nights: ${arrangement.broj_nocenja}`
      ]
    });
    this.selectedDateIndex.set(0);
  }

  private formatDate(date: string | Date): string {
    const parsed = new Date(date);
    return parsed.toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
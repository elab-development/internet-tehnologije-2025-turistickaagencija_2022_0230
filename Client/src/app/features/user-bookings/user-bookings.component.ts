import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingApiService } from '../../core/services/component-api/booking-api.service';
import { Booking } from '../../core/models/booking.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-bookings.component.html',
  styleUrls: ['./user-bookings.component.scss']
})
export class UserBookingsComponent {
  bookings: Booking[] = [];
  loading = false;
  error: string | null = null;
  message: string | null = null;

  constructor(private bookingApi: BookingApiService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.error = null;
    this.bookingApi.getBookings().subscribe({
      next: response => {
        this.bookings = response.data;
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message ?? 'Unable to load booked arrangements.';
        this.loading = false;
      }
    });
  }

  pay(booking: Booking): void {
    this.message = null;
    this.bookingApi.updateBooking(booking.id, { action: 'pay' }).subscribe({
      next: response => {
        const updated = response.data;
        booking.payment_status = updated.payment_status;
        booking.status = updated.status;
        this.message = 'Payment completed successfully.';
      },
      error: err => {
        this.error = err.error?.message ?? 'Unable to process payment.';
      }
    });
  }

  cancel(booking: Booking): void {
    this.message = null;
    this.bookingApi.updateBooking(booking.id, { action: 'cancel' }).subscribe({
      next: response => {
        booking.status = response.data.status;
        this.message = 'Booking cancelled successfully.';
      },
      error: err => {
        this.error = err.error?.message ?? 'Unable to cancel booking.';
      }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingApiService } from '../../core/services/component-api/booking-api.service';
import { Booking } from '../../core/models/booking.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-bookings.component.html',
  styleUrls: ['./user-bookings.component.scss']
})
export class UserBookingsComponent {
  bookings: Booking[] = [];
  loading = false;
  error: string | null = null;
  message: string | null = null;
  selectedBookingToCancel: Booking | null = null;
  selectedBookingToPay: Booking | null = null;
  paymentForm = {
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    saveCard: false
  };
  paymentErrors: string[] = [];
  savedCard: { cardName: string; last4: string; expiry: string } | null = null;

  constructor(private bookingApi: BookingApiService) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadSavedCard();
  }

  loadSavedCard(): void {
    const raw = localStorage.getItem('savedCard');
    if (!raw) {
      return;
    }

    try {
      this.savedCard = JSON.parse(raw);
    } catch {
      this.savedCard = null;
    }
  }

  useSavedCard(): void {
    if (!this.savedCard) {
      return;
    }

    this.paymentForm.cardName = this.savedCard.cardName;
    this.paymentForm.expiry = this.savedCard.expiry;
    this.paymentForm.saveCard = true;
    this.message = 'Saved card details loaded. Enter full card number to complete payment.';
  }

  get amountDue(): number {
    return this.bookings.reduce((total, booking) => {
      if (booking.payment_status === 'PAID' || booking.status === 'CANCELLED') {
        return total;
      }
      return total + booking.total_price;
    }, 0);
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
    this.error = null;
    this.message = null;
    this.paymentForm = {
      cardName: '',
      cardNumber: '',
      expiry: '',
      cvc: '',
      saveCard: false
    };
    this.selectedBookingToPay = booking;
  }

  confirmPayment(): void {
    if (!this.selectedBookingToPay) {
      return;
    }

    this.paymentErrors = [];
    if (!this.validatePaymentForm()) {
      return;
    }

    const payload: any = { action: 'pay' };
    if (this.paymentForm.saveCard) {
      payload.save_card = true;
    }

    this.bookingApi.updateBooking(this.selectedBookingToPay.id, payload).subscribe({
      next: response => {
        const updated = response.data;
        this.selectedBookingToPay!.payment_status = updated.payment_status;
        this.selectedBookingToPay!.status = updated.status;
        this.message = 'Payment completed successfully.';

        if (this.paymentForm.saveCard) {
          this.saveCardInfo();
        }

        this.closeModal();
      },
      error: err => {
        this.error = err.error?.message ?? 'Unable to process payment.';
      }
    });
  }

  validatePaymentForm(): boolean {
    const cardName = this.paymentForm.cardName.trim();
    const cardNumber = this.paymentForm.cardNumber.replace(/\s+/g, '');
    const expiry = this.paymentForm.expiry.trim();
    const cvc = this.paymentForm.cvc.trim();

    if (!cardName) {
      this.paymentErrors.push('Cardholder name is required.');
    }

    if (!/^\d{13,19}$/.test(cardNumber)) {
      this.paymentErrors.push('Card number must contain 13 to 19 digits.');
    }

    if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiry)) {
      this.paymentErrors.push('Expiry must use MM/YY format.');
    } else {
      const [month, year] = expiry.split('/').map(Number);
      const current = new Date();
      const expiryDate = new Date(2000 + year, month, 0, 23, 59, 59);
      if (expiryDate < current) {
        this.paymentErrors.push('Card expiry date must be in the future.');
      }
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      this.paymentErrors.push('CVC must be 3 or 4 digits.');
    }

    return this.paymentErrors.length === 0;
  }

  saveCardInfo(): void {
    const cardNumber = this.paymentForm.cardNumber.replace(/\s+/g, '');
    localStorage.setItem(
      'savedCard',
      JSON.stringify({
        cardName: this.paymentForm.cardName,
        last4: cardNumber.slice(-4),
        expiry: this.paymentForm.expiry
      })
    );
    this.loadSavedCard();
  }

  cancel(booking: Booking): void {
    this.error = null;
    this.message = null;
    this.selectedBookingToCancel = booking;
  }

  confirmCancel(booking: Booking): void {
    this.bookingApi.updateBooking(booking.id, { action: 'cancel' }).subscribe({
      next: response => {
        booking.status = response.data.status;
        this.message = 'Booking cancelled successfully.';
        this.closeModal();
      },
      error: err => {
        this.error = err.error?.message ?? 'Unable to cancel booking.';
      }
    });
  }

  removeBooking(booking: Booking): void {
    if (!confirm(`Remove cancelled booking for ${booking.aranzman.naziv}?`)) {
      return;
    }

    this.bookingApi.deleteBooking(booking.id).subscribe({
      next: () => {
        this.bookings = this.bookings.filter(item => item.id !== booking.id);
        this.message = 'Cancelled booking removed from your list.';
      },
      error: err => {
        this.error = err.error?.message ?? 'Unable to remove cancelled booking.';
      }
    });
  }

  closeModal(): void {
    this.selectedBookingToPay = null;
    this.selectedBookingToCancel = null;
    this.paymentForm = {
      cardName: '',
      cardNumber: '',
      expiry: '',
      cvc: '',
      saveCard: false
    };
  }
}

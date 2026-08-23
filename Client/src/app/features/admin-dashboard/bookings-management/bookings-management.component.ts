import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-bookings-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings-management.component.html',
  styleUrls: ['./bookings-management.component.scss']
})
export class BookingsManagementComponent implements OnInit {
  bookings: Booking[] = [];
  errorMessage = '';
  successMessage = '';
  editingBookingId: number | null = null;
  editFormData = { status: '', payment_status: '', notes: '' };
  readonly statuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
  readonly paymentStatuses = ['UNPAID', 'PAID'];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.api.get<{ success: boolean; data: Booking[] }>('api/admin/bookings/').subscribe({
      next: response => this.bookings = response.data,
      error: () => this.errorMessage = 'Failed to load bookings.'
    });
  }

  startEdit(booking: Booking): void {
    this.editingBookingId = booking.id;
    this.editFormData = {
      status: booking.status,
      payment_status: booking.payment_status,
      notes: booking.notes || ''
    };
  }

  cancelEdit(): void {
    this.editingBookingId = null;
  }

  saveEdit(id: number): void {
    this.api.put(`api/admin/bookings/${id}/`, this.editFormData).subscribe({
      next: () => {
        this.successMessage = 'Booking updated successfully.';
        this.cancelEdit();
        this.loadBookings();
      },
      error: () => this.errorMessage = 'Failed to update booking.'
    });
  }

  deleteBooking(id: number): void {
    if (!confirm(`Delete booking #${id}?`)) {
      return;
    }

    this.api.delete(`api/admin/bookings/${id}/`).subscribe({
      next: () => {
        this.successMessage = 'Booking deleted successfully.';
        this.loadBookings();
      },
      error: () => this.errorMessage = 'Failed to delete booking.'
    });
  }
}

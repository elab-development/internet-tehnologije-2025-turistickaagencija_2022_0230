import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Booking } from '../../../core/models/booking.model';

@Component({
  selector: 'app-agent-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-bookings.component.html',
  styleUrls: ['./agent-bookings.component.scss']
})
export class AgentBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  errorMessage = '';
  successMessage = '';
  loading = false;
  editingBookingId: number | null = null;
  editFormData = { status: '', payment_status: '', notes: '' };
  readonly statuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
  readonly paymentStatuses = ['UNPAID', 'PAID'];

  // ===== Paginacija =====
  pageSize = 10;
  currentPage = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.api.get<{ success: boolean; data: Booking[] }>('agent/bookings/').subscribe({
      next: response => {
        this.loading = false;
        this.bookings = response.data;
        this.clampCurrentPage();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load bookings for your arrangements.';
      }
    });
  }

  toggleBooking(booking: Booking): void {
    if (this.editingBookingId === booking.id) {
      this.editingBookingId = null;
      return;
    }
    this.editingBookingId = booking.id;
    this.editFormData = {
      status: booking.status,
      payment_status: booking.payment_status,
      notes: booking.notes || ''
    };
  }

  saveEdit(id: number): void {
    this.api.put(`agent/bookings/${id}/`, this.editFormData).subscribe({
      next: () => {
        this.successMessage = 'Booking updated successfully.';
        this.editingBookingId = null;
        this.loadBookings();
      },
      error: () => this.errorMessage = 'Failed to update booking.'
    });
  }

  deleteBooking(id: number): void {
    if (!confirm(`Delete booking #${id}?`)) {
      return;
    }
    this.api.delete(`agent/bookings/${id}/`).subscribe({
      next: () => {
        this.successMessage = 'Booking deleted successfully.';
        if (this.editingBookingId === id) {
          this.editingBookingId = null;
        }
        this.loadBookings();
      },
      error: () => this.errorMessage = 'Failed to delete booking.'
    });
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  // ===== Paginacija =====
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.bookings.length / this.pageSize));
  }

  get pagedBookings(): Booking[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.bookings.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.editingBookingId = null;
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  private clampCurrentPage(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }
}
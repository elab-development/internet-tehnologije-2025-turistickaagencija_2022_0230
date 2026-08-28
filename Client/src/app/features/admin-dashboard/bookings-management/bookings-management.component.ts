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
    this.api.get<{ success: boolean; data: Booking[] }>('admin/bookings/').subscribe({
      next: response => {
        this.loading = false;
        this.bookings = response.data;
        this.clampCurrentPage();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load bookings.';
      }
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

  // Wrapper za strelicu na kartici — otvara ili zatvara isti edit blok
  toggleBooking(booking: Booking): void {
    if (this.editingBookingId === booking.id) {
      this.cancelEdit();
    } else {
      this.startEdit(booking);
    }
  }

  saveEdit(id: number): void {
    this.api.put(`admin/bookings/${id}/`, this.editFormData).subscribe({
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

    this.api.delete(`admin/bookings/${id}/`).subscribe({
      next: () => {
        this.successMessage = 'Booking deleted successfully.';
        if (this.editingBookingId === id) {
          this.cancelEdit();
        }
        this.loadBookings();
      },
      error: () => this.errorMessage = 'Failed to delete booking.'
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'badge-confirmed';
      case 'PENDING':
        return 'badge-pending';
      case 'CANCELLED':
        return 'badge-cancelled';
      default:
        return 'badge-default';
    }
  }

  getPaymentClass(paymentStatus: string): string {
    return paymentStatus === 'PAID' ? 'badge-paid' : 'badge-unpaid';
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
    this.cancelEdit();
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
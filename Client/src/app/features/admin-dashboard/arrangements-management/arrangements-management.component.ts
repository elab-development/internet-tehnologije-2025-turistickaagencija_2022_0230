import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Transport } from '../../../core/models/transport.model';

interface Country {
  id: number;
  name: string;
}

interface Destination {
  id: number;
  name: string;
  country: Country;
}

interface Hotel {
  id: number;
  name: string;
  destination: Destination;
}

interface Arrangement {
  id: number;
  name: string;
  destination: Destination;
  hotel: Hotel | null;
  transport: Transport | null;
  start_date: string;
  end_date: string;
  number_of_nights: number;
  price: number;
  price_per_child: number | null;
  capacity: number;
  description: string;
  included_services: string;
  excluded_services: string;
  meeting_point: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  is_active: boolean;
}

@Component({
  selector: 'app-arrangements-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './arrangements-management.component.html',
  styleUrls: ['./arrangements-management.component.scss']
})
export class ArrangementsManagementComponent implements OnInit {
  arrangements: Arrangement[] = [];
  hotels: Hotel[] = [];
  destinations: Destination[] = [];
  transports: Transport[] = [];
  errorMessage = '';
  successMessage = '';
  loading = false;
  editingArrangementId: number | null = null;
  showAddForm = false;
  editFormData = {
    name: '',
    destination_id: 0,
    hotel_id: 0,
    transport_id: null as number | null,
    start_date: '',
    end_date: '',
    number_of_nights: 0,
    price: 0,
    price_per_child: null as number | null,
    capacity: 0,
    description: '',
    included_services: '',
    excluded_services: '',
    meeting_point: '',
    status: 'PUBLISHED' as Arrangement['status'],
    is_active: true
  };
  newArrangement = { ...this.editFormData };

  // ===== Paginacija =====
  pageSize = 10;
  currentPage = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDestinations();
    this.loadHotels();
    this.loadTransports();
    this.loadArrangements();
  }

  loadDestinations(): void {
    this.api.get<any>('api/destinations/').subscribe({
      next: response => {
        this.destinations = this.resolveData(response);
      },
      error: () => {
        this.errorMessage = 'Failed to load destinations.';
      }
    });
  }

  loadHotels(): void {
    this.api.get<any>('api/hotels/').subscribe({
      next: response => {
        this.hotels = this.resolveData(response);
      },
      error: () => {
        this.errorMessage = 'Failed to load hotels.';
      }
    });
  }

  loadTransports(): void {
    this.api.get<any>('api/transports/').subscribe({
      next: response => this.transports = this.resolveData(response),
      error: () => this.errorMessage = 'Failed to load transports.'
    });
  }

  loadArrangements(): void {
    this.loading = true;
    this.api.get<any>('api/arrangements/').subscribe({
      next: response => {
        this.loading = false;
        this.arrangements = this.resolveData(response);
        this.clampCurrentPage();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load arrangements.';
      }
    });
  }

  resolveData(response: any): any {
    return response && response.success !== undefined ? response.data : response;
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.errorMessage = '';
    this.successMessage = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showAddForm) {
      this.toggleAddForm();
    }
  }

  addArrangement(): void {
    if (!this.newArrangement.name.trim() || !this.newArrangement.destination_id || !this.newArrangement.hotel_id) {
      this.errorMessage = 'Name, destination, and hotel are required.';
      return;
    }

    this.api.post('api/arrangements/', this.newArrangement).subscribe({
      next: () => {
        this.successMessage = 'Arrangement added successfully.';
        this.newArrangement = { ...this.editFormData };
        this.showAddForm = false;
        this.currentPage = 1;
        this.loadArrangements();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to add arrangement.';
      }
    });
  }

  startEdit(arrangement: Arrangement): void {
    this.editingArrangementId = arrangement.id;
    this.editFormData = {
      name: arrangement.name,
      destination_id: arrangement.destination.id,
      hotel_id: arrangement.hotel?.id ?? 0,
      transport_id: arrangement.transport?.id ?? null,
      start_date: arrangement.start_date,
      end_date: arrangement.end_date,
      number_of_nights: arrangement.number_of_nights,
      price: Number(arrangement.price),
      price_per_child: arrangement.price_per_child === null ? null : Number(arrangement.price_per_child),
      capacity: arrangement.capacity,
      description: arrangement.description,
      included_services: arrangement.included_services,
      excluded_services: arrangement.excluded_services,
      meeting_point: arrangement.meeting_point,
      status: arrangement.status,
      is_active: arrangement.is_active
    };
  }

  cancelEdit(): void {
    this.editingArrangementId = null;
    this.editFormData = { ...this.newArrangement };
  }

  // Wrapper za strelicu na kartici — otvara ili zatvara isti edit blok
  toggleArrangement(arrangement: Arrangement): void {
    if (this.editingArrangementId === arrangement.id) {
      this.cancelEdit();
    } else {
      this.startEdit(arrangement);
    }
  }

  saveEdit(arrangementId: number): void {
    if (!this.editFormData.name.trim() || !this.editFormData.destination_id || !this.editFormData.hotel_id) {
      this.errorMessage = 'Name, destination, and hotel are required.';
      return;
    }

    this.api.put(`api/arrangements/${arrangementId}/`, this.editFormData).subscribe({
      next: () => {
        this.successMessage = 'Arrangement updated successfully.';
        this.cancelEdit();
        this.loadArrangements();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to update arrangement.';
      }
    });
  }

  deleteArrangement(id: number, name: string): void {
    if (!confirm(`Delete arrangement "${name}"?`)) {
      return;
    }

    this.api.delete(`api/arrangements/${id}/`).subscribe({
      next: () => {
        this.successMessage = `Arrangement "${name}" deleted.`;
        if (this.editingArrangementId === id) {
          this.cancelEdit();
        }
        this.loadArrangements();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to delete arrangement.';
      }
    });
  }

  getStatusClass(status: Arrangement['status']): string {
    switch (status) {
      case 'PUBLISHED':
        return 'badge-published';
      case 'DRAFT':
        return 'badge-draft';
      case 'CANCELLED':
        return 'badge-cancelled';
      case 'COMPLETED':
        return 'badge-completed';
      default:
        return 'badge-default';
    }
  }

  // ===== Paginacija =====
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.arrangements.length / this.pageSize));
  }

  get pagedArrangements(): Arrangement[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.arrangements.slice(start, start + this.pageSize);
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
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Arrangement } from '../../../core/models/arrangement.model';
import { Destination } from '../../../core/models/destination.model';
import { Hotel } from '../../../core/models/hotel.model';

interface ArrangementFormData {
  name: string;
  destination_id: number;
  hotel_id: number;
  start_date: string;
  end_date: string;
  number_of_nights: number;
  price: number;
  capacity: number;
  description: string;
}

@Component({
  selector: 'app-agent-arrangements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-arrangements.component.html',
  styleUrls: ['./agent-arrangements.component.scss']
})
export class AgentArrangementsComponent implements OnInit {
  arrangements: Arrangement[] = [];
  hotels: Hotel[] = [];
  destinations: Destination[] = [];
  errorMessage = '';
  successMessage = '';
  loading = false;
  editingArrangementId: number | null = null;
  showAddForm = false;

  private emptyFormData: ArrangementFormData = {
    name: '',
    destination_id: 0,
    hotel_id: 0,
    start_date: '',
    end_date: '',
    number_of_nights: 1,
    price: 0,
    capacity: 1,
    description: ''
  };

  editFormData: ArrangementFormData = { ...this.emptyFormData };
  newArrangement: ArrangementFormData = { ...this.emptyFormData };

  // ===== Paginacija =====
  pageSize = 10;
  currentPage = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDestinations();
    this.loadHotels();
    this.loadArrangements();
  }

  loadDestinations(): void {
    this.api.get<any>('destinations/').subscribe({
      next: response => {
        this.destinations = this.resolveData(response);
      },
      error: () => {
        this.errorMessage = 'Failed to load destinations.';
      }
    });
  }

  loadHotels(): void {
    this.api.get<any>('hotels/').subscribe({
      next: response => {
        this.hotels = this.resolveData(response);
      },
      error: () => {
        this.errorMessage = 'Failed to load hotels.';
      }
    });
  }

  loadArrangements(): void {
    this.loading = true;
    this.api.get<any>('arrangements/').subscribe({
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

  private isFormValid(form: ArrangementFormData): boolean {
    return !!(
      form.name.trim() &&
      form.destination_id &&
      form.hotel_id &&
      form.start_date &&
      form.end_date
    );
  }

  addArrangement(): void {
    if (!this.isFormValid(this.newArrangement)) {
      this.errorMessage = 'Name, destination, hotel, and dates are required.';
      return;
    }

    this.api.post('arrangements/', this.newArrangement).subscribe({
      next: () => {
        this.successMessage = 'Arrangement added successfully.';
        this.newArrangement = { ...this.emptyFormData };
        this.showAddForm = false;
        this.currentPage = 1;
        this.loadArrangements();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.description?.[0] || 'Failed to add arrangement.';
      }
    });
  }

  startEdit(arrangement: Arrangement): void {
    this.editingArrangementId = arrangement.id;
    this.editFormData = {
      name: arrangement.name,
      destination_id: arrangement.destination.id,
      hotel_id: arrangement.hotel?.id ?? 0,
      start_date: arrangement.start_date,
      end_date: arrangement.end_date,
      number_of_nights: arrangement.number_of_nights,
      price: Number(arrangement.price),
      capacity: arrangement.capacity,
      description: arrangement.description
    };
  }

  cancelEdit(): void {
    this.editingArrangementId = null;
    this.editFormData = { ...this.emptyFormData };
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
    if (!this.isFormValid(this.editFormData)) {
      this.errorMessage = 'Name, destination, hotel, and dates are required.';
      return;
    }

    this.api.put(`arrangements/${arrangementId}/`, this.editFormData).subscribe({
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

    this.api.delete(`arrangements/${id}/`).subscribe({
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
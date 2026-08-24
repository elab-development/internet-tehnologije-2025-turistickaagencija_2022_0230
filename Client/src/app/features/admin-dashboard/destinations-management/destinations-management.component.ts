import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

interface Country {
  id: number;
  name: string;
}

interface Destination {
  id: number;
  name: string;
  image: string | null;
  country: Country;
}

interface DestinationsResponse {
  success: boolean;
  data: Destination[];
}

@Component({
  selector: 'app-destinations-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './destinations-management.component.html',
  styleUrls: ['./destinations-management.component.scss']
})
export class DestinationsManagementComponent implements OnInit {
  destinations: Destination[] = [];
  countries: Country[] = [];
  errorMessage = '';
  successMessage = '';
  loading = false;
  editingDestinationId: number | null = null;
  showAddForm = false;
  editFormData = { name: '', image: '', country_id: 0 };
  newDestination = { name: '', image: '', country_id: 0 };

  // ===== Paginacija =====
  pageSize = 10;
  currentPage = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCountries();
    this.loadDestinations();
  }

  loadCountries(): void {
    this.api.get<any>('countries/').subscribe({
      next: response => {
        this.countries = this.resolveData(response);
      },
      error: () => {
        this.errorMessage = 'Failed to load countries.';
      }
    });
  }

  loadDestinations(): void {
    this.loading = true;
    this.api.get<any>('destinations/').subscribe({
      next: response => {
        this.loading = false;
        this.destinations = this.resolveData(response);
        this.clampCurrentPage();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load destinations.';
      }
    });
  }

  resolveData(response: any): any {
    if (response && response.success !== undefined) {
      return response.data;
    }
    return response;
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

  addDestination(): void {
    if (!this.newDestination.name.trim() || !this.newDestination.country_id) {
      this.errorMessage = 'Name and country are required.';
      return;
    }

    this.api.post('destinations/', this.newDestination).subscribe({
      next: () => {
        this.successMessage = 'Destination added successfully.';
        this.newDestination = { name: '', image: '', country_id: 0 };
        this.showAddForm = false;
        this.currentPage = 1;
        this.loadDestinations();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to add destination.';
      }
    });
  }

  startEdit(destination: Destination): void {
    this.editingDestinationId = destination.id;
    this.editFormData = {
      name: destination.name,
      image: destination.image || '',
      country_id: destination.country.id
    };
  }

  cancelEdit(): void {
    this.editingDestinationId = null;
    this.editFormData = { name: '', image: '', country_id: 0 };
  }

  // Wrapper za strelicu na kartici — otvara ili zatvara isti edit blok
  toggleDestination(destination: Destination): void {
    if (this.editingDestinationId === destination.id) {
      this.cancelEdit();
    } else {
      this.startEdit(destination);
    }
  }

  saveEdit(destinationId: number): void {
    if (!this.editFormData.name.trim() || !this.editFormData.country_id) {
      this.errorMessage = 'Name and country are required.';
      return;
    }

    this.api.put(`destinations/${destinationId}/`, this.editFormData).subscribe({
      next: () => {
        this.successMessage = 'Destination updated successfully.';
        this.cancelEdit();
        this.loadDestinations();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to update destination.';
      }
    });
  }

  deleteDestination(id: number, name: string): void {
    if (!confirm(`Delete destination "${name}"?`)) {
      return;
    }

    this.api.delete(`destinations/${id}/`).subscribe({
      next: () => {
        this.successMessage = `Destination "${name}" deleted.`;
        if (this.editingDestinationId === id) {
          this.cancelEdit();
        }
        this.loadDestinations();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to delete destination.';
      }
    });
  }

  // ===== Paginacija =====
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.destinations.length / this.pageSize));
  }

  get pagedDestinations(): Destination[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.destinations.slice(start, start + this.pageSize);
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
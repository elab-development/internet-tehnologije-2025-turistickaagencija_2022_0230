import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

interface Country {
  id: number;
  name: string;
}

interface CountriesResponse {
  success: boolean;
  data: Country[];
}

@Component({
  selector: 'app-countries-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './countries-management.component.html',
  styleUrls: ['./countries-management.component.scss']
})
export class CountriesManagementComponent implements OnInit {
  countries: Country[] = [];
  errorMessage = '';
  successMessage = '';
  loading = false;
  editingCountryId: number | null = null;
  showAddForm = false;
  editFormData: { name: string } = { name: '' };
  newCountry: { name: string } = { name: '' };

  // ===== Paginacija =====
  pageSize = 10;
  currentPage = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.loading = true;
    this.api.get<CountriesResponse>('countries/').subscribe({
      next: (response: any) => {
        this.loading = false;
        const data = this.resolveData(response);
        this.countries = data;
        this.clampCurrentPage();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load countries.';
      }
    });
  }

  resolveData(response: any): Country[] {
    return response && response.success ? response.data : response;
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

  addCountry(): void {
    if (!this.newCountry.name.trim()) {
      this.errorMessage = 'Country name is required.';
      return;
    }

    this.api.post('countries/', this.newCountry).subscribe({
      next: () => {
        this.successMessage = 'Country added successfully.';
        this.newCountry = { name: '' };
        this.showAddForm = false;
        this.currentPage = 1;
        this.loadCountries();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to add country.';
      }
    });
  }

  startEdit(country: Country): void {
    this.editingCountryId = country.id;
    this.editFormData = { name: country.name };
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.editingCountryId = null;
    this.editFormData = { name: '' };
  }

  // Wrapper za strelicu na kartici — otvara ili zatvara isti edit blok
  toggleCountry(country: Country): void {
    if (this.editingCountryId === country.id) {
      this.cancelEdit();
    } else {
      this.startEdit(country);
    }
  }

  saveEdit(countryId: number): void {
    if (!this.editFormData.name.trim()) {
      this.errorMessage = 'Country name is required.';
      return;
    }

    this.api.put(`countries/${countryId}/`, this.editFormData).subscribe({
      next: () => {
        this.successMessage = 'Country updated successfully.';
        this.cancelEdit();
        this.loadCountries();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to update country.';
      }
    });
  }

  deleteCountry(id: number, name: string): void {
    if (!confirm(`Delete country "${name}"?`)) {
      return;
    }

    this.api.delete(`countries/${id}/`).subscribe({
      next: () => {
        this.successMessage = `Country "${name}" deleted.`;
        if (this.editingCountryId === id) {
          this.cancelEdit();
        }
        this.loadCountries();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to delete country.';
      }
    });
  }

  // ===== Paginacija =====
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.countries.length / this.pageSize));
  }

  get pagedCountries(): Country[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.countries.slice(start, start + this.pageSize);
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
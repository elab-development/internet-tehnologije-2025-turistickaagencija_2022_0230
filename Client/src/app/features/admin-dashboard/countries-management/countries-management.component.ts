import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

interface Country {
  id: number;
  naziv: string;
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
  editingCountryId: number | null = null;
  showAddForm = false;
  editFormData: { naziv: string } = { naziv: '' };
  newCountry: { naziv: string } = { naziv: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.api.get<CountriesResponse>('api/countries/').subscribe({
      next: (response: any) => {
        const data = this.resolveData(response);
        this.countries = data;
      },
      error: () => {
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

  addCountry(): void {
    if (!this.newCountry.naziv.trim()) {
      this.errorMessage = 'Country name is required.';
      return;
    }

    this.api.post('api/countries/', this.newCountry).subscribe({
      next: () => {
        this.successMessage = 'Country added successfully.';
        this.newCountry = { naziv: '' };
        this.showAddForm = false;
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
    this.editFormData = { naziv: country.naziv };
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.editingCountryId = null;
    this.editFormData = { naziv: '' };
  }

  saveEdit(countryId: number): void {
    if (!this.editFormData.naziv.trim()) {
      this.errorMessage = 'Country name is required.';
      return;
    }

    this.api.put(`api/countries/${countryId}/`, this.editFormData).subscribe({
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

  deleteCountry(id: number, naziv: string): void {
    if (!confirm(`Delete country "${naziv}"?`)) {
      return;
    }

    this.api.delete(`api/countries/${id}/`).subscribe({
      next: () => {
        this.successMessage = `Country "${naziv}" deleted.`;
        this.loadCountries();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to delete country.';
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
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
  editingDestinationId: number | null = null;
  showAddForm = false;
  editFormData = { name: '', image: '', country_id: 0 };
  newDestination = { name: '', image: '', country_id: 0 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCountries();
    this.loadDestinations();
  }

  loadCountries(): void {
    this.api.get<any>('api/countries/').subscribe({
      next: response => {
        this.countries = this.resolveData(response);
      },
      error: () => {
        this.errorMessage = 'Failed to load countries.';
      }
    });
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

  addDestination(): void {
    if (!this.newDestination.name.trim() || !this.newDestination.country_id) {
      this.errorMessage = 'Name and country are required.';
      return;
    }

    this.api.post('api/destinations/', this.newDestination).subscribe({
      next: () => {
        this.successMessage = 'Destination added successfully.';
        this.newDestination = { name: '', image: '', country_id: 0 };
        this.showAddForm = false;
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

  saveEdit(destinationId: number): void {
    if (!this.editFormData.name.trim() || !this.editFormData.country_id) {
      this.errorMessage = 'Name and country are required.';
      return;
    }

    this.api.put(`api/destinations/${destinationId}/`, this.editFormData).subscribe({
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

    this.api.delete(`api/destinations/${id}/`).subscribe({
      next: () => {
        this.successMessage = `Destination "${name}" deleted.`;
        this.loadDestinations();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to delete destination.';
      }
    });
  }
}

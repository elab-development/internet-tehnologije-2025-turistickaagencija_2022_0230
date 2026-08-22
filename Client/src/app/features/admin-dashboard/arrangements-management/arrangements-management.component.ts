import { Component, OnInit } from '@angular/core';
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
  capacity: number;
  description: string;
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
    capacity: 0,
    description: ''
  };
  newArrangement = { ...this.editFormData };

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
    this.api.get<any>('api/arrangements/').subscribe({
      next: response => {
        this.arrangements = this.resolveData(response);
      },
      error: () => {
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
      capacity: arrangement.capacity,
      description: arrangement.description
    };
  }

  cancelEdit(): void {
    this.editingArrangementId = null;
    this.editFormData = { ...this.newArrangement };
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
        this.loadArrangements();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to delete arrangement.';
      }
    });
  }
}

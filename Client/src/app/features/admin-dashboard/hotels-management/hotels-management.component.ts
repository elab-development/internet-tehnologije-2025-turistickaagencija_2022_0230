import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

interface Country {
  id: number;
  naziv: string;
}

interface Destination {
  id: number;
  naziv: string;
}

interface Hotel {
  id: number;
  naziv: string;
  slika: string;
  ocena: number;
  cena_nocenja: number;
  destinacija: Destination;
}

@Component({
  selector: 'app-hotels-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotels-management.component.html',
  styleUrls: ['./hotels-management.component.scss']
})
export class HotelsManagementComponent implements OnInit {
  hotels: Hotel[] = [];
  destinations: Destination[] = [];
  errorMessage = '';
  successMessage = '';
  editingHotelId: number | null = null;
  showAddForm = false;
  editFormData = { naziv: '', slika: '', ocena: 0, cena_nocenja: 0, destinacija_id: 0 };
  newHotel = { naziv: '', slika: '', ocena: 0, cena_nocenja: 0, destinacija_id: 0 };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDestinations();
    this.loadHotels();
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

  resolveData(response: any): any {
    return response && response.success !== undefined ? response.data : response;
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.errorMessage = '';
    this.successMessage = '';
  }

  addHotel(): void {
    if (!this.newHotel.naziv.trim() || !this.newHotel.destinacija_id) {
      this.errorMessage = 'Name and destination are required.';
      return;
    }

    this.api.post('api/hotels/', this.newHotel).subscribe({
      next: () => {
        this.successMessage = 'Hotel added successfully.';
        this.newHotel = { naziv: '', slika: '', ocena: 0, cena_nocenja: 0, destinacija_id: 0 };
        this.showAddForm = false;
        this.loadHotels();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to add hotel.';
      }
    });
  }

  startEdit(hotel: Hotel): void {
    this.editingHotelId = hotel.id;
    this.editFormData = {
      naziv: hotel.naziv,
      slika: hotel.slika,
      ocena: hotel.ocena,
      cena_nocenja: hotel.cena_nocenja,
      destinacija_id: hotel.destinacija.id
    };
  }

  cancelEdit(): void {
    this.editingHotelId = null;
    this.editFormData = { naziv: '', slika: '', ocena: 0, cena_nocenja: 0, destinacija_id: 0 };
  }

  saveEdit(hotelId: number): void {
    if (!this.editFormData.naziv.trim() || !this.editFormData.destinacija_id) {
      this.errorMessage = 'Name and destination are required.';
      return;
    }

    this.api.put(`api/hotels/${hotelId}/`, this.editFormData).subscribe({
      next: () => {
        this.successMessage = 'Hotel updated successfully.';
        this.cancelEdit();
        this.loadHotels();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to update hotel.';
      }
    });
  }

  deleteHotel(id: number, naziv: string): void {
    if (!confirm(`Delete hotel "${naziv}"?`)) {
      return;
    }

    this.api.delete(`api/hotels/${id}/`).subscribe({
      next: () => {
        this.successMessage = `Hotel "${naziv}" deleted.`;
        this.loadHotels();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to delete hotel.';
      }
    });
  }
}

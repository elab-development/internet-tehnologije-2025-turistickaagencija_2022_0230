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
  drzava: Country;
}

interface Hotel {
  id: number;
  naziv: string;
  destinacija: Destination;
}

interface Arrangement {
  id: number;
  naziv: string;
  destinacija: Destination;
  hotel: Hotel;
  datum_pocetka: string;
  datum_zavrsetka: string;
  broj_nocenja: number;
  cena: number;
  broj_mesta: number;
  opis: string;
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
  errorMessage = '';
  successMessage = '';
  editingArrangementId: number | null = null;
  showAddForm = false;
  editFormData = {
    naziv: '',
    destinacija_id: 0,
    hotel_id: 0,
    datum_pocetka: '',
    datum_zavrsetka: '',
    broj_nocenja: 0,
    cena: 0,
    broj_mesta: 0,
    opis: ''
  };
  newArrangement = { ...this.editFormData };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDestinations();
    this.loadHotels();
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
    if (!this.newArrangement.naziv.trim() || !this.newArrangement.destinacija_id || !this.newArrangement.hotel_id) {
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
      naziv: arrangement.naziv,
      destinacija_id: arrangement.destinacija.id,
      hotel_id: arrangement.hotel.id,
      datum_pocetka: arrangement.datum_pocetka,
      datum_zavrsetka: arrangement.datum_zavrsetka,
      broj_nocenja: arrangement.broj_nocenja,
      cena: arrangement.cena,
      broj_mesta: arrangement.broj_mesta,
      opis: arrangement.opis
    };
  }

  cancelEdit(): void {
    this.editingArrangementId = null;
    this.editFormData = {
      naziv: '',
      destinacija_id: 0,
      hotel_id: 0,
      datum_pocetka: '',
      datum_zavrsetka: '',
      broj_nocenja: 0,
      cena: 0,
      broj_mesta: 0,
      opis: ''
    };
  }

  saveEdit(arrangementId: number): void {
    if (!this.editFormData.naziv.trim() || !this.editFormData.destinacija_id || !this.editFormData.hotel_id) {
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

  deleteArrangement(id: number, naziv: string): void {
    if (!confirm(`Delete arrangement "${naziv}"?`)) {
      return;
    }

    this.api.delete(`api/arrangements/${id}/`).subscribe({
      next: () => {
        this.successMessage = `Arrangement "${naziv}" deleted.`;
        this.loadArrangements();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to delete arrangement.';
      }
    });
  }
}

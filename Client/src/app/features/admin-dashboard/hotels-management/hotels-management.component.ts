import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

interface Destination {
  id: number;
  name: string;
}

interface Hotel {
  id: number;
  name: string;
  image: string | null;
  rating: number;
  price_per_night: number;
  latitude: number | null;
  longitude: number | null;
  destination: Destination;
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
  loading = false;
  editingHotelId: number | null = null;
  showAddForm = false;
  selectedImageFile: File | null = null;
  newImageFile: File | null = null;
  editFormData = { name: '', image: '', rating: 0, price_per_night: 0, latitude: null as number | null, longitude: null as number | null, destination_id: 0 };
  newHotel = { name: '', image: '', rating: 0, price_per_night: 0, latitude: null as number | null, longitude: null as number | null, destination_id: 0 };

  // ===== Paginacija =====
  pageSize = 10;
  currentPage = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDestinations();
    this.loadHotels();
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
    this.loading = true;
    this.api.get<any>('hotels/').subscribe({
      next: response => {
        this.loading = false;
        this.hotels = this.resolveData(response);
        this.clampCurrentPage();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load hotels.';
      }
    });
  }

  resolveData(response: any): any {
    return response && response.success !== undefined ? response.data : response;
  }

  getImageUrl(image: string | null): string | null {
    if (!image || image.startsWith('http')) {
      return image;
    }
    return `${environment.mediaUrl}${image.startsWith('/') ? image : `/${image}`}`;
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

  addHotel(): void {
    if (!this.newHotel.name.trim() || !this.newHotel.destination_id) {
      this.errorMessage = 'Name and destination are required.';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.newHotel.name);
    formData.append('rating', String(this.newHotel.rating));
    formData.append('price_per_night', String(this.newHotel.price_per_night));
    formData.append('destination_id', String(this.newHotel.destination_id));
    if (this.newHotel.latitude !== null) {
      formData.append('latitude', String(this.newHotel.latitude));
    }
    if (this.newHotel.longitude !== null) {
      formData.append('longitude', String(this.newHotel.longitude));
    }
    if (this.newImageFile) {
      formData.append('image', this.newImageFile);
    }

    this.api.post('hotels/', formData).subscribe({
      next: () => {
        this.successMessage = 'Hotel added successfully.';
        this.newHotel = { name: '', image: '', rating: 0, price_per_night: 0, latitude: null, longitude: null, destination_id: 0 };
        this.newImageFile = null;
        this.showAddForm = false;
        this.currentPage = 1;
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
    this.selectedImageFile = null;
    this.editFormData = {
      name: hotel.name,
      image: hotel.image || '',
      rating: hotel.rating,
      price_per_night: hotel.price_per_night,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      destination_id: hotel.destination.id
    };
  }

  cancelEdit(): void {
    this.editingHotelId = null;
    this.selectedImageFile = null;
    this.editFormData = { name: '', image: '', rating: 0, price_per_night: 0, latitude: null, longitude: null, destination_id: 0 };
  }

  // Wrapper za strelicu na kartici — otvara ili zatvara isti edit blok
  toggleHotel(hotel: Hotel): void {
    if (this.editingHotelId === hotel.id) {
      this.cancelEdit();
    } else {
      this.startEdit(hotel);
    }
  }

  saveEdit(hotelId: number): void {
    if (!this.editFormData.name.trim() || !this.editFormData.destination_id) {
      this.errorMessage = 'Name and destination are required.';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.editFormData.name);
    formData.append('rating', String(this.editFormData.rating));
    formData.append('price_per_night', String(this.editFormData.price_per_night));
    formData.append('destination_id', String(this.editFormData.destination_id));
    if (this.editFormData.latitude !== null) {
      formData.append('latitude', String(this.editFormData.latitude));
    }
    if (this.editFormData.longitude !== null) {
      formData.append('longitude', String(this.editFormData.longitude));
    }
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }

    this.api.put(`hotels/${hotelId}/`, formData).subscribe({
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

  onImageSelected(event: Event, isEdit: boolean): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (isEdit) {
      this.selectedImageFile = file;
    } else {
      this.newImageFile = file;
    }
  }

  deleteHotel(id: number, name: string): void {
    if (!confirm(`Delete hotel "${name}"?`)) {
      return;
    }

    this.api.delete(`hotels/${id}/`).subscribe({
      next: () => {
        this.successMessage = `Hotel "${name}" deleted.`;
        if (this.editingHotelId === id) {
          this.cancelEdit();
        }
        this.loadHotels();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to delete hotel.';
      }
    });
  }

  // ===== Paginacija =====
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.hotels.length / this.pageSize));
  }

  get pagedHotels(): Hotel[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.hotels.slice(start, start + this.pageSize);
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
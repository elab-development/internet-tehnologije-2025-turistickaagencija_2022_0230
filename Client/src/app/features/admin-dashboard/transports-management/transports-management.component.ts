import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Transport } from '../../../core/models/transport.model';

interface TransportFormData {
  company_name: string;
  transport_type: Transport['transport_type'];
  vehicle_name: string;
  departure_location: string;
  arrival_location: string;
  description: string;
  is_active: boolean;
}

@Component({
  selector: 'app-transports-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transports-management.component.html',
  styleUrls: ['./transports-management.component.scss']
})
export class TransportsManagementComponent implements OnInit {
  transports: Transport[] = [];
  errorMessage = '';
  successMessage = '';
  loading = false;
  editingTransportId: number | null = null;
  showAddForm = false;
  readonly transportTypes: Transport['transport_type'][] = ['BUS', 'PLANE', 'TRAIN', 'BOAT', 'OTHER'];
  readonly emptyForm: TransportFormData = {
    company_name: '',
    transport_type: 'BUS',
    vehicle_name: '',
    departure_location: '',
    arrival_location: '',
    description: '',
    is_active: true
  };
  editFormData: TransportFormData = { ...this.emptyForm };
  newTransport: TransportFormData = { ...this.emptyForm };

  // ===== Paginacija =====
  pageSize = 10;
  currentPage = 1;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadTransports();
  }

  loadTransports(): void {
    this.loading = true;
    this.api.get<Transport[]>('transports/').subscribe({
      next: response => {
        this.loading = false;
        this.transports = this.resolveData(response);
        this.clampCurrentPage();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load transports.';
      }
    });
  }

  private resolveData(response: Transport[] | { data: Transport[] }): Transport[] {
    return Array.isArray(response) ? response : response.data;
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

  addTransport(): void {
    if (!this.newTransport.company_name.trim()) {
      this.errorMessage = 'Company name is required.';
      return;
    }

    this.api.post('transports/', this.newTransport).subscribe({
      next: () => {
        this.successMessage = 'Transport added successfully.';
        this.newTransport = { ...this.emptyForm };
        this.showAddForm = false;
        this.currentPage = 1;
        this.loadTransports();
      },
      error: () => this.errorMessage = 'Failed to add transport.'
    });
  }

  startEdit(transport: Transport): void {
    this.editingTransportId = transport.id;
    this.editFormData = {
      company_name: transport.company_name,
      transport_type: transport.transport_type,
      vehicle_name: transport.vehicle_name,
      departure_location: transport.departure_location,
      arrival_location: transport.arrival_location,
      description: transport.description,
      is_active: transport.is_active
    };
  }

  cancelEdit(): void {
    this.editingTransportId = null;
    this.editFormData = { ...this.emptyForm };
  }

  // Wrapper za strelicu na kartici — otvara ili zatvara isti edit blok
  toggleTransport(transport: Transport): void {
    if (this.editingTransportId === transport.id) {
      this.cancelEdit();
    } else {
      this.startEdit(transport);
    }
  }

  saveEdit(id: number): void {
    if (!this.editFormData.company_name.trim()) {
      this.errorMessage = 'Company name is required.';
      return;
    }

    this.api.put(`transports/${id}/`, this.editFormData).subscribe({
      next: () => {
        this.successMessage = 'Transport updated successfully.';
        this.cancelEdit();
        this.loadTransports();
      },
      error: () => this.errorMessage = 'Failed to update transport.'
    });
  }

  deleteTransport(id: number, companyName: string): void {
    if (!confirm(`Delete transport "${companyName}"?`)) {
      return;
    }

    this.api.delete(`transports/${id}/`).subscribe({
      next: () => {
        this.successMessage = `Transport "${companyName}" deleted.`;
        if (this.editingTransportId === id) {
          this.cancelEdit();
        }
        this.loadTransports();
      },
      error: () => this.errorMessage = 'Failed to delete transport.'
    });
  }

  getTransportIcon(type: Transport['transport_type']): string {
    switch (type) {
      case 'PLANE':
        return '✈️';
      case 'TRAIN':
        return '🚆';
      case 'BOAT':
        return '⛴️';
      case 'BUS':
        return '🚌';
      default:
        return '🚐';
    }
  }

  // ===== Paginacija =====
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.transports.length / this.pageSize));
  }

  get pagedTransports(): Transport[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.transports.slice(start, start + this.pageSize);
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
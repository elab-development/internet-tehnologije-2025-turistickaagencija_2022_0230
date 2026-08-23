import { Component, OnInit } from '@angular/core';
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

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadTransports();
  }

  loadTransports(): void {
    this.api.get<Transport[]>('api/transports/').subscribe({
      next: response => this.transports = this.resolveData(response),
      error: () => this.errorMessage = 'Failed to load transports.'
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

  addTransport(): void {
    if (!this.newTransport.company_name.trim()) {
      this.errorMessage = 'Company name is required.';
      return;
    }

    this.api.post('api/transports/', this.newTransport).subscribe({
      next: () => {
        this.successMessage = 'Transport added successfully.';
        this.newTransport = { ...this.emptyForm };
        this.showAddForm = false;
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

  saveEdit(id: number): void {
    if (!this.editFormData.company_name.trim()) {
      this.errorMessage = 'Company name is required.';
      return;
    }

    this.api.put(`api/transports/${id}/`, this.editFormData).subscribe({
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

    this.api.delete(`api/transports/${id}/`).subscribe({
      next: () => {
        this.successMessage = `Transport "${companyName}" deleted.`;
        this.loadTransports();
      },
      error: () => this.errorMessage = 'Failed to delete transport.'
    });
  }
}

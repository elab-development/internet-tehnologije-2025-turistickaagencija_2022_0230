import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  profile: {
    gender: string;
    date_of_birth: string | null;
    phone_number: string;
    created_at: string;
  } | null;
}

interface UsersResponse {
  success: boolean;
  data: {
    admins: User[];
    agents: User[];
    clients: User[];
  };
}

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss']
})
export class UsersManagementComponent implements OnInit {
  users: User[] = [];
  errorMessage = '';
  successMessage = '';
  loading = false;

  // ===== Inline edit (akordeon na kartici) — ista logika kao pre, samo drugi prikaz =====
  editingUserId: number | null = null;
  editFormData = this.emptyFormData();

  // ===== Paginacija =====
  pageSize = 10;
  currentPage = 1;

  // ===== Add user modal =====
  isAddModalOpen = false;
  newUserFormData = this.emptyFormData();
  addErrors: string[] = [];

  private emptyFormData() {
    return { username: '', email: '', password: '', role: '', gender: '', date_of_birth: '', phone_number: '' };
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.api.get<UsersResponse>('users/').subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          const admins = response.data.admins.map(u => ({ ...u, role: 'ADMIN' }));
          const agents = response.data.agents.map(u => ({ ...u, role: 'AGENT' }));
          const clients = response.data.clients.map(u => ({ ...u, role: 'CLIENT' }));
          this.users = [...admins, ...agents, ...clients];
          this.clampCurrentPage();
        } else {
          this.errorMessage = 'Failed to load users';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load users. Check your permissions.';
      }
    });
  }

  // ===== Edit (nepromenjena logika) =====
  startEdit(user: User): void {
    this.editingUserId = user.id;
    this.editFormData = {
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      gender: user.profile?.gender || '',
      date_of_birth: user.profile?.date_of_birth || '',
      phone_number: user.profile?.phone_number || ''
    };
  }

  cancelEdit(): void {
    this.editingUserId = null;
    this.editFormData = this.emptyFormData();
  }

  // Wrapper za strelicu na kartici — otvara ili zatvara isti edit blok
  toggleUser(user: User): void {
    if (this.editingUserId === user.id) {
      this.cancelEdit();
    } else {
      this.startEdit(user);
    }
  }

  saveEdit(userId: number): void {
    this.api.put(`users/${userId}/`, this.editFormData).subscribe({
      next: () => {
        this.successMessage = 'User updated successfully';
        this.cancelEdit();
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update user';
      }
    });
  }

  deleteUser(id: number, username: string): void {
    if (confirm(`Are you sure you want to delete user "${username}"?`)) {
      this.api.delete(`users/${id}/`).subscribe({
        next: () => {
          this.successMessage = `User "${username}" deleted successfully`;
          if (this.editingUserId === id) {
            this.cancelEdit();
          }
          this.loadUsers();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => {
          this.errorMessage = 'Failed to delete user';
        }
      });
    }
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'badge-admin';
      case 'AGENT':
        return 'badge-agent';
      case 'CLIENT':
        return 'badge-client';
      default:
        return 'badge-default';
    }
  }

  getInitials(username: string): string {
    return (username || '?').trim().slice(0, 2).toUpperCase();
  }

  // ===== Paginacija =====
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.users.length / this.pageSize));
  }

  get pagedUsers(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    // Zatvori otvorenu karticu kad se promeni strana da ne ostane "obesen" edit blok
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

  // ===== Add user modal =====
  openAddModal(): void {
    this.newUserFormData = this.emptyFormData();
    this.addErrors = [];
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.newUserFormData = this.emptyFormData();
    this.addErrors = [];
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isAddModalOpen) {
      this.closeAddModal();
    }
  }

  submitAddUser(): void {
    this.addErrors = this.validateNewUser();
    if (this.addErrors.length > 0) {
      return;
    }

    this.api.post('users/', this.newUserFormData).subscribe({
      next: () => {
        this.successMessage = 'User created successfully';
        this.closeAddModal();
        this.currentPage = 1;
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.addErrors = [error.error?.message || 'Failed to create user'];
      }
    });
  }

  private validateNewUser(): string[] {
    const errors: string[] = [];
    const data = this.newUserFormData;

    if (!data.username.trim()) {
      errors.push('Username is required.');
    }
    if (!data.email.trim()) {
      errors.push('Email is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email format is not valid.');
    }
    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
    }
    if (!data.role) {
      errors.push('Role is required.');
    }
    return errors;
  }
}
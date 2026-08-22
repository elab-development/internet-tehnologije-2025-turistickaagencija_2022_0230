import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
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
  editingUserId: number | null = null;
  editFormData: { username: string; email: string; password: string; role: string } = { username: '', email: '', password: '', role: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.api.get<UsersResponse>('api/users/').subscribe({
      next: (response) => {
        if (response.success) {
          const admins = response.data.admins.map(u => ({ ...u, role: 'ADMIN' }));
          const agents = response.data.agents.map(u => ({ ...u, role: 'AGENT' }));
          const clients = response.data.clients.map(u => ({ ...u, role: 'CLIENT' }));
          this.users = [...admins, ...agents, ...clients];
        } else {
          this.errorMessage = 'Failed to load users';
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load users. Check your permissions.';
      }
    });
  }

  startEdit(user: User): void {
    this.editingUserId = user.id;
    this.editFormData = { username: user.username, email: user.email, password: '', role: user.role };
  }

  cancelEdit(): void {
    this.editingUserId = null;
    this.editFormData = { username: '', email: '', password: '', role: '' };
  }

  saveEdit(userId: number): void {
    this.api.put(`api/users/${userId}/`, this.editFormData).subscribe({
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
      this.api.delete(`api/users/${id}/`).subscribe({
        next: () => {
          this.successMessage = `User "${username}" deleted successfully`;
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
}

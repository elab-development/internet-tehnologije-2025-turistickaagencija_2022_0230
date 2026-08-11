import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth/auth.service';

interface DashboardResponse {
  success: boolean;
  data: {
    stats: {
      countries: number;
      destinations: number;
      hotels: number;
      arrangements: number;
      users: number;
    };
    users: any[];
    countries: any[];
    destinations: any[];
    hotels: any[];
    arrangements: any[];
  };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    countries: 0,
    destinations: 0,
    hotels: 0,
    arrangements: 0,
    users: 0
  };

  errorMessage = '';

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.user$;
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.api.get<DashboardResponse>('api/admin/dashboard/').subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data.stats;
        } else {
          this.errorMessage = response.data ? 'Unable to load dashboard data.' : 'Access denied';
        }
      },
      error: () => {
        this.errorMessage = 'You are not authorized to access the admin dashboard.';
      }
    });
  }

  navigateTo(section: string): void {
    switch (section) {
      case 'users':
        this.router.navigate(['/admin/users']);
        break;
      case 'countries':
        this.router.navigate(['/admin/countries']);
        break;
      case 'destinations':
        this.router.navigate(['/admin/destinations']);
        break;
      case 'hotels':
        this.router.navigate(['/admin/hotels']);
        break;
      case 'arrangements':
        this.router.navigate(['/admin/arrangements']);
        break;
    }
  }
}

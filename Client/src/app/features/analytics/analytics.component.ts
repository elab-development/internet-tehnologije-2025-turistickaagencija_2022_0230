import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth/auth.service';

interface AnalyticsData {
  summary: { [key: string]: number };
  bookings_over_time: { label: string; bookings: number; guests: number }[];
  revenue_over_time: { label: string; revenue: number }[];
  booking_status: { label: string; value: number }[];
  payment_status: { label: string; value: number }[];
  arrangement_status: { label: string; value: number }[];
  top_destinations: { name: string; bookings: number; guests: number }[];
  arrangement_performance: { name: string; bookings: number; guests: number; capacity: number; revenue: number }[];
  catalog?: { [key: string]: number };
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  data: AnalyticsData | null = null;
  errorMessage = '';
  isAdmin = false;

  constructor(private api: ApiService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.isAdmin = this.authService.isAdmin();
    const endpoint = this.isAdmin ? 'admin/analytics/' : 'agent/analytics/';
    this.api.get<{ success: boolean; data: AnalyticsData }>(endpoint).subscribe({
      next: response => this.data = response.success ? response.data : null,
      error: () => this.errorMessage = 'Unable to load analytics data.'
    });
  }

  maxValue(values: { value: number }[]): number {
    return Math.max(...values.map(item => item.value), 1);
  }

  maxBookings(): number {
    return Math.max(...(this.data?.bookings_over_time.map(item => item.bookings) || [1]), 1);
  }

  maxRevenue(): number {
    return Math.max(...(this.data?.revenue_over_time.map(item => item.revenue) || [1]), 1);
  }

  utilization(item: { guests: number; capacity: number }): number {
    return item.capacity ? Math.min(100, Math.round(item.guests / item.capacity * 100)) : 0;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }
}

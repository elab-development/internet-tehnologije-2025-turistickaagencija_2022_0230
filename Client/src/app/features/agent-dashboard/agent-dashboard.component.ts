import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.scss']
})
export class AgentDashboardComponent implements OnInit {
  arrangementsCount = 0;
  errorMessage = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('api/arrangements/').subscribe({
      next: response => {
        const data = response && response.success !== undefined ? response.data : response;
        this.arrangementsCount = Array.isArray(data) ? data.length : 0;
      },
      error: () => {
        this.errorMessage = 'Unable to load arrangements.';
      }
    });
  }
}

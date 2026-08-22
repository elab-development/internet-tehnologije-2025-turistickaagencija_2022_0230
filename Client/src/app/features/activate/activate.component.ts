import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApiService } from '../../core/services/component-api/auth-api.service';

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.scss']
})
export class ActivateComponent {
  message = 'Activating account...';
  error = '';

  constructor(private route: ActivatedRoute, private authApi: AuthApiService, private router: Router) {
    const uid = this.route.snapshot.paramMap.get('uid') || '';
    const token = this.route.snapshot.paramMap.get('token') || '';

    this.authApi.activateAccount({ uid, token }).subscribe({
      next: (res: any) => {
        this.message = 'Your account has been activated. Redirecting to home...';
        try {
          const user = res.data.user;
          const tokenStr = res.data.token;
          localStorage.setItem('token', tokenStr);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (e) {
          // ignore
        }
        setTimeout(() => {
          // reload so AuthService picks up user
          window.location.href = '/home';
        }, 1000);
      },
      error: (err) => {
        this.error = err.error?.detail || err.error?.message || 'Invalid or expired activation token.';
        this.message = '';
      }
    });
  }
}

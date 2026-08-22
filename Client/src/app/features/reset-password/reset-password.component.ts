import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApiService } from '../../core/services/component-api/auth-api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  uid = '';
  token = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  success = '';
  error = '';

  constructor(private route: ActivatedRoute, private authApi: AuthApiService, private router: Router) {
    this.uid = this.route.snapshot.paramMap.get('uid') || '';
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  submit() {
    this.error = '';
    if (!this.newPassword || this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match or are empty.';
      return;
    }

    this.isLoading = true;
    this.authApi.confirmPasswordReset({ uid: this.uid, token: this.token, new_password: this.newPassword }).subscribe({
      next: () => {
        this.isLoading = false;
        this.success = 'Password updated successfully. Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.detail || err.error?.message || 'Invalid or expired token.';
      }
    });
  }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthApiService } from '../../core/services/component-api/auth-api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email = '';
  submitted = false;
  isLoading = false;

  constructor(private authApi: AuthApiService) {}

  submit() {
    if (!this.email) return;
    this.isLoading = true;
    this.authApi.requestPasswordReset({ email: this.email }).subscribe({
      next: () => {
        this.isLoading = false;
        this.submitted = true;
      },
      error: () => {
        // Always show generic message to avoid leaking account existence
        this.isLoading = false;
        this.submitted = true;
      }
    });
  }
}

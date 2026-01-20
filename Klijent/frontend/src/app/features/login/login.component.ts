import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  isOpen = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggle() {
    this.isOpen = !this.isOpen;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      if (this.isOpen) {
          passwordInput.type = 'text';
      } else {
          passwordInput.type = 'password';
      }
  }
  
  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Username and password are required';
      return;
    }
    this.errorMessage = null;

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        console.log('LOGIN RESPONSE IN COMPONENT:', this.authService.user$);
        this.router.navigate(['/home']);
      },
      error: err => {
        this.errorMessage = err.error?.message ?? 'Login failed';
      }
    });
  
  }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  isOpen = false;
  failureMessage:string | null = '';
  usernameFieldRequiredErrors: string = '';
  passwordFieldRequiredErrors: string = '';

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
    if (!this.username) this.usernameFieldRequiredErrors = 'Username field is required'; else this.usernameFieldRequiredErrors = '';
    if(!this.password) this.passwordFieldRequiredErrors = 'Password field is required'; else this.passwordFieldRequiredErrors = '';
    if(!this.username || !this.password) return;

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        console.log('LOGIN RESPONSE IN COMPONENT:', this.authService.user$);
        this.router.navigate(['/home']);
      },
      error: err => {
        this.failureMessage =err.error?.message ?? 'Login failed';
        this.username='';
        this.password='';
      }
    });
  
  }
}

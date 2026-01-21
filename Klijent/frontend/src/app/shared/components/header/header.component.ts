import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user.model';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  
  user$: Observable<User | null>;
  userMenuOpen = false;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.user$;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout(): void {
    this.userMenuOpen = false;
    this.authService.logout();
  }
}

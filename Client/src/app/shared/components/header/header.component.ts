import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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

  constructor(private authService: AuthService, private router: Router) {
    this.user$ = this.authService.user$;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout(): void {
    this.userMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/']).then(() => window.location.reload());
  }

  isAdmin(user: User | null): boolean {
    return user?.role === 'ADMIN';
  }

  isAgent(user: User | null): boolean {
    return user?.role === 'AGENT';
  }
}

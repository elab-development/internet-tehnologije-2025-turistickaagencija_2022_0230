import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const requiredRole = route.data['requiredRole'];

    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/login']);
    }

    if (requiredRole === 'ADMIN' && !this.authService.isAdmin()) {
      return this.router.createUrlTree(['/home']);
    }

    if (requiredRole === 'AGENT' && !this.authService.isAgent() && !this.authService.isAdmin()) {
      return this.router.createUrlTree(['/home']);
    }

    return true;
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LoginApiService } from '../component-api/login-api.service';
import { User } from '../../models/user.model';


@Injectable({ providedIn: 'root' })
export class AuthService {

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private loginApi: LoginApiService) {
    this.restoreUser();
  }

login(username: string, password: string) {
  return this.loginApi.login({ username, password }).pipe(
    tap(response => {
      if (!response.success) {
        console.error('Login failed:', response.message);
        throw new Error(response.message || 'Invalid credentials');
      }

      const { user, token } = response.data;

      console.log('LOGGED USER:', user);
      this.userSubject.next(user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    })
  );
  }

  logout() {
    this.userSubject.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  private restoreUser() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user && token && !this.isTokenExpired(token)) {
      try {
        this.userSubject.next(JSON.parse(user));
      } catch {
        this.logout();
      }
    } else {
      this.logout();
    }
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token || this.isTokenExpired(token)) {
      if (this.userSubject.value !== null) {
        this.logout();
      }
      return false;
    }

    return this.userSubject.value !== null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  isAdmin(): boolean {
    return this.userSubject.value?.role === 'ADMIN';
  }

  isAgent(): boolean {
    return this.userSubject.value?.role === 'AGENT';
  }

}

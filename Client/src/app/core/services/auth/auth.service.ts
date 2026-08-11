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
    if (user) {
      const parsedUser = JSON.parse(user);
      this.userSubject.next(parsedUser);
    }
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  isAdmin(): boolean {
    return this.userSubject.value?.role === 'ADMIN';
  }

}

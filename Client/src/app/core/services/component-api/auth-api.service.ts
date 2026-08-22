import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  constructor(private api: ApiService) {}

  // Djoser endpoints
  requestPasswordReset(email: { email: string }): Observable<any> {
    return this.api.post<any>('api/auth/users/reset_password/', email);
  }

  confirmPasswordReset(payload: { uid: string; token: string; new_password: string }): Observable<any> {
    return this.api.post<any>('api/auth/users/reset_password_confirm/', payload);
  }

  activateAccount(payload: { uid: string; token: string }): Observable<any> {
    return this.api.post<any>('api/auth/users/activation/', payload);
  }

}

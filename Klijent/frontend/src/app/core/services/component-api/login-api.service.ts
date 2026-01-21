import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response.model';
import { LoginRequest } from '../../models/auth/login-request.model';
import { LoginResponse } from '../../models/auth/login-response.model';


@Injectable({ providedIn: 'root' })
export class LoginApiService {

  private readonly endpoint = 'auth/login';

  constructor(private api: ApiService) {}

  login(payload: LoginRequest) {
    return this.api.post<ApiResponse<LoginResponse>>(
      this.endpoint,
      payload
    );
  }
}
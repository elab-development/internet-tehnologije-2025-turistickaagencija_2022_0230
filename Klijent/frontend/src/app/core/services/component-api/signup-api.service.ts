import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class SignupApiService {

  constructor(private apiService: ApiService) {}

    signup(payload: any): Observable<any> { 
        return this.apiService.post<any>('api/auth/signup/', payload);
    }
}
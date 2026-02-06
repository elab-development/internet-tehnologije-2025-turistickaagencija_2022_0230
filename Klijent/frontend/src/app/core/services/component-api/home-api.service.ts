import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Destination } from '../../models/destination.model';
import { Hotel } from '../../models/hotel.model';
import { ApiService } from '../api.service';
import { Arrangement } from '../../models/arrangement.model';
import { ApiResponse } from '../../models/api-response.model';
import { map } from 'rxjs/operators';
import { TopDestResponse } from '../api-message/top_dest-response.mode';



@Injectable({
  providedIn: 'root'
})
export class HomeApiService {

  constructor(private apiService: ApiService) {}


  getTopDestinations(): Observable<TopDestResponse[]> {
    return this.apiService.get<ApiResponse<TopDestResponse[]>>('api/destinations/top/').pipe(map(res => res.data));
  }


getTopRatedHotels(): Observable<Arrangement[]> {
  return this.apiService
    .get<ApiResponse<Arrangement[]>>('api/arrangements/top/')
    .pipe(map(res => res.data));
  }
} 




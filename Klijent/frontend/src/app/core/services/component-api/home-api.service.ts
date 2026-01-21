import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Destination } from '../../models/destination.model';
import { Hotel } from '../../models/hotel.model';
import { ApiService } from '../api.service';



@Injectable({
  providedIn: 'root'
})
export class HomeApiService {

  constructor(private apiService: ApiService) {}


  getTopDestinations(): Observable<Destination[]> {
    return this.apiService.get<Destination[]>('destinations/top');
  }


  getTopRatedHotels(): Observable<Hotel[]> {
    return this.apiService.get<Hotel[]>('hotels/top-rated');
  }
}
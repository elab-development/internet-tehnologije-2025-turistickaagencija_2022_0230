import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response.model';
import { SearchRequest } from '../api-message/search-request.model';
import { Arrangement } from '../../models/arrangement.model';
import { Destination } from '../../models/destination.model';



@Injectable({ providedIn: 'root' })
export class SearchApiService {

  private readonly endpointSearch = 'api/arrangements/filter/';
  private readonly endpointDestinations = 'api/destinations/';
  constructor(private api: ApiService) {}

  search(payload: SearchRequest) {
    return this.api.post<ApiResponse<Arrangement[]>>(
      this.endpointSearch,
      payload
    );
  }

  getAllLocations() {
    return this.api.get<ApiResponse<Destination[]>>(this.endpointDestinations);
  }
}
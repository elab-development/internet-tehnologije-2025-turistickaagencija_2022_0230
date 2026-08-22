import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response.model';
import { Arrangement } from '../../models/arrangement.model';

@Injectable({ providedIn: 'root' })
export class ArrangementApiService {
  constructor(private api: ApiService) {}

  getArrangement(id: number) {
    return this.api.get<ApiResponse<Arrangement>>(`api/arrangements/${id}/`);
  }
}

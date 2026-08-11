import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response.model';
import { Booking } from '../../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly endpoint = 'api/bookings/';

  constructor(private api: ApiService) {}

  getBookings() {
    return this.api.get<ApiResponse<Booking[]>>(this.endpoint);
  }

  createBooking(payload: { aranzman_id: number; guests: number }) {
    return this.api.post<ApiResponse<Booking>>(this.endpoint, payload);
  }

  updateBooking(id: number, payload: any) {
    return this.api.put<ApiResponse<Booking>>(`${this.endpoint}${id}/`, payload);
  }
}

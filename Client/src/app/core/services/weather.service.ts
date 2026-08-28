import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface GeocodingResponse {
  results?: Array<{
    latitude: number;
    longitude: number;
  }>;
}

interface ClimateResponse {
  daily?: {
    temperature_2m_mean?: Array<number | null>;
  };
}

export interface WeatherSummary {
  averageTemperature: number;
  weatherIcon: string;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';
  private readonly climateUrl = 'https://climate-api.open-meteo.com/v1/climate';

  constructor(private http: HttpClient) {}

  getAverageForPeriod(
    destination: string,
    startDate: string,
    endDate: string
  ): Observable<WeatherSummary> {
    return this.http.get<GeocodingResponse>(this.geocodingUrl, {
      params: {
        name: destination,
        count: 1,
        language: 'en',
        format: 'json'
      }
    }).pipe(
      switchMap(location => {
        const coordinates = location.results?.[0];
        if (!coordinates) {
          throw new Error('Destination coordinates not found');
        }

        return this.http.get<ClimateResponse>(this.climateUrl, {
          params: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            daily: 'temperature_2m_mean',
            models: 'EC_Earth3P_HR',
            timezone: 'auto',
            start_date: startDate.slice(0, 10),
            end_date: endDate.slice(0, 10)
          }
        });
      }),
      map(forecast => this.toSummary(forecast))
    );
  }

  private toSummary(forecast: ClimateResponse): WeatherSummary {
    const temperatures = (forecast.daily?.temperature_2m_mean ?? [])
      .filter((temperature): temperature is number => temperature !== null);

    if (!temperatures.length) {
      throw new Error('Weather data not available');
    }

    const averageTemperature = temperatures.reduce((sum, temperature) => sum + temperature, 0) / temperatures.length;
    return {
      averageTemperature: Math.round(averageTemperature),
      weatherIcon: '⛅'
    };
  }

}

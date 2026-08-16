import { Component } from '@angular/core';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component'; 
import { Destination } from '../../core/models/destination.model';
import { Hotel } from '../../core/models/hotel.model';
import { HomeApiService } from '../../core/services/component-api/home-api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Arrangement } from '../../core/models/arrangement.model';
import { environment } from '../../../environments/environment';
import { TopDestResponse } from '../../core/services/api-message/top_dest-response.mode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  
  imports: [
    SearchBarComponent,
    FormsModule,
    CommonModule
]
})

export class HomeComponent {
  apiUrl = environment.apiUrl;
  topDestinations: TopDestResponse[] = [];
  topArrangements: Arrangement[] = [];

  readonly fallbackImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop';

  constructor(private homeApi: HomeApiService, private router: Router) {}

  ngOnInit(): void {
    this.homeApi.getTopDestinations().subscribe(destinations => {
      this.topDestinations = destinations;
      console.log(this.topDestinations);
    });

    this.homeApi.getTopRatedHotels().subscribe(response => {
      this.topArrangements = response;
      console.log(this.topArrangements);
    });
  }

  buildImageUrl(path: string | null | undefined): string {
    if (!path) {
      return this.fallbackImage;
    }

    return path.startsWith('http') ? path : `${this.apiUrl}${path}`;
  }

  bookNow(arrangement: Arrangement): void {
    this.router.navigate(['/booking', arrangement.id]);
  }
}

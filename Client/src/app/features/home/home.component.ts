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

  constructor(private homeApi: HomeApiService) {}

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
}

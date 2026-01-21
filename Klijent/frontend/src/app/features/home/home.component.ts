import { Component } from '@angular/core';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component'; 
import { Destination } from '../../core/models/destination.model';
import { Hotel } from '../../core/models/hotel.model';
import { HomeApiService } from '../../core/services/component-api/home-api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


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
  topDestinations: Destination[] = [];
  topHotels: Hotel[] = [];

  constructor(private homeApi: HomeApiService) {}

  ngOnInit(): void {
    this.homeApi.getTopDestinations().subscribe(destinations => {
      this.topDestinations = destinations;
      console.log(this.topDestinations);
    });

    this.homeApi.getTopRatedHotels().subscribe(hotels => {
      this.topHotels = hotels;
    });
  }
}

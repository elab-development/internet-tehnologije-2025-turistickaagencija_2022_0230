import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { FormsModule } from '@angular/forms';

interface Offer {
  id: number;
  title: string;
  country: string;
  image: string;
  description: string;
  rating: number;
  tags: string[];
  duration: string;
  price: number;
}

@Component({
  selector: 'app-arrangement-offer',
  imports: [
    SearchBarComponent,
    FormsModule,
    CommonModule
],
  templateUrl: './arrangement-offer.component.html',
  styleUrl: './arrangement-offer.component.scss'
})
export class ArrangementOfferComponent {
  offers: Offer[] = [

  {
    "id": 1,
    "title": "Summer Vacation in Spain",
    "country": "Spain",
    "image": "https://picsum.photos/300/200?random=31",
    "description": "Enjoy beautiful beaches and authentic Spanish food.",
    "rating": 4.8,
    "tags": ["Beach", "Vacation", "Gastronomy"],
    "duration": "7 days",
    "price": 899
  },
  {
    "id": 2,
    "title": "Winter Alps",
    "country": "Switzerland",
    "image": "https://picsum.photos/300/200?random=32",
    "description": "A skiing paradise with world-class ski slopes.",
    "rating": 4.9,
    "tags": ["Ski", "Mountain", "Luxury"],
    "duration": "5 days",
    "price": 1299
  },
  {
    "id": 3,
    "title": "Cultural Tour of Italy",
    "country": "Italy",
    "image": "https://picsum.photos/300/200?random=33",
    "description": "Discover the history, art, and nature of Italy.",
    "rating": 4.7,
    "tags": ["Culture", "History", "Architecture"],
    "duration": "10 days",
    "price": 1099
  },
  {
    "id": 4,
    "title": "Adventure in Costa Rica",
    "country": "Costa Rica",
    "image": "https://picsum.photos/300/200?random=34",
    "description": "Experience rainforests, volcanoes, and exotic wildlife.",
    "rating": 4.6,
    "tags": ["Adventure", "Nature", "Wildlife"],
    "duration": "8 days",
    "price": 999
  },
  {
    "id": 5,
    "title": "City Break in New York",
    "country": "USA",
    "image": "https://picsum.photos/300/200?random=35",
    "description": "Explore the city that never sleeps with its iconic landmarks.",
    "rating": 4.5,
    "tags": ["City", "Shopping", "Entertainment"],
    "duration": "4 days",
    "price": 799
  }
  ];

  currentPage = 1;
  itemsPerPage = 3;

  get totalPages(): number {
    return Math.ceil(this.offers.length / this.itemsPerPage);
  }

  get paginatedOffers(): Offer[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.offers.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  showDetails(offer: Offer): void {
    console.log('Prikazujem detalje za:', offer);
    // TODO: Navigacija na stranicu sa detaljima
  }
}

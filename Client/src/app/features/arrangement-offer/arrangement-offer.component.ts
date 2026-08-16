import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchApiService } from '../../core/services/component-api/search-api.service';
import { SearchRequest } from '../../core/services/api-message/search-request.model';
import { Arrangement } from '../../core/models/arrangement.model';
import { environment } from '../../../environments/environment';

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
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: SearchApiService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;  
   }
  arragements:Arrangement[] = [];
  environment = environment.apiUrl;
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const payload: SearchRequest = {
        destination_id: params['destination_id'] ? Number(params['destination_id']) : null,
        start_date: params['start_date'] || null,
        end_date: params['end_date'] || null,
        capacity: params['capacity'] ? Number(params['capacity']) : null
      };
      this.executeSearch(payload);
    });

  }
  executeSearch(payload: SearchRequest): void {
    this.apiService.search(payload).subscribe(response => {
      if (response.success) {
        console.log('Search results:', response.data);
        this.arragements = response.data;
        console.log('Arrangements set in component:', this.arragements);
      } else {
        console.error('Search failed:', response.message);
      }
    });
  }


  currentPage = 1;
  itemsPerPage = 3;

  get totalPages(): number {
    return Math.ceil(this.arragements.length / this.itemsPerPage);
  }

  get paginatedOffers(): Arrangement[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.arragements.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getArrangementImage(arrangement: Arrangement): string {
    const imagePath = arrangement.hotel?.image || arrangement.destination?.image || '';
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop';
    }

    return imagePath.startsWith('http') ? imagePath : `${environment.apiUrl}${imagePath}`;
  }

  showDetails(ar: Arrangement): void {
    this.router.navigate(['/booking', ar.id]);
  }
}

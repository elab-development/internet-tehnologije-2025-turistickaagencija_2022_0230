import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchApiService } from '../../core/services/component-api/search-api.service';
import { SearchRequest } from '../../core/services/api-message/search-request.model';
import { __param } from 'tslib';
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
    private apiService:SearchApiService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;  
   }
  arragements:Arrangement[] = [];
  environment = environment.apiUrl;
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const payload: SearchRequest = {
        destinacija_id: params['destinacija_id'] ? Number(params['destinacija_id']) : null,
        datum_pocetka: params['datum_pocetka'] || null,
        datum_zavrsetka: params['datum_zavrsetka'] || null,
        broj_mesta: params['broj_mesta'] ? Number(params['broj_mesta']) : null
      }
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

  showDetails(ar:Arrangement): void {
    console.log('Prikazujem detalje za:', ar);
    // TODO: Navigacija na stranicu sa detaljima
  }
}

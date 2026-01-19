import { Component } from '@angular/core';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component'; 


interface Guest {
  type: 'Adults' | 'Children';
  count: number;
}
interface Location {
  country: string;
  cities: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  
  imports: [
    SearchBarComponent
]
})

export class HomeComponent {
  title = 'Home page';
  ngOnInit() {}
}

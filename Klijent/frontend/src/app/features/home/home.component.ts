import { Component } from '@angular/core';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component'; 



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
  ngOnInit() {}
}

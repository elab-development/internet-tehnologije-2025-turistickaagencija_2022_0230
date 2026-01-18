import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  isOpen = false;

  toggle() {
    this.isOpen = !this.isOpen;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      if (this.isOpen) {
          passwordInput.type = 'text';
      } else {
          passwordInput.type = 'password';
      }
  }
  
  onSubmit() {
    console.log('Username:', this.username);
    console.log('Password:', this.password);
  }
}

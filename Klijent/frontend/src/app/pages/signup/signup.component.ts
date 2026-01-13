import { Component } from '@angular/core';

@Component({
  selector: 'app-signup',
  imports: [],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
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

}

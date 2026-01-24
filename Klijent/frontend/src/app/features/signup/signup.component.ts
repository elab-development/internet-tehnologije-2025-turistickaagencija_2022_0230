import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SignupApiService } from '../../core/services/component-api/signup-api.service';
import { SignupRequest } from '../../core/services/api-message/signup-request.model';

@Component({
  selector: 'app-signup',
  imports: [CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  isOpen = false;
  days: number[] = [];
  months: number[] = [];
  years: number[] = [];
  isLoading = false;
  successMessage = '';


  fieldErrors: {
    profileName: string;
    email: string;
    password: string;
    gender: string;
    dateOfBirth: string;
  } = {
    profileName: '',
    email: '',
    password: '',
    gender: '',
    dateOfBirth: ''
  };

  constructor(
    private signupApiService: SignupApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.populateDateLists();
  }

  populateDateLists(): void {

    for (let i = 1; i <= 31; i++) {
      this.days.push(i);
    }

    for (let i = 1; i <= 12; i++) {
      this.months.push(i);
    }

    
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 120; i--) {
      this.years.push(i);
    }
  }


  isPasswordValid(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }


  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


  isDateValid(day: string, month: string, year: string): boolean {
    if (!day || !month || !year) {
      return false;
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      return false;
    }

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (yearNum % 4 === 0 && (yearNum % 100 !== 0 || yearNum % 400 === 0)) {
      daysInMonth[1] = 29;
    }

    if (dayNum < 1 || dayNum > daysInMonth[monthNum - 1]) {
      return false;
    }

    const birthDate = new Date(yearNum, monthNum - 1, dayNum);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dayNum)) {
      return age - 1 >= 16;
    }

    return age >= 16;
  }

  getFormData(): SignupRequest | null {
    const profileName = (document.getElementById('username') as HTMLInputElement).value.trim();
    const email = (document.getElementById('email') as HTMLInputElement).value.trim();
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const gender = (document.querySelector('input[name="gender"]:checked') as HTMLInputElement)?.value;
    const day = (document.getElementById('day') as HTMLSelectElement).value;
    const month = (document.getElementById('month') as HTMLSelectElement).value;
    const year = (document.getElementById('year') as HTMLSelectElement).value;

    this.fieldErrors = {
      profileName: '',
      email: '',
      password: '',
      gender: '',
      dateOfBirth: ''
    };

    let isValid = true;

    if (!profileName) {
      this.fieldErrors.profileName = 'Profile name is required!';
      isValid = false;
    } else if (profileName.length < 3) {
      this.fieldErrors.profileName = 'Profile name must contain at least 3 characters!';
      isValid = false;
    }

    if (!email) {
      this.fieldErrors.email = 'Email is required!';
      isValid = false;
    } else if (!this.isEmailValid(email)) {
      this.fieldErrors.email = 'Please enter a valid email address!';
      isValid = false;
    }

    if (!password) {
      this.fieldErrors.password = 'Password is required!';
      isValid = false;
    } else if (!this.isPasswordValid(password)) {
      this.fieldErrors.password = 'Password must contain at least 8 characters with uppercase, lowercase, numbers and special characters (!@#$%^&*)!';
      isValid = false;
    }

    if (!gender) {
      this.fieldErrors.gender = 'Please select your gender!';
      isValid = false;
    }

    if (!day || !month || !year) {
      this.fieldErrors.dateOfBirth = 'Please select your date of birth!';
      isValid = false;
    } else if (!this.isDateValid(day, month, year)) {
      this.fieldErrors.dateOfBirth = 'You must be at least 16 years old!';
      isValid = false;
    }

    if (!isValid) {
      return null;
    }

    const dateOfBirth = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return {
      profileName,
      email,
      password,
      gender: gender.toUpperCase() as 'MALE' | 'FEMALE',
      dateOfBirth
    };
  }

  validateField(fieldName: string): void {
    const value = (document.getElementById(fieldName) as HTMLInputElement | HTMLSelectElement)?.value.trim();

    switch (fieldName) {
      case 'username':
        if (!value) {
          this.fieldErrors.profileName = 'Profile name is required!';
        } else if (value.length < 3) {
          this.fieldErrors.profileName = 'Profile name must contain at least 3 characters!';
        } else {
          this.fieldErrors.profileName = '';
        }
        break;

      case 'email':
        if (!value) {
          this.fieldErrors.email = 'Email is required!';
        } else if (!this.isEmailValid(value)) {
          this.fieldErrors.email = 'Please enter a valid email address!';
        } else {
          this.fieldErrors.email = '';
        }
        break;

      case 'password':
        if (!value) {
          this.fieldErrors.password = 'Password is required!';
        } else if (!this.isPasswordValid(value)) {
          this.fieldErrors.password = 'Password must contain at least 8 characters with uppercase, lowercase, numbers and special characters (!@#$%^&*)!';
        } else {
          this.fieldErrors.password = '';
        }
        break;

      case 'gender':
        const genderChecked = (document.querySelector('input[name="gender"]:checked') as HTMLInputElement)?.value;
        if (!genderChecked) {
          this.fieldErrors.gender = 'Please select your gender!';
        } else {
          this.fieldErrors.gender = '';
        }
        break;

      case 'day':
      case 'month':
      case 'year':
        const day = (document.getElementById('day') as HTMLSelectElement).value;
        const month = (document.getElementById('month') as HTMLSelectElement).value;
        const year = (document.getElementById('year') as HTMLSelectElement).value;

        if (!day || !month || !year) {
          this.fieldErrors.dateOfBirth = 'Please select your date of birth!';
        } else if (!this.isDateValid(day, month, year)) {
          this.fieldErrors.dateOfBirth = 'You must be at least 16 years old!';
        } else {
          this.fieldErrors.dateOfBirth = '';
        }
        break;
    }
  }

 
  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const formData = this.getFormData();
    
    if (!formData) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';

    this.signupApiService.signup(formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'Registration successful!';
        

      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error during registration:', error);
        

        let errorMsg = 'Registration failed. Please try again.';
        if (error.error && error.error.message) {
          errorMsg = error.error.message;
        } else if (error.error && error.error.detail) {
          errorMsg = error.error.detail;
        } else if (error.status === 400) {
          errorMsg = 'Invalid data. Please check that all information is correct.';
        } else if (error.status === 409) {
          errorMsg = 'This email is already registered!';
        } else if (error.status === 500) {
          errorMsg = 'Server error. Please try again later.';
        }


        if (error.status === 409) {
          this.fieldErrors.email = errorMsg;
        } else {

          alert(errorMsg);
        }
      }
    });
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (this.isOpen) {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  }
}

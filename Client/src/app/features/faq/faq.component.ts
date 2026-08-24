import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  openIndex: number | null = 0;

  readonly questions: FaqItem[] = [
    {
      question: 'How do I make a reservation?',
      answer: 'Choose an arrangement from the offer, select the number of adults and children, then press Reserve. You will see the remaining capacity before confirming.'
    },
    {
      question: 'Can I cancel my reservation?',
      answer: 'Yes. Open My Bookings while signed in, choose the reservation, and select Cancel. Cancelled places become available for other travelers immediately.'
    },
    {
      question: 'What is included in the arrangement price?',
      answer: 'Each arrangement lists its included services, hotel, destination, transport, dates, and pricing. Check the arrangement details before booking for the complete overview.'
    },
    {
      question: 'How do I pay for my reservation?',
      answer: 'Reservations are initially pending. You can open My Bookings and use the Pay option to confirm payment and complete the booking.'
    },
    {
      question: 'How can I contact the agency?',
      answer: 'Our team is available during working hours, from 9:00 to 17:00. Use the contact details in the footer and we will get back to you as soon as possible.'
    }
  ];

  toggle(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }
}

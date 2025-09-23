import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  features: string[];
  price?: string;
  duration?: string;
  category: string;
}

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.scss'
})
export class ServiceCardComponent {
  @Input() service!: Service;
  @Input() showFeatures: boolean = true;
  @Input() showPrice: boolean = true;
  @Input() showDuration: boolean = true;

  constructor(private router: Router) {}

  navigateToContact(serviceType: string): void {
    this.router.navigate(['/contact'], { 
      queryParams: { service: serviceType } 
    });
  }

  getServiceImage(): string {
    return this.service.image || 'assets/images/services/default-service.jpg';
  }
}

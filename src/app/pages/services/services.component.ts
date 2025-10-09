import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService } from '../../shared/services/translation.service';
import { ServicesService, Service } from '../../shared/services/services.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentLang = 'ar';
  isRtl = true;
  
  // Firebase services
  services: Service[] = [];
  loading = false;

  constructor(
    private router: Router,
    public translationService: TranslationService,
    private servicesService: ServicesService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadServices(): void {
    this.loading = true;
    this.servicesService.getActiveServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (services) => {
          this.services = services;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.loading = false;
        }
      });
  }

  // Get services by category
  getServicesByCategory(category: string): Service[] {
    return this.services.filter(service => service.category === category);
  }

  // Legacy data for backward compatibility (can be removed later)
  nanoCeramicProducts = [
    {
      name: 'Diamond Hybrid+',
      warranty: '7 years',
      hardness: '9H+',
      elements: 'Diamond',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ceramic1.jpeg'
    },
    {
      name: 'Diamond Hybrid',
      warranty: '5 years',
      hardness: '9H',
      elements: 'Diamond',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ceramic2.jpeg'
    },
    {
      name: 'Ultra Nano Ceramic',
      warranty: '7 years',
      hardness: '9H',
      elements: 'Silicone/Polysilazine',
      country: 'Germany',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ceramic3.jpeg'
    },
    {
      name: 'Diamond N1',
      warranty: '5 years',
      hardness: '8H',
      elements: 'Diamond',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ceramic4.jpeg'
    },
    {
      name: 'Nanolex',
      warranty: '7 years',
      hardness: '8H',
      elements: 'Silicone/Polysilazine',
      country: 'Germany',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ceramic5.jpeg'
    },
    {
      name: 'Nano System X',
      warranty: '5 years',
      hardness: '8H',
      elements: 'Diamond',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ceramic6.jpeg'
    }
  ];

  // Nano Graphene Products
  nanoGrapheneProducts = [
    {
      name: 'Graphene Hybrid Plus',
      warranty: '12 years',
      hardness: '10H+',
      elements: '98% carbon fiber',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/graphene.jpeg'
    },
    {
      name: 'Graphene Hybrid',
      warranty: '10 years',
      hardness: '9H+',
      elements: '85% carbon fiber',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/graphene2.jpeg'
    },
    {
      name: 'Graphene Pro',
      warranty: '10 years',
      hardness: '9H',
      elements: '70% carbon fiber',
      country: 'Germany',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/graphene4.jpeg'
    },
    {
      name: 'Graphene Pro (Second variant)',
      warranty: '10 years',
      hardness: '8H+',
      elements: '65% carbon fiber',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/graphene5.jpeg'
    },
    {
      name: 'Adms Graphene',
      warranty: '10 years',
      hardness: '8H',
      elements: '65% carbon fiber',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/graphene6.jpeg'
    },
    {
      name: 'Graphene Nanolex',
      warranty: '12 years',
      hardness: '8H',
      elements: '65% carbon fiber',
      country: 'Germany',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/graphene7.jpeg'
    }
  ];

  // Paint Protection Film Products
  ppfProducts = [
    {
      name: 'Max Pro',
      warranty: '12 years',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ppf.jpeg'
    },
    {
      name: 'Dyno Stick',
      warranty: '10 years',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ppf1.jpeg'
    },
    {
      name: 'Expel Ultimate',
      warranty: '10 years',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ppf3.jpeg'
    },
    {
      name: '3M Scotchgard',
      warranty: '10 years',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ppf4.jpeg'
    },
    {
      name: 'Elegance Guard',
      warranty: '7 years',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ppf5.jpeg'
    },
    {
      name: 'Hexes',
      warranty: '10 years',
      country: 'France',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ppf6.jpeg'
    },
    {
      name: 'Premium 8',
      warranty: '10 years',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ppf7.jpeg'
    },
    {
      name: 'PRO VISION',
      warranty: '10 years',
      country: 'Germany',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ppf8.jpeg'
    },
    {
      name: 'Professional Shield',
      warranty: '5 years',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/ppf2.jpeg'
    }
  ];

  // Thermal Insulation Products
  thermalInsulationProducts = [
    {
      name: 'Shield Solar Guard',
      warranty: '7 years',
      warrantyLabel: 'الضمان',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/thermal1.jpg'
    },
    {
      name: 'Shield Ultra Cool',
      warranty: '10 years',
      warrantyLabel: 'الضمان',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/thermal2.jpg'
    },
    {
      name: '3M Crystalline',
      warranty: '3 years',
      warrantyLabel: 'العمر الافتراضي',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/thermal3.jpg'
    },
    {
      name: 'UV400 Films',
      warranty: '1 year',
      warrantyLabel: 'العمر الافتراضي',
      country: 'USA',
      photo: 'https://meek-mermaid-ea40cf.netlify.app/imgs/thermal4.jpg'
    }
  ];








  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  price?: string;
  duration?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-services.component.html',
  styleUrls: ['./admin-services.component.scss'],
})
export class AdminServicesComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  searchTerm: string = '';
  selectedCategory: string = 'all';
  showAddForm: boolean = false;
  editingService: Service | null = null;

  newService: Partial<Service> = {
    title: '',
    description: '',
    icon: 'fas fa-cog',
    features: [],
    category: 'ceramic',
    isActive: true,
  };

  categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'ceramic', label: 'Ceramic Coating' },
    { value: 'protection', label: 'Protection' },
    { value: 'detailing', label: 'Detailing' },
    { value: 'interior', label: 'Interior' },
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    // Load admin-created services from localStorage
    const savedServices = localStorage.getItem('services');
    let adminServices: Service[] = [];
    if (savedServices) {
      adminServices = JSON.parse(savedServices);
    }

    // Real services from the website
    const realServices: Service[] = [
      {
        id: 'real-1',
        title: 'Diamond Hybrid Plus',
        description:
          'حماية سيراميك فائقة الجودة مع تقنية الهجين الماسي للحصول على أفضل حماية ولمعان',
        icon: '💎',
        features: [
          'تقنية الهجين الماسي',
          'حماية 9H',
          'لمعان فائق',
          'ضمان 5 سنوات',
        ],
        price: 'Starting from $499',
        duration: '6-8 hours',
        category: 'ceramic',
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 'real-2',
        title: 'Nano Pro Ceramic',
        description:
          'طلاء سيراميك نانو احترافي يوفر حماية شاملة للسيارة من جميع العوامل الخارجية',
        icon: '🛡️',
        features: [
          'تقنية النانو',
          'حماية UV',
          'مقاومة كيميائية',
          'سهولة التنظيف',
        ],
        price: 'Starting from $399',
        duration: '4-6 hours',
        category: 'ceramic',
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 'real-3',
        title: 'Diamond Glass',
        description:
          'حماية زجاج متقدمة بتقنية الماس لحماية الزجاج وتحسين الرؤية',
        icon: '🔷',
        features: [
          'حماية زجاج متقدمة',
          'رؤية واضحة',
          'مقاومة الخدوش',
          'تنظيف سهل',
        ],
        price: 'Starting from $199',
        duration: '2-3 hours',
        category: 'protection',
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 'real-4',
        title: 'Shield UltraCool',
        description:
          'حماية متطورة مع تقنية التبريد الفائق لحماية السيارة من الحرارة العالية',
        icon: '❄️',
        features: [
          'تقنية التبريد',
          'حماية حرارية',
          'توفير طاقة',
          'راحة القيادة',
        ],
        price: 'Starting from $299',
        duration: '3-4 hours',
        category: 'protection',
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
      },
    ];

    // Combine real services with admin services
    this.services = [...realServices, ...adminServices];
    this.filterServices();
  }

  private saveServices(): void {
    // Only save admin-created services, not the real services
    const adminServices = this.services.filter(
      (service) => !service.id.startsWith('real-')
    );
    localStorage.setItem('services', JSON.stringify(adminServices));
  }

  filterServices(): void {
    this.filteredServices = this.services.filter((service) => {
      const matchesSearch =
        service.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        service.description
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());
      const matchesCategory =
        this.selectedCategory === 'all' ||
        service.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  onSearchChange(): void {
    this.filterServices();
  }

  onCategoryChange(): void {
    this.filterServices();
  }

  showAddServiceForm(): void {
    this.editingService = null;
    this.newService = {
      title: '',
      description: '',
      icon: 'fas fa-cog',
      features: [],
      category: 'ceramic',
      isActive: true,
    };
    this.showAddForm = true;
  }

  editService(service: Service): void {
    // Prevent editing of real services
    if (service.id.startsWith('real-')) {
      alert(
        'Cannot edit real website services. You can only edit admin-created services.'
      );
      return;
    }

    this.editingService = service;
    this.newService = { ...service };
    this.showAddForm = true;
  }

  deleteService(service: Service): void {
    // Prevent deletion of real services
    if (service.id.startsWith('real-')) {
      alert(
        'Cannot delete real website services. You can only edit admin-created services.'
      );
      return;
    }

    if (confirm(`Are you sure you want to delete "${service.title}"?`)) {
      this.services = this.services.filter((s) => s.id !== service.id);
      this.saveServices();
      this.filterServices();
    }
  }

  toggleServiceStatus(service: Service): void {
    service.isActive = !service.isActive;
    this.saveServices();
  }

  addFeature(): void {
    if (!this.newService.features) {
      this.newService.features = [];
    }
    this.newService.features.push('');
  }

  removeFeature(index: number): void {
    if (this.newService.features) {
      this.newService.features.splice(index, 1);
    }
  }

  saveService(): void {
    if (!this.newService.title || !this.newService.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.editingService) {
      // Update existing service
      const index = this.services.findIndex(
        (s) => s.id === this.editingService!.id
      );
      if (index !== -1) {
        this.services[index] = {
          ...this.newService,
          id: this.editingService.id,
          createdAt: this.editingService.createdAt,
        } as Service;
      }
    } else {
      // Add new service
      const newService: Service = {
        ...this.newService,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      } as Service;
      this.services.push(newService);
    }

    this.saveServices();
    this.filterServices();
    this.cancelForm();
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingService = null;
    this.newService = {
      title: '',
      description: '',
      icon: 'fas fa-cog',
      features: [],
      category: 'ceramic',
      isActive: true,
    };
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

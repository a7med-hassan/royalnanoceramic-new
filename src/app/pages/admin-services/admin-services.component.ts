import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServicesService, Service } from '../../shared/services/services.service';
// Removed Firebase Storage import - using photo URLs instead

interface ServiceFormData {
  name: string;
  category: string;
  description: string;
  photoUrl: string;
  features: string[];
  price?: string;
  duration?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-services.component.html',
  styleUrls: ['./admin-services.component.scss'],
})
export class AdminServicesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  services: Service[] = [];
  filteredServices: Service[] = [];
  searchTerm: string = '';
  selectedCategory: string = 'all';
  showAddForm: boolean = false;
  editingService: Service | null = null;
  loading = false;

  newService: ServiceFormData = {
    name: '',
    category: 'nano-ceramic',
    description: '',
    photoUrl: '',
    features: [],
    price: '',
    duration: '',
    isActive: true,
  };

  categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'nano-ceramic', label: 'Nano Ceramic Products' },
    { value: 'nano-graphene', label: 'Nano Graphene Products' },
    { value: 'paint-protection-film', label: 'Paint Protection Film' },
    { value: 'thermal-insulation', label: 'Thermal Insulation' },
  ];

  constructor(
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
    this.servicesService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (services) => {
          this.services = services;
          this.filterServices();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading services:', error);
          this.loading = false;
        }
      });
  }

  filterServices(): void {
    this.filteredServices = this.services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
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
      name: '',
      category: 'nano-ceramic',
      description: '',
      photoUrl: '',
      features: [],
      price: '',
      duration: '',
      isActive: true,
    };
    this.showAddForm = true;
  }

  editService(service: Service): void {
    this.editingService = service;
    this.newService = {
      name: service.name,
      category: service.category,
      description: service.description,
      photoUrl: service.photoUrl,
      features: [...service.features],
      price: service.price || '',
      duration: service.duration || '',
      isActive: service.isActive,
    };
    this.showAddForm = true;
  }

  deleteService(service: Service): void {
    if (confirm(`Are you sure you want to delete "${service.name}"?`)) {
      this.servicesService.deleteService(service.id!)
        .then(() => {
          console.log('Service deleted successfully');
        })
        .catch((error) => {
          console.error('Error deleting service:', error);
          alert('Error deleting service. Please try again.');
        });
    }
  }

  toggleServiceStatus(service: Service): void {
    this.servicesService.toggleServiceStatus(service.id!, !service.isActive)
      .then(() => {
        console.log('Service status updated successfully');
      })
      .catch((error) => {
        console.error('Error updating service status:', error);
        alert('Error updating service status. Please try again.');
      });
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

  // Add photo URL directly
  addPhotoUrl(): void {
    if (this.newService.photoUrl.trim()) {
      // Validate URL format
      try {
        new URL(this.newService.photoUrl);
        console.log('Photo URL added:', this.newService.photoUrl);
      } catch (error) {
        alert('Please enter a valid URL');
        this.newService.photoUrl = '';
      }
    }
  }

  // Remove photo URL
  removePhotoUrl(): void {
    this.newService.photoUrl = '';
  }

  saveService(): void {
    if (!this.newService.name || !this.newService.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.editingService) {
      // Update existing service
      this.servicesService.updateService(this.editingService.id!, this.newService)
        .then(() => {
          console.log('Service updated successfully');
          this.cancelForm();
        })
        .catch((error) => {
          console.error('Error updating service:', error);
          alert('Error updating service. Please try again.');
        });
    } else {
      // Add new service
      this.servicesService.addService({
        ...this.newService,
        createdBy: 'admin' // You can get this from auth service
      })
        .then(() => {
          console.log('Service added successfully');
          this.cancelForm();
        })
        .catch((error) => {
          console.error('Error adding service:', error);
          alert('Error adding service. Please try again.');
        });
    }
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingService = null;
    this.newService = {
      name: '',
      category: 'nano-ceramic',
      description: '',
      photoUrl: '',
      features: [],
      price: '',
      duration: '',
      isActive: true,
    };
    // Reset photo URL
    this.newService.photoUrl = '';
  }

  formatDate(date: any): string {
    try {
      let dateObj: Date;
      
      if (date && typeof date === 'object' && date.toDate) {
        // Firebase Timestamp
        dateObj = date.toDate();
      } else if (typeof date === 'string') {
        // String date
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        // Date object
        dateObj = date;
      } else {
        // Fallback
        dateObj = new Date();
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }
}

import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, docData, query, where, orderBy, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Service {
  id?: string;
  name: string;
  category: string;
  description: string;
  photoUrl: string;
  features: string[];
  price?: string;
  duration?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private servicesCollection = collection(this.firestore, 'services');

  constructor(private firestore: Firestore) {}

  // Get all services
  getServices(): Observable<Service[]> {
    return collectionData(this.servicesCollection, { idField: 'id' }) as Observable<Service[]>;
  }

  // Get active services only
  getActiveServices(): Observable<Service[]> {
    const activeQuery = query(
      this.servicesCollection,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    return collectionData(activeQuery, { idField: 'id' }) as Observable<Service[]>;
  }

  // Get services by category
  getServicesByCategory(category: string): Observable<Service[]> {
    const categoryQuery = query(
      this.servicesCollection,
      where('category', '==', category),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    return collectionData(categoryQuery, { idField: 'id' }) as Observable<Service[]>;
  }

  // Get single service by ID
  getService(id: string): Observable<Service | undefined> {
    const serviceDoc = doc(this.firestore, 'services', id);
    return docData(serviceDoc, { idField: 'id' }) as Observable<Service | undefined>;
  }

  // Add new service
  addService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<any> {
    const now = new Date();
    const serviceData: Omit<Service, 'id'> = {
      ...service,
      createdAt: now,
      updatedAt: now
    };
    
    return addDoc(this.servicesCollection, serviceData);
  }

  // Update existing service
  updateService(id: string, service: Partial<Service>): Promise<void> {
    const updateData = {
      ...service,
      updatedAt: new Date()
    };
    
    const serviceDoc = doc(this.firestore, 'services', id);
    return updateDoc(serviceDoc, updateData);
  }

  // Delete service
  deleteService(id: string): Promise<void> {
    const serviceDoc = doc(this.firestore, 'services', id);
    return deleteDoc(serviceDoc);
  }

  // Toggle service active status
  toggleServiceStatus(id: string, isActive: boolean): Promise<void> {
    const serviceDoc = doc(this.firestore, 'services', id);
    return updateDoc(serviceDoc, {
      isActive,
      updatedAt: new Date()
    });
  }

  // Get service categories
  getCategories(): Observable<string[]> {
    return this.getServices().pipe(
      map(services => {
        const categories = services.map(service => service.category);
        return [...new Set(categories)].sort();
      })
    );
  }

  // Search services
  searchServices(searchTerm: string): Observable<Service[]> {
    return this.getServices().pipe(
      map(services => services.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }

  // Get services count
  getServicesCount(): Observable<number> {
    return this.getServices().pipe(
      map(services => services.length)
    );
  }

  // Get active services count
  getActiveServicesCount(): Observable<number> {
    return this.getActiveServices().pipe(
      map(services => services.length)
    );
  }
}

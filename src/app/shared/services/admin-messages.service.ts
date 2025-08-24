import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

// Data interfaces based on API response
export interface ContactMessage {
  id: string;
  fullName: string;
  phoneNumber: string;
  carType: string;
  carModel: string;
  notes: string;
  createdAt: string;
}

export interface JoinMessage {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  position: string;
  experience: string;
  createdAt: string;
}

// Form data interfaces for testing
export interface ContactFormData {
  fullName: string;
  phoneNumber: string;
  carType: string;
  carModel: string;
  notes: string;
}

export interface JoinFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  position: string;
  experience: string;
  message: string;
  cvFile?: File | null;
}

@Injectable({
  providedIn: 'root',
})
export class AdminMessagesService {
  constructor(private apiService: ApiService) {}

  /**
   * Health check endpoint to verify backend connectivity
   * @returns Observable of health status
   */
  healthCheck(): Observable<any> {
    return this.apiService.healthCheck();
  }

  /**
   * Get all contact form messages from API
   * @returns Observable of contact messages array
   */
  getContactMessages(): Observable<ContactMessage[]> {
    return this.apiService.getContactMessages();
  }

  /**
   * Get all join form messages from API
   * @returns Observable of join messages array
   */
  getJoinMessages(): Observable<JoinMessage[]> {
    return this.apiService.getJoinMessages();
  }

  /**
   * Submit contact form for testing
   * @param data Contact form data
   * @returns Observable of API response
   */
  submitContactForm(data: ContactFormData): Observable<any> {
    return this.apiService.submitContactForm(data);
  }

  /**
   * Submit join form for testing
   * @param data Join form data
   * @returns Observable of API response
   */
  submitJoinForm(data: JoinFormData): Observable<any> {
    return this.apiService.submitJoinForm(data);
  }

  /**
   * Test HttpClient connection
   * @returns Observable of test response
   */
  testConnection(): Observable<any> {
    return this.apiService.testConnection();
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    admin: {
      id: string;
      username: string;
      email?: string;
      role?: string;
    };
  };
}

export interface DashboardData {
  stats: {
    totalContacts: number;
    totalJoins: number;
    totalServices: number;
    totalGallery: number;
    totalBlog: number;
  };
  contacts: any[];
  joins: any[];
  recentActivity: any[];
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private baseUrl = 'https://royal-nano-backend.vercel.app/api/admin';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Login admin user
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = { username, password };

    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, loginData, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        map((response) => {
          if (response.success) {
            // Store token and admin data
            localStorage.setItem('adminToken', response.data.token);
            localStorage.setItem(
              'adminUser',
              JSON.stringify(response.data.admin)
            );
            localStorage.setItem('adminLoggedIn', 'true');
          }
          return response;
        }),
        catchError((error) => {
          console.error('Login error:', error);
          this.errorHandler.handleApiError(error, '/login');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get dashboard data
   */
  getDashboardData(): Observable<DashboardData> {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      return throwError(() => new Error('No admin token found'));
    }

    return this.http
      .get<DashboardResponse>(`${this.baseUrl}/dashboard`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message);
        }),
        catchError((error) => {
          console.error('Dashboard data error:', error);
          this.errorHandler.handleApiError(error, '/dashboard');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get contact messages
   */
  getContactMessages(): Observable<any[]> {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      return throwError(() => new Error('No admin token found'));
    }

    return this.http
      .get<any>(`${this.baseUrl}/messages/contact`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message);
        }),
        catchError((error) => {
          console.error('Contact messages error:', error);
          this.errorHandler.handleApiError(error, '/messages/contact');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get join messages
   */
  getJoinMessages(): Observable<any[]> {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      return throwError(() => new Error('No admin token found'));
    }

    return this.http
      .get<any>(`${this.baseUrl}/messages/join`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message);
        }),
        catchError((error) => {
          console.error('Join messages error:', error);
          this.errorHandler.handleApiError(error, '/messages/join');
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout admin
   */
  logout(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminLoggedIn');
  }

  /**
   * Check if admin is logged in
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('adminToken');
    const loggedIn = localStorage.getItem('adminLoggedIn');
    return !!(token && loggedIn === 'true');
  }

  /**
   * Get current admin user
   */
  getCurrentAdmin(): any {
    const adminUser = localStorage.getItem('adminUser');
    return adminUser ? JSON.parse(adminUser) : null;
  }

  /**
   * Get admin token
   */
  getToken(): string | null {
    return localStorage.getItem('adminToken');
  }
}

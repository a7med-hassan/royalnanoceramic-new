/**
 * User Permission Service
 * 
 * This service handles fetching and managing user permissions
 * from the Royal Nano Backend API
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Auth } from '@angular/fire/auth';
import { Observable, from, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';

export interface UserPermissions {
  royal_nano?: {
    access: boolean;
    overview: boolean;
    messages: boolean;
    services: boolean;
    gallery: boolean;
    blog: boolean;
    reviews: boolean;
    manage_users: boolean;
    analytics: boolean;
    landing_pages: boolean;
  };
  royal_shield?: {
    access: boolean;
    serials: boolean;
    requests: boolean;
    activated_warrantys: boolean;
  };
  [key: string]: any;
}

export interface PermissionsResponse {
  success: boolean;
  permissions: UserPermissions;
  role: 'admin' | 'user';
  userId: string;
  userName: string;
  userEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserPermissionService {
  private readonly API_URL = 'https://royal-nano-backend.vercel.app/api/user/permissions';
  
  // Cache for permissions to avoid repeated API calls
  private permissionsCache$ = new BehaviorSubject<PermissionsResponse | null>(null);
  public permissions$ = this.permissionsCache$.asObservable();

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {
    console.log('✅ UserPermissionService initialized');
  }

  /**
   * Get user permissions from API
   * Returns cached permissions if available
   */
  async getPermissions(forceRefresh: boolean = false): Promise<PermissionsResponse> {
    // Return cached permissions if available and not forcing refresh
    const cached = this.permissionsCache$.value;
    if (cached && !forceRefresh) {
      console.log('📦 Returning cached permissions');
      return cached;
    }

    console.log('🔄 Fetching permissions from API...');

    try {
      // Get Firebase ID token
      const token = await this.auth.currentUser?.getIdToken(true);
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('🔑 Firebase token obtained');

      // Make API request
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const response = await this.http.get<PermissionsResponse>(
        this.API_URL,
        { headers }
      ).toPromise();

      if (!response) {
        throw new Error('No response from API');
      }

      console.log('✅ Permissions fetched successfully:', response);

      // Cache the permissions
      this.permissionsCache$.next(response);

      return response;

    } catch (error) {
      console.error('❌ Error fetching permissions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get permissions as Observable (RxJS)
   */
  getPermissionsObservable(forceRefresh: boolean = false): Observable<PermissionsResponse> {
    return from(this.getPermissions(forceRefresh));
  }

  /**
   * Get permissions with RxJS operators
   */
  fetchPermissions(forceRefresh: boolean = false): Observable<PermissionsResponse> {
    // Return cached if available and not forcing refresh
    const cached = this.permissionsCache$.value;
    if (cached && !forceRefresh) {
      console.log('📦 Returning cached permissions (Observable)');
      return from([cached]);
    }

    console.log('🔄 Fetching permissions from API (Observable)...');

    return from(this.auth.currentUser?.getIdToken(true) || Promise.reject('No user')).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        return this.http.get<PermissionsResponse>(this.API_URL, { headers });
      }),
      tap(response => {
        console.log('✅ Permissions fetched successfully:', response);
        this.permissionsCache$.next(response);
      }),
      catchError(error => {
        console.error('❌ Error fetching permissions:', error);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(
    site: 'royal_nano' | 'royal_shield',
    permission: string
  ): boolean {
    const cached = this.permissionsCache$.value;
    if (!cached) {
      console.warn('⚠️ No permissions cached. Call getPermissions() first.');
      return false;
    }

    const sitePermissions = cached.permissions[site];
    if (!sitePermissions) {
      return false;
    }

    return (sitePermissions as any)[permission] === true;
  }

  /**
   * Check if user has site access
   */
  hasSiteAccess(site: 'royal_nano' | 'royal_shield'): boolean {
    return this.hasPermission(site, 'access');
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const cached = this.permissionsCache$.value;
    return cached?.role === 'admin';
  }

  /**
   * Get all granted permissions for a site
   */
  getGrantedPermissions(site: 'royal_nano' | 'royal_shield'): string[] {
    const cached = this.permissionsCache$.value;
    if (!cached) {
      return [];
    }

    const sitePermissions = cached.permissions[site];
    if (!sitePermissions) {
      return [];
    }

    return Object.entries(sitePermissions)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => key);
  }

  /**
   * Get permission summary
   */
  getPermissionSummary(): {
    royal_nano: string[];
    royal_shield: string[];
    total: number;
  } {
    const cached = this.permissionsCache$.value;
    if (!cached) {
      return { royal_nano: [], royal_shield: [], total: 0 };
    }

    const nanoPerms = this.getGrantedPermissions('royal_nano');
    const shieldPerms = this.getGrantedPermissions('royal_shield');

    return {
      royal_nano: nanoPerms,
      royal_shield: shieldPerms,
      total: nanoPerms.length + shieldPerms.length
    };
  }

  /**
   * Check if user has any permissions
   */
  hasAnyPermissions(): boolean {
    const summary = this.getPermissionSummary();
    return summary.total > 0;
  }

  /**
   * Get cached permissions
   */
  getCachedPermissions(): PermissionsResponse | null {
    return this.permissionsCache$.value;
  }

  /**
   * Clear permissions cache
   */
  clearCache(): void {
    console.log('🗑️ Clearing permissions cache');
    this.permissionsCache$.next(null);
  }

  /**
   * Refresh permissions (force fetch from API)
   */
  async refreshPermissions(): Promise<PermissionsResponse> {
    console.log('🔄 Refreshing permissions...');
    return this.getPermissions(true);
  }

  /**
   * Get user info from cached permissions
   */
  getUserInfo(): {
    userId: string;
    userName: string;
    userEmail: string;
    role: 'admin' | 'user';
  } | null {
    const cached = this.permissionsCache$.value;
    if (!cached) {
      return null;
    }

    return {
      userId: cached.userId,
      userName: cached.userName,
      userEmail: cached.userEmail,
      role: cached.role
    };
  }

  /**
   * Check multiple permissions at once
   */
  hasAllPermissions(
    site: 'royal_nano' | 'royal_shield',
    permissions: string[]
  ): boolean {
    return permissions.every(perm => this.hasPermission(site, perm));
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyOfPermissions(
    site: 'royal_nano' | 'royal_shield',
    permissions: string[]
  ): boolean {
    return permissions.some(perm => this.hasPermission(site, perm));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Error {
    let errorMessage = 'An error occurred while fetching permissions';

    if (error instanceof HttpErrorResponse) {
      // Server error
      if (error.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied. Insufficient permissions.';
      } else if (error.status === 404) {
        errorMessage = 'User not found in database.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return new Error(errorMessage);
  }

  /**
   * Initialize permissions on app startup
   * Call this in your app initialization
   */
  async initializePermissions(): Promise<void> {
    try {
      console.log('🚀 Initializing permissions...');
      await this.getPermissions(true);
      console.log('✅ Permissions initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize permissions:', error);
      // Don't throw - allow app to continue
    }
  }
}



import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService, UserPermissions } from './auth.service';

export interface PermissionsApiResponse {
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
export class PermissionsApiService {
  private apiUrl = '/api/user/permissions';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get user permissions from API
   * Uses the current user's Firebase token for authentication
   */
  getUserPermissions(): Observable<PermissionsApiResponse> {
    return new Observable(observer => {
      this.authService.getFirebaseToken().then(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        this.http.get<PermissionsApiResponse>(this.apiUrl, { headers })
          .pipe(
            map(response => {
              console.log('✅ Permissions fetched from API:', response);
              return response;
            }),
            catchError(error => {
              console.error('❌ Error fetching permissions:', error);
              return throwError(() => error);
            })
          )
          .subscribe({
            next: (data) => observer.next(data),
            error: (err) => observer.error(err),
            complete: () => observer.complete()
          });
      }).catch(error => {
        console.error('❌ Error getting Firebase token:', error);
        observer.error(error);
      });
    });
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(
    permissions: UserPermissions, 
    site: 'royal_nano' | 'royal_shield', 
    permission: string
  ): boolean {
    const sitePermissions = permissions[site] as any;
    return sitePermissions?.[permission] === true;
  }

  /**
   * Check if user has site access
   */
  hasSiteAccess(
    permissions: UserPermissions, 
    site: 'royal_nano' | 'royal_shield'
  ): boolean {
    return permissions[site]?.access === true;
  }

  /**
   * Get all granted permissions for a site
   */
  getGrantedPermissions(
    permissions: UserPermissions, 
    site: 'royal_nano' | 'royal_shield'
  ): string[] {
    const sitePermissions = permissions[site];
    if (!sitePermissions) return [];

    return Object.entries(sitePermissions)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => key);
  }

  /**
   * Check if user has any permissions
   */
  hasAnyPermissions(permissions: UserPermissions): boolean {
    const nanoPerms = permissions.royal_nano ? 
      Object.values(permissions.royal_nano).some(v => v === true) : false;
    
    const shieldPerms = permissions.royal_shield ? 
      Object.values(permissions.royal_shield).some(v => v === true) : false;

    return nanoPerms || shieldPerms;
  }

  /**
   * Get permission summary for display
   */
  getPermissionSummary(permissions: UserPermissions): {
    royal_nano: string[];
    royal_shield: string[];
    total: number;
  } {
    const nanoPerms = this.getGrantedPermissions(permissions, 'royal_nano');
    const shieldPerms = this.getGrantedPermissions(permissions, 'royal_shield');

    return {
      royal_nano: nanoPerms,
      royal_shield: shieldPerms,
      total: nanoPerms.length + shieldPerms.length
    };
  }
}




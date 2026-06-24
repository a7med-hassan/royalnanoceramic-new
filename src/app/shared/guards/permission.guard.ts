import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    console.log('🛡️ PermissionGuard: Checking access to:', state.url);

    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      console.warn('❌ PermissionGuard: User not logged in');
      return this.router.createUrlTree(['/admin'], { 
        queryParams: { returnUrl: state.url } 
      });
    }

    // Get required permissions from route data
    const requiredSite = route.data['site'] as string;
    const requiredPermission = route.data['permission'] as string;

    // If no permission requirements, allow access
    if (!requiredSite || !requiredPermission) {
      console.log('✅ PermissionGuard: No permission requirements, access granted');
      return true;
    }

    console.log(`🔍 PermissionGuard: Checking permission ${requiredSite}.${requiredPermission}`);

    // Check if user has required permission
    const hasPermission = this.authService.hasPermission(requiredSite, requiredPermission);
    
    if (hasPermission) {
      console.log(`✅ PermissionGuard: User has permission ${requiredSite}.${requiredPermission}`);
      return true;
    }

    // User doesn't have required permission
    console.warn(`❌ PermissionGuard: User lacks permission ${requiredSite}.${requiredPermission}`);
    
    // Redirect to appropriate page based on user's permissions
    const user = this.authService.getCurrentUser();
    const redirectPath = this.findFirstAvailablePage(user);
    
    console.log(`🔀 PermissionGuard: Redirecting to ${redirectPath}`);
    return this.router.createUrlTree([redirectPath]);
  }

  /**
   * Find the first available page based on user's permissions
   */
  private findFirstAvailablePage(user: any): string {
    if (!user?.permissions) {
      return '/admin/dashboard/access-denied';
    }

    const royalNanoPermissions = user.permissions.royal_nano;
    const royalShieldPermissions = user.permissions.royal_shield;

    // Check Royal Nano permissions first
    if (royalNanoPermissions) {
      if (royalNanoPermissions.overview) {
        return '/admin/dashboard/overview';
      }
      
      if (royalNanoPermissions.messages) {
        return '/admin/dashboard/messages';
      }
      
      if (royalNanoPermissions.services) {
        return '/admin/dashboard/services';
      }
      
      if (royalNanoPermissions.gallery) {
        return '/admin/dashboard/gallery';
      }
      
      if (royalNanoPermissions.blog) {
        return '/admin/dashboard/blog';
      }
      
      if (royalNanoPermissions.reviews) {
        return '/admin/dashboard/reviews';
      }
      
      if (royalNanoPermissions.manage_users) {
        return '/admin/dashboard/users';
      }
      
      if (royalNanoPermissions.analytics) {
        return '/admin/dashboard/analytics';
      }
      
      if (royalNanoPermissions.landing_pages) {
        return '/admin/dashboard/landing-pages';
      }

      // If user has access but no specific permissions
      if (royalNanoPermissions.access) {
        return '/admin/dashboard';
      }
    }

    // Check Royal Shield permissions
    if (royalShieldPermissions) {
      if (royalShieldPermissions.serials) {
        return '/admin/dashboard/royal-shield/serials';
      }
      
      if (royalShieldPermissions.requests) {
        return '/admin/dashboard/royal-shield/requests';
      }
      
      // Check for activated_warrantys (new) or warranties (old for backward compatibility)
      if (royalShieldPermissions.activated_warrantys || (royalShieldPermissions as any).warranties) {
        return '/admin/dashboard/royal-shield/warranties';
      }

      // If user has access but no specific permissions
      if (royalShieldPermissions.access) {
        return '/admin/dashboard';
      }
    }

    // No permissions at all
    return '/admin/dashboard/access-denied';
  }
}

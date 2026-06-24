import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    console.log('🔒 AuthGuard: Checking authentication for:', state.url);

    // Check if user is logged in
    if (this.authService.isLoggedIn()) {
      console.log('✅ AuthGuard: User is authenticated');
      return true;
    }

    // Check if there's a user in localStorage (might be loading)
    const stored = localStorage.getItem('auth-user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user && user.email && user.uid) {
          console.log('🔄 AuthGuard: User found in storage, allowing access while Firebase loads');
          return true;
        } else {
          console.warn('⚠️ AuthGuard: Invalid user data in storage');
          localStorage.removeItem('auth-user');
        }
      } catch (error) {
        console.error('❌ AuthGuard: Error parsing stored user:', error);
        localStorage.removeItem('auth-user');
      }
    }

    // User is not logged in, redirect to login page
    console.warn('❌ AuthGuard: User not authenticated, redirecting to login');
    return this.router.createUrlTree(['/admin'], { 
      queryParams: { returnUrl: state.url } 
    });
  }
}

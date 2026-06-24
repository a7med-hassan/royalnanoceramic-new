import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      return true;
    }

    // Redirect based on login status
    if (this.authService.isLoggedIn()) {
      // User is logged in but not admin
      this.router.navigate(['/admin/dashboard']);
    } else {
      // User is not logged in
      this.router.navigate(['/admin'], { 
        queryParams: { returnUrl: state.url } 
      });
    }
    
    return false;
  }
}

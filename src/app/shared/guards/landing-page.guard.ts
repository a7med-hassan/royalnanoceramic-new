 import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { LandingPageService } from '../services/landing-page.service';
import { Observable, of } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LandingPageGuard implements CanActivate {
  constructor(
    private landingPageService: LandingPageService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const slug = route.paramMap.get('pageSlug');
    
    if (!slug) {
      this.router.navigate(['/home']);
      return of(false);
    }

    // Check if landing page exists in Firebase
    return this.landingPageService.getLandingPage(slug).pipe(
      timeout(5000), // 5 second timeout
      map((page) => {
        if (page && page.active) {
          return true; // Page exists and is active
        }
        // Page doesn't exist or is inactive, redirect to home
        this.router.navigate(['/home']);
        return false;
      }),
      catchError((error) => {
        console.error('Error checking landing page:', error);
        // On error, redirect to home
        this.router.navigate(['/home']);
        return of(false);
      })
    );
  }
}

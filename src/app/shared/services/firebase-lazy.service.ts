/**
 * Firebase Lazy Loading Service
 * Loads Firebase modules only when needed to improve initial page load
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseLazyService {
  private firebaseApp: any = null;
  private firestore: any = null;
  private auth: any = null;
  private analytics: any = null;
  private performance: any = null;
  
  private loadingState = new BehaviorSubject<{
    firebase: boolean;
    firestore: boolean;
    auth: boolean;
    analytics: boolean;
    performance: boolean;
  }>({
    firebase: false,
    firestore: false,
    auth: false,
    analytics: false,
    performance: false
  });

  constructor() {}

  // Get loading state
  getLoadingState(): Observable<any> {
    return this.loadingState.asObservable();
  }

  // Initialize Firebase App (core)
  async initializeFirebase(): Promise<any> {
    if (this.firebaseApp) {
      return this.firebaseApp;
    }

    try {
      const { initializeApp } = await import('firebase/app');
      const { getApps } = await import('firebase/app');
      
      // Firebase config
      const firebaseConfig = {
        apiKey: "your-api-key",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "your-app-id"
      };

      // Initialize only if no apps exist
      if (getApps().length === 0) {
        this.firebaseApp = initializeApp(firebaseConfig);
      } else {
        this.firebaseApp = getApps()[0];
      }

      this.loadingState.next({
        ...this.loadingState.value,
        firebase: true
      });

      return this.firebaseApp;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }

  // Initialize Firestore
  async initializeFirestore(): Promise<any> {
    if (this.firestore) {
      return this.firestore;
    }

    try {
      await this.initializeFirebase();
      const { getFirestore } = await import('firebase/firestore');
      
      this.firestore = getFirestore(this.firebaseApp);
      
      this.loadingState.next({
        ...this.loadingState.value,
        firestore: true
      });

      return this.firestore;
    } catch (error) {
      console.error('Error initializing Firestore:', error);
      throw error;
    }
  }

  // Initialize Auth
  async initializeAuth(): Promise<any> {
    if (this.auth) {
      return this.auth;
    }

    try {
      await this.initializeFirebase();
      const { getAuth } = await import('firebase/auth');
      
      this.auth = getAuth(this.firebaseApp);
      
      this.loadingState.next({
        ...this.loadingState.value,
        auth: true
      });

      return this.auth;
    } catch (error) {
      console.error('Error initializing Auth:', error);
      throw error;
    }
  }

  // Initialize Analytics
  async initializeAnalytics(): Promise<any> {
    if (this.analytics) {
      return this.analytics;
    }

    try {
      await this.initializeFirebase();
      const { getAnalytics } = await import('firebase/analytics');
      
      this.analytics = getAnalytics(this.firebaseApp);
      
      this.loadingState.next({
        ...this.loadingState.value,
        analytics: true
      });

      return this.analytics;
    } catch (error) {
      console.error('Error initializing Analytics:', error);
      throw error;
    }
  }

  // Initialize Performance
  async initializePerformance(): Promise<any> {
    if (this.performance) {
      return this.performance;
    }

    try {
      await this.initializeFirebase();
      const { getPerformance } = await import('firebase/performance');
      
      this.performance = getPerformance(this.firebaseApp);
      
      this.loadingState.next({
        ...this.loadingState.value,
        performance: true
      });

      return this.performance;
    } catch (error) {
      console.error('Error initializing Performance:', error);
      throw error;
    }
  }

  // Preload Firebase modules (for critical features)
  async preloadCriticalModules(): Promise<void> {
    try {
      // Preload only critical modules
      await Promise.all([
        this.initializeFirebase(),
        this.initializeFirestore()
      ]);
    } catch (error) {
      console.error('Error preloading critical modules:', error);
    }
  }

  // Load Firebase modules on user interaction
  async loadOnInteraction(): Promise<void> {
    try {
      await Promise.all([
        this.initializeAuth(),
        this.initializeAnalytics(),
        this.initializePerformance()
      ]);
    } catch (error) {
      console.error('Error loading modules on interaction:', error);
    }
  }

  // Get Firebase App
  getFirebaseApp(): any {
    return this.firebaseApp;
  }

  // Get Firestore
  getFirestore(): any {
    return this.firestore;
  }

  // Get Auth
  getAuth(): any {
    return this.auth;
  }

  // Get Analytics
  getAnalytics(): any {
    return this.analytics;
  }

  // Get Performance
  getPerformance(): any {
    return this.performance;
  }
}

/**
 * Firebase Lazy Loading Guard
 * Ensures Firebase is loaded before route activation
 */
import { CanActivate, Router } from '@angular/router';
export class FirebaseLazyGuard implements CanActivate {
  constructor(
    private firebaseLazyService: FirebaseLazyService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      await this.firebaseLazyService.preloadCriticalModules();
      return true;
    } catch (error) {
      console.error('Firebase lazy loading failed:', error);
      // Redirect to offline page or show error
      this.router.navigate(['/offline']);
      return false;
    }
  }
}

/**
 * Firebase Lazy Loading Directive
 * Loads Firebase modules when element comes into view
 */
import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appFirebaseLazy]'
})
export class FirebaseLazyDirective implements OnInit {
  constructor(
    private elementRef: ElementRef,
    private firebaseLazyService: FirebaseLazyService
  ) {}

  ngOnInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.firebaseLazyService.loadOnInteraction();
          observer.unobserve(entry.target);
        }
      });
    });

    observer.observe(this.elementRef.nativeElement);
  }
}

/**
 * Usage Examples:
 * 
 * 1. In app.component.ts:
 *    constructor(private firebaseLazyService: FirebaseLazyService) {
 *      // Load Firebase on first user interaction
 *      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
 *        document.addEventListener(event, () => {
 *          this.firebaseLazyService.loadOnInteraction();
 *        }, { once: true, passive: true });
 *      });
 *    }
 * 
 * 2. In routes:
 *    { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule), canActivate: [FirebaseLazyGuard] }
 * 
 * 3. In template:
 *    <div appFirebaseLazy>This will load Firebase when visible</div>
 * 
 * 4. In service:
 *    async getData() {
 *      const firestore = await this.firebaseLazyService.initializeFirestore();
 *      // Use firestore...
 *    }
 */

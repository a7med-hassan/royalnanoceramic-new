import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ErrorNotificationComponent } from './components/error-notification/error-notification.component';
import { filter } from 'rxjs/operators';
import { PerformanceService } from './shared/services/performance.service';
import { ImageOptimizationService } from './shared/services/image-optimization.service';
import { ScrollToTopService } from './shared/services/scroll-to-top.service';
import { TranslationService } from './shared/services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ErrorNotificationComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'royal-nano-ceramic';
  currentLang = 'ar';
  isRtl = true;
  currentRoute = '';
  isAdminRoute = false;
  isDiscountRoute = false;

  constructor(
    private router: Router,
    private performanceService: PerformanceService,
    private imageOptimizationService: ImageOptimizationService,
    private scrollToTopService: ScrollToTopService,
    private translationService: TranslationService
  ) {
    // Subscribe to router events to scroll to top on navigation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.url;
          this.isAdminRoute = this.currentRoute.startsWith('/admin');
          this.isDiscountRoute = this.currentRoute === '/discount';
        }
        this.scrollToTopService.scrollToTop();
      });
  }

  ngOnInit(): void {
    try {
      // Initialize language and direction from TranslationService
      this.currentLang = this.translationService.getCurrentLanguage();
      this.isRtl = this.translationService.isRtl$;

      // React to language changes
      this.translationService.languageChanged$.subscribe(() => {
        this.currentLang = this.translationService.getCurrentLanguage();
        this.isRtl = this.translationService.isRtl$;
      });

      // Initialize route tracking
      this.currentRoute = this.router.url;
      this.isAdminRoute = this.currentRoute.startsWith('/admin');

      // Initialize performance monitoring
      this.initializePerformanceOptimizations();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  /**
   * Initialize performance optimizations
   */
  private initializePerformanceOptimizations(): void {
    // Measure page load performance
    this.performanceService.measurePageLoad();
    
    // Monitor Core Web Vitals
    this.performanceService.monitorCoreWebVitals();
    
    // Preload critical resources
    this.performanceService.preloadCriticalResources();
    
    // Optimize font loading
    this.performanceService.optimizeFontLoading();
    
    // Initialize lazy loading for images
    setTimeout(() => {
      this.imageOptimizationService.observeImages();
    }, 100);
  }

}

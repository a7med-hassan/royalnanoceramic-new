import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ErrorNotificationComponent } from './components/error-notification/error-notification.component';
import { filter } from 'rxjs/operators';

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

  constructor(private router: Router) {
    // Subscribe to router events to scroll to top on navigation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.url;
          this.isAdminRoute = this.currentRoute.startsWith('/admin');
        }
        this.scrollToTop();
      });
  }

  ngOnInit(): void {
    try {
      // Set initial RTL and language settings
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
      document.body.className = 'rtl arabic-font';

      // Initialize route tracking
      this.currentRoute = this.router.url;
      this.isAdminRoute = this.currentRoute.startsWith('/admin');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  /**
   * Scroll to top of the page
   */
  private scrollToTop(): void {
    try {
      // Smooth scroll to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });

      // Fallback for older browsers
      if (!window.scrollTo) {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    } catch (error) {
      console.error('Error scrolling to top:', error);
      // Fallback: instant scroll to top
      window.scrollTo(0, 0);
    }
  }
}

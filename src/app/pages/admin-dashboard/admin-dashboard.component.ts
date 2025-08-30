import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { AdminApiService } from '../../shared/services/admin-api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  private destroy$ = new Subject<void>();
  currentRoute: string = '';
  isLoggedIn: boolean = false;
  adminUser: any = null;
  isScrolling: boolean = false;
  private scrollTimeout: any;

  menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      route: '/admin/dashboard',
      active: false,
    },
    {
      id: 'overview',
      title: 'Overview',
      icon: 'fas fa-chart-line',
      route: '/admin/dashboard/overview',
      active: false,
    },
    {
      id: 'messages',
      title: 'Messages',
      icon: 'fas fa-envelope',
      route: '/admin/dashboard/messages',
      active: false,
    },
    {
      id: 'services',
      title: 'Services',
      icon: 'fas fa-cogs',
      route: '/admin/dashboard/services',
      active: false,
    },
    {
      id: 'gallery',
      title: 'Gallery',
      icon: 'fas fa-images',
      route: '/admin/dashboard/gallery',
      active: false,
    },
    {
      id: 'blog',
      title: 'Blog',
      icon: 'fas fa-blog',
      route: '/admin/dashboard/blog',
      active: false,
    },
  ];

  constructor(
    private router: Router,
    private adminApiService: AdminApiService
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.setupRouteTracking();
  }

  ngAfterViewInit(): void {
    this.setupScrollListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Clean up event listeners
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.querySelector('.admin-sidebar');

    if (mainContent) {
      mainContent.removeEventListener('scroll', this.handleScroll.bind(this));
    }

    if (sidebar) {
      sidebar.removeEventListener(
        'scroll',
        this.handleSidebarScroll.bind(this)
      );
    }

    window.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  private checkLoginStatus(): void {
    this.isLoggedIn = this.adminApiService.isLoggedIn();
    this.adminUser = this.adminApiService.getCurrentAdmin();

    if (!this.isLoggedIn) {
      this.router.navigate(['/admin']);
    }
  }

  private setupRouteTracking(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.url;
          this.updateActiveMenuItem();
        }
      });
  }

  private updateActiveMenuItem(): void {
    this.menuItems.forEach((item) => {
      // Check for exact match or if current route starts with the item route
      item.active =
        this.currentRoute === item.route ||
        (item.route !== '/admin/dashboard' &&
          this.currentRoute.startsWith(item.route));
    });
  }

  navigateTo(route: string): void {
    console.log('Navigating to:', route);
    this.router
      .navigate([route])
      .then((success) => {
        if (success) {
          console.log('Navigation successful to:', route);
        } else {
          console.error('Navigation failed to:', route);
        }
      })
      .catch((error) => {
        console.error('Navigation error:', error);
      });
  }

  logout(): void {
    this.adminApiService.logout();
    this.router.navigate(['/admin']);
  }

  private setupScrollListeners(): void {
    // Listen for scroll events on the main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.addEventListener('scroll', this.handleScroll.bind(this), {
        passive: true,
      });
    }

    // Listen for scroll events on the sidebar
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) {
      sidebar.addEventListener('scroll', this.handleSidebarScroll.bind(this), {
        passive: true,
      });
    }

    // Also listen for window scroll events
    window.addEventListener('scroll', this.handleScroll.bind(this), {
      passive: true,
    });
  }

  private handleScroll(event: Event): void {
    this.isScrolling = true;
    this.updateScrollClasses();
    this.updateSidebarPosition();

    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Set timeout to remove scrolling class
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
      this.updateScrollClasses();
    }, 150);
  }

  private handleSidebarScroll(event: Event): void {
    const sidebar = event.target as HTMLElement;
    const scrollTop = sidebar.scrollTop;

    // Add visual feedback based on scroll position
    if (scrollTop > 10) {
      sidebar.classList.add('scrolled');
    } else {
      sidebar.classList.remove('scrolled');
    }
  }

  private updateScrollClasses(): void {
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.querySelector('.admin-sidebar');

    if (mainContent) {
      if (this.isScrolling) {
        mainContent.classList.add('scrolling');
      } else {
        mainContent.classList.remove('scrolling');
      }
    }

    if (sidebar) {
      if (this.isScrolling) {
        sidebar.classList.add('scrolling');
      } else {
        sidebar.classList.remove('scrolling');
      }
    }
  }

  private updateSidebarPosition(): void {
    const sidebar = document.querySelector('.admin-sidebar') as HTMLElement;
    const mainContent = document.querySelector('.main-content') as HTMLElement;

    if (sidebar && mainContent) {
      const scrollTop = mainContent.scrollTop;
      const maxScroll = mainContent.scrollHeight - mainContent.clientHeight;

      // Calculate the sidebar position based on scroll
      // Use a smoother calculation for better visual effect
      const sidebarTop = Math.min(scrollTop * 0.8, maxScroll * 0.8);

      // Apply the transform to move the sidebar with smooth animation
      sidebar.style.transform = `translateZ(0) translateY(${sidebarTop}px)`;
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event): void {
    // Handle window scroll if needed
    this.handleScroll(event);
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentRoute: string = '';
  isLoggedIn: boolean = false;
  adminUser: string = '';

  menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      route: '/admin/dashboard',
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.setupRouteTracking();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkLoginStatus(): void {
    this.isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    this.adminUser = localStorage.getItem('adminUser') || '';

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
      item.active = this.currentRoute === item.route;
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    this.router.navigate(['/admin']);
  }
}

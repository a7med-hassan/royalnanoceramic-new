import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'about', 
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  { 
    path: 'services', 
    loadComponent: () => import('./pages/services/services.component').then(m => m.ServicesComponent)
  },
  { 
    path: 'blog', 
    loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent)
  },
  { 
    path: 'gallery', 
    loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent)
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  { 
    path: 'join-us', 
    loadComponent: () => import('./pages/join-us/join-us.component').then(m => m.JoinUsComponent)
  },
  { 
    path: 'discount', 
    loadComponent: () => import('./pages/discount/discount.component').then(m => m.DiscountComponent)
  },

  // Admin routes - lazy loaded
  { 
    path: 'admin', 
    loadComponent: () => import('./pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  { path: 'admin/login', redirectTo: '/admin', pathMatch: 'full' },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    children: [
      { 
        path: '', 
        loadComponent: () => import('./pages/admin-dashboard-overview/admin-dashboard-overview.component').then(m => m.AdminDashboardOverviewComponent)
      },
      { 
        path: 'overview', 
        loadComponent: () => import('./pages/admin-dashboard-overview/admin-dashboard-overview.component').then(m => m.AdminDashboardOverviewComponent)
      },
      { 
        path: 'messages', 
        loadComponent: () => import('./pages/admin-messages/admin-messages.component').then(m => m.AdminMessagesComponent)
      },
      { 
        path: 'services', 
        loadComponent: () => import('./pages/admin-services/admin-services.component').then(m => m.AdminServicesComponent)
      },
      { 
        path: 'gallery', 
        loadComponent: () => import('./pages/admin-gallery/admin-gallery.component').then(m => m.AdminGalleryComponent)
      },
      { 
        path: 'blog', 
        loadComponent: () => import('./pages/blog-dashboard/blog-dashboard.component').then(m => m.BlogDashboardComponent)
      },
    ],
  },
  {
    path: 'admin/messages',
    redirectTo: '/admin/dashboard/messages',
    pathMatch: 'full',
  },
  {
    path: 'admin/services',
    redirectTo: '/admin/dashboard/services',
    pathMatch: 'full',
  },
  {
    path: 'admin/gallery',
    redirectTo: '/admin/dashboard/gallery',
    pathMatch: 'full',
  },
  {
    path: 'admin/blog',
    redirectTo: '/admin/dashboard/blog',
    pathMatch: 'full',
  },

  // Legacy admin routes
  { 
    path: 'admin/access', 
    loadComponent: () => import('./pages/admin-access/admin-access.component').then(m => m.AdminAccessComponent)
  },
  { 
    path: 'dashboard/blog', 
    loadComponent: () => import('./pages/blog-dashboard/blog-dashboard.component').then(m => m.BlogDashboardComponent)
  },

  { path: '**', redirectTo: '/home' },
];

import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ServicesComponent } from './pages/services/services.component';
import { BlogComponent } from './pages/blog/blog.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { ContactComponent } from './pages/contact/contact.component';
import { JoinUsComponent } from './pages/join-us/join-us.component';
import { AdminMessagesComponent } from './pages/admin-messages/admin-messages.component';
import { BlogDashboardComponent } from './pages/blog-dashboard/blog-dashboard.component';
import { AdminAccessComponent } from './pages/admin-access/admin-access.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminDashboardOverviewComponent } from './pages/admin-dashboard-overview/admin-dashboard-overview.component';
import { AdminServicesComponent } from './pages/admin-services/admin-services.component';
import { AdminGalleryComponent } from './pages/admin-gallery/admin-gallery.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'join-us', component: JoinUsComponent },

  // Admin routes
  { path: 'admin', component: AdminLoginComponent },
  { path: 'admin/login', redirectTo: '/admin', pathMatch: 'full' },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    children: [
      { path: '', component: AdminDashboardOverviewComponent },
      { path: 'overview', component: AdminDashboardOverviewComponent },
      { path: 'messages', component: AdminMessagesComponent },
      { path: 'services', component: AdminServicesComponent },
      { path: 'gallery', component: AdminGalleryComponent },
      { path: 'blog', component: BlogDashboardComponent },
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
  { path: 'admin/access', component: AdminAccessComponent },
  { path: 'dashboard/blog', component: BlogDashboardComponent },

  { path: '**', redirectTo: '/home' },
];

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

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'join-us', component: JoinUsComponent },
  { path: 'admin/messages', component: AdminMessagesComponent },
  // Admin login route
  { path: 'admin/login', component: AdminLoginComponent },
  // Admin access management route
  { path: 'admin/access', component: AdminAccessComponent },
  // Private dashboard route - only accessible via direct link after login
  { path: 'dashboard/blog', component: BlogDashboardComponent },
  { path: '**', redirectTo: '/home' },
];

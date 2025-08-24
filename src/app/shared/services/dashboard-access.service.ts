import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DashboardAccessService {
  private readonly ADMIN_USERNAME = 'admin';
  private readonly ADMIN_PASSWORD = 'admin';
  private readonly ACCESS_KEY = 'dashboard-access';
  private readonly ACCESS_TOKEN = 'royal-nano-2024';

  constructor(private router: Router) {}

  /**
   * Login with username and password
   */
  login(username: string, password: string): boolean {
    if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
      // Grant access and store session
      localStorage.setItem(this.ACCESS_KEY, this.ACCESS_TOKEN);
      localStorage.setItem('dashboard-username', username);
      localStorage.setItem('dashboard-login-time', new Date().toISOString());
      return true;
    }
    return false;
  }

  /**
   * Check if user has access to dashboard
   */
  hasAccess(): boolean {
    const hasAccess =
      localStorage.getItem(this.ACCESS_KEY) === this.ACCESS_TOKEN;

    // Check if session is still valid (24 hours)
    if (hasAccess) {
      const loginTime = localStorage.getItem('dashboard-login-time');
      if (loginTime) {
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
          // Session expired, revoke access
          this.revokeAccess();
          return false;
        }
      }
    }

    return hasAccess;
  }

  /**
   * Get current logged in username
   */
  getCurrentUsername(): string {
    return localStorage.getItem('dashboard-username') || '';
  }

  /**
   * Get login time
   */
  getLoginTime(): string {
    return localStorage.getItem('dashboard-login-time') || '';
  }

  /**
   * Revoke dashboard access
   */
  revokeAccess(): void {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem('dashboard-username');
    localStorage.removeItem('dashboard-login-time');
  }

  /**
   * Validate access and redirect if unauthorized
   */
  validateAccess(): boolean {
    if (!this.hasAccess()) {
      // Redirect to login page if no access
      this.router.navigate(['/admin/login']);
      return false;
    }
    return true;
  }

  /**
   * Get dashboard URL for sharing
   */
  getDashboardUrl(): string {
    return `${window.location.origin}/dashboard/blog`;
  }

  /**
   * Get login URL
   */
  getLoginUrl(): string {
    return `${window.location.origin}/admin/login`;
  }

  /**
   * Check if credentials are valid (for form validation)
   */
  validateCredentials(username: string, password: string): boolean {
    return username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD;
  }
}

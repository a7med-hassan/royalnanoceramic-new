import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-admin-dashboard-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="dashboard-home-container">
      <mat-card class="dashboard-home-card">
        <mat-card-content>
          <div class="loading-content" *ngIf="isRedirecting">
            <mat-spinner></mat-spinner>
            <h3>جاري التوجيه...</h3>
            <p>نحن نوجهك إلى الصفحة المناسبة لك</p>
          </div>
          
          <div class="error-content" *ngIf="!isRedirecting && redirectError">
            <h3>خطأ في التوجيه</h3>
            <p>{{ redirectError }}</p>
            <button mat-raised-button color="primary" (click)="goToLogin()">
              العودة إلى تسجيل الدخول
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-home-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .dashboard-home-card {
      max-width: 400px;
      width: 100%;
      text-align: center;
    }

    .loading-content {
      padding: 40px 20px;
      
      mat-spinner {
        margin: 0 auto 20px;
      }
      
      h3 {
        color: #1976d2;
        margin-bottom: 12px;
      }
      
      p {
        color: #666;
        margin: 0;
      }
    }

    .error-content {
      padding: 40px 20px;
      
      h3 {
        color: #f44336;
        margin-bottom: 12px;
      }
      
      p {
        color: #666;
        margin-bottom: 24px;
      }
    }
  `]
})
export class AdminDashboardHomeComponent implements OnInit {
  isRedirecting = true;
  redirectError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.handleSmartRedirect();
  }

  private handleSmartRedirect(): void {
    try {
      const user = this.authService.getCurrentUser();
      
      if (!user) {
        this.router.navigate(['/admin']);
        return;
      }

      // Check if user has any permissions
      if (!this.hasAnyPermissions(user)) {
        this.router.navigate(['/admin/dashboard/access-denied']);
        return;
      }

      // Find first available page based on permissions
      const redirectPath = this.findFirstAvailablePage(user);
      
      if (redirectPath) {
        this.router.navigate([redirectPath]);
      } else {
        this.router.navigate(['/admin/dashboard/access-denied']);
      }

    } catch (error) {
      console.error('Error in smart redirect:', error);
      this.isRedirecting = false;
      this.redirectError = 'حدث خطأ أثناء التوجيه. يرجى المحاولة مرة أخرى.';
    }
  }

  private hasAnyPermissions(user: any): boolean {
    const royalNanoPermissions = user?.permissions?.royal_nano;
    const royalShieldPermissions = user?.permissions?.royal_shield;
    
    // Check if user has any Royal Nano permissions
    if (royalNanoPermissions && Object.values(royalNanoPermissions).some(permission => permission === true)) {
      return true;
    }
    
    // Check if user has any Royal Shield permissions
    if (royalShieldPermissions && Object.values(royalShieldPermissions).some(permission => permission === true)) {
      return true;
    }
    
    return false;
  }

  private findFirstAvailablePage(user: any): string | null {
    const royalNanoPermissions = user?.permissions?.royal_nano;
    const royalShieldPermissions = user?.permissions?.royal_shield;
    
    // Check Royal Nano permissions first
    if (royalNanoPermissions?.overview) {
      return '/admin/dashboard/overview';
    } else if (royalNanoPermissions?.messages) {
      return '/admin/dashboard/messages';
    } else if (royalNanoPermissions?.services) {
      return '/admin/dashboard/services';
    } else if (royalNanoPermissions?.gallery) {
      return '/admin/dashboard/gallery';
    } else if (royalNanoPermissions?.blog) {
      return '/admin/dashboard/blog';
    } else if (royalNanoPermissions?.reviews) {
      return '/admin/dashboard/reviews';
    } else if (royalNanoPermissions?.manage_users) {
      return '/admin/dashboard/users';
    } else if (royalNanoPermissions?.analytics) {
      return '/admin/dashboard/analytics';
    } else if (royalNanoPermissions?.landing_pages) {
      return '/admin/dashboard/landing-pages';
    }
    
    // Check Royal Shield permissions
    if (royalShieldPermissions?.serials) {
      return '/admin/dashboard/royal-shield/serials';
    } else if (royalShieldPermissions?.requests) {
      return '/admin/dashboard/royal-shield/requests';
    } else if (royalShieldPermissions?.activated_warrantys || (royalShieldPermissions as any)?.warranties) {
      return '/admin/dashboard/royal-shield/warranties';
    }
    
    return null;
  }

  goToLogin(): void {
    this.authService.signOut();
  }
}

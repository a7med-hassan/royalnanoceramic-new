import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-admin-access-denied',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div class="access-denied-container">
      <mat-card class="access-denied-card">
        <mat-card-header>
          <div mat-card-avatar class="access-denied-avatar">
            <mat-icon>block</mat-icon>
          </div>
          <mat-card-title>وصول مرفوض</mat-card-title>
          <mat-card-subtitle>ليس لديك صلاحية للوصول إلى هذه الصفحة</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="access-denied-content">
            <mat-icon class="warning-icon">warning</mat-icon>
            <h3>عذراً، لا يمكنك الوصول إلى لوحة التحكم</h3>
            <p>حسابك لا يملك الصلاحيات المطلوبة للوصول إلى هذه المنطقة.</p>
            
            <div class="user-info" *ngIf="currentUser">
              <p><strong>المستخدم:</strong> {{ currentUser.name }}</p>
              <p><strong>الدور:</strong> {{ currentUser.role === 'admin' ? 'مدير' : 'مستخدم' }}</p>
            </div>
            
            <div class="suggestions">
              <h4>ما يمكنك فعله:</h4>
              <ul>
                <li>تأكد من بيانات تسجيل الدخول</li>
                <li>تواصل مع المدير لطلب الصلاحيات المطلوبة</li>
                <li>ارجع إلى الصفحة الرئيسية</li>
              </ul>
            </div>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="goHome()">
            <mat-icon>home</mat-icon>
            الصفحة الرئيسية
          </button>
          <button mat-button (click)="logout()">
            <mat-icon>logout</mat-icon>
            تسجيل الخروج
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .access-denied-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .access-denied-avatar {
      background-color: #f44336;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      
      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .access-denied-content {
      padding: 20px 0;
      
      .warning-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ff9800;
        margin-bottom: 16px;
      }
      
      h3 {
        color: #333;
        margin-bottom: 16px;
      }
      
      p {
        color: #666;
        line-height: 1.6;
        margin-bottom: 20px;
      }
    }

    .user-info {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: right;
      
      p {
        margin: 8px 0;
        color: #333;
      }
    }

    .suggestions {
      text-align: right;
      margin-top: 20px;
      
      h4 {
        color: #1976d2;
        margin-bottom: 12px;
      }
      
      ul {
        text-align: right;
        padding-right: 20px;
        color: #666;
        
        li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
      }
    }

    mat-card-actions {
      justify-content: center;
      gap: 16px;
      padding: 20px;
      
      button {
        min-width: 140px;
      }
    }

    @media (max-width: 600px) {
      .access-denied-container {
        padding: 10px;
      }
      
      mat-card-actions {
        flex-direction: column;
        
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class AdminAccessDeniedComponent {
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  goHome(): void {
    window.location.href = '/';
  }

  logout(): void {
    this.authService.signOut();
  }
}

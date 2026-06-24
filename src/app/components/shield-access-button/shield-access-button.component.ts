/**
 * Shield Access Button Component
 * 
 * زر متكامل لفتح Royal Shield Dashboard مع التحقق من الصلاحيات
 */

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { UserPermissionService } from '../../shared/services/user-permission.service';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-shield-access-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <button
      mat-raised-button
      [color]="color"
      [disabled]="disabled || loading"
      (click)="openShield()"
      [matTooltip]="tooltipText"
      class="shield-access-btn"
      [class.loading]="loading"
    >
      <mat-icon *ngIf="!loading">{{ icon }}</mat-icon>
      <mat-icon *ngIf="loading" class="spinning">refresh</mat-icon>
      <span>{{ buttonText }}</span>
    </button>
  `,
  styles: [`
    .shield-access-btn {
      min-width: 200px;
      height: 48px;
      font-size: 1em;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s ease;
    }

    .shield-access-btn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .shield-access-btn.loading {
      opacity: 0.7;
      cursor: wait;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
  `]
})
export class ShieldAccessButtonComponent implements OnInit {
  @Input() buttonText = 'فتح Royal Shield';
  @Input() icon = 'shield';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() disabled = false;
  @Input() shieldUrl = 'https://royalshieldworld.com/dashboard';
  @Input() useOTAT = true; // Use One-Time Access Token
  @Input() backendUrl = 'https://royal-nano-backend.vercel.app/api/admin/shield-token';

  loading = false;
  hasAccess = false;
  tooltipText = 'فتح لوحة تحكم Royal Shield';

  constructor(
    private permissionService: UserPermissionService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.checkAccess();
  }

  /**
   * التحقق من صلاحية الوصول إلى Royal Shield
   */
  async checkAccess() {
    try {
      // Get permissions
      await this.permissionService.getPermissions();
      
      // Check Royal Shield access
      this.hasAccess = this.permissionService.hasPermission('royal_shield', 'access');
      
      if (!this.hasAccess) {
        this.tooltipText = '🚫 ليس لديك صلاحية الوصول إلى Royal Shield';
        this.disabled = true;
      } else {
        this.tooltipText = 'فتح لوحة تحكم Royal Shield';
      }
      
    } catch (error) {
      console.error('Error checking access:', error);
      this.disabled = true;
      this.tooltipText = 'خطأ في التحقق من الصلاحيات';
    }
  }

  /**
   * فتح Royal Shield Dashboard
   */
  async openShield() {
    console.log('🛡️ Opening Royal Shield...');

    // التحقق من الصلاحية
    if (!this.hasAccess) {
      this.showAccessDenied();
      return;
    }

    // التحقق من تسجيل الدخول
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.showError('يجب تسجيل الدخول أولاً');
      return;
    }

    this.loading = true;

    try {
      if (this.useOTAT) {
        // Method 1: استخدام OTAT (موصى به)
        await this.openWithOTAT();
      } else {
        // Method 2: التمرير المباشر
        await this.openDirectly();
      }
    } catch (error: any) {
      console.error('❌ Error opening Shield:', error);
      this.handleError(error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * فتح Royal Shield باستخدام OTAT (One-Time Access Token)
   */
  private async openWithOTAT() {
    console.log('🔄 Using OTAT method...');

    try {
      // الحصول على Firebase Token
      const token = await this.authService.getFirebaseToken();
      console.log('🔑 Firebase token obtained');

      // طلب OTAT من Backend
      const response = await this.http.get<{
        success: boolean;
        url?: string;
        message?: string;
        adminInfo?: any;
      }>(this.backendUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).toPromise();

      if (response?.success && response.url) {
        console.log('✅ OTAT generated:', response.url);
        
        // فتح Royal Shield
        const newWindow = window.open(response.url, '_blank');
        
        if (!newWindow) {
          this.showWarning('يرجى السماح بالنوافذ المنبثقة ثم المحاولة مرة أخرى');
        } else {
          this.showSuccess('تم فتح Royal Shield بنجاح');
        }
      } else {
        throw new Error(response?.message || 'فشل توليد رابط الوصول');
      }

    } catch (error) {
      console.error('❌ OTAT error:', error);
      throw error;
    }
  }

  /**
   * فتح Royal Shield بالطريقة المباشرة (Direct Token)
   */
  private async openDirectly() {
    console.log('🔗 Using direct token method...');

    try {
      // الحصول على Firebase Token
      const token = await this.authService.getFirebaseToken();
      console.log('🔑 Firebase token obtained');

      // بناء URL مع Token
      const url = `${this.shieldUrl}?token=${encodeURIComponent(token)}`;
      console.log('🔗 Opening URL:', url.substring(0, 100) + '...');

      // فتح Royal Shield
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        this.showWarning('يرجى السماح بالنوافذ المنبثقة ثم المحاولة مرة أخرى');
      } else {
        this.showSuccess('تم فتح Royal Shield بنجاح');
        this.showWarning('⚠️ تنبيه: Token ظاهر في URL (استخدم OTAT للإنتاج)');
      }

    } catch (error) {
      console.error('❌ Direct token error:', error);
      throw error;
    }
  }

  /**
   * عرض رسالة رفض الوصول
   */
  private showAccessDenied() {
    const message = '🚫 ليس لديك صلاحية الوصول إلى Royal Shield';
    
    this.snackBar.open(message, 'حسناً', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });

    console.warn('❌ Access denied: User does not have royal_shield.access permission');
  }

  /**
   * معالجة الأخطاء
   */
  private handleError(error: any) {
    let message = 'حدث خطأ أثناء فتح Royal Shield';

    if (error.status === 401) {
      message = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى';
    } else if (error.status === 403) {
      message = 'ليس لديك صلاحية الوصول إلى Royal Shield';
    } else if (error.status === 404) {
      message = 'لم يتم العثور على المستخدم في قاعدة البيانات';
    } else if (error.message) {
      message = error.message;
    }

    this.showError(message);
  }

  /**
   * عرض رسالة نجاح
   */
  private showSuccess(message: string) {
    this.snackBar.open(message, 'إغلاق', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * عرض رسالة خطأ
   */
  private showError(message: string) {
    this.snackBar.open(message, 'إغلاق', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * عرض رسالة تحذير
   */
  private showWarning(message: string) {
    this.snackBar.open(message, 'إغلاق', {
      duration: 4000,
      panelClass: ['warning-snackbar']
    });
  }
}



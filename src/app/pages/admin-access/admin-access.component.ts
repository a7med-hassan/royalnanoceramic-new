import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardAccessService } from '../../shared/services/dashboard-access.service';

@Component({
  selector: 'app-admin-access',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-access-container">
      <div class="access-card">
        <h2>إدارة الوصول للوحة التحكم</h2>
        <p>استخدم هذه الروابط للوصول إلى لوحة إدارة المدونة:</p>

        <div class="dashboard-links">
          <div class="link-section">
            <h4>رابط تسجيل الدخول</h4>
            <div class="dashboard-link">
              <input
                type="text"
                [value]="loginUrl"
                readonly
                class="link-input"
              />
              <button
                class="btn-copy"
                (click)="copyToClipboard(loginUrl)"
                [class.copied]="copiedLogin"
              >
                {{ copiedLogin ? 'تم النسخ!' : 'نسخ الرابط' }}
              </button>
            </div>
          </div>

          <div class="link-section">
            <h4>رابط لوحة التحكم</h4>
            <div class="dashboard-link">
              <input
                type="text"
                [value]="dashboardUrl"
                readonly
                class="link-input"
              />
              <button
                class="btn-copy"
                (click)="copyToClipboard(dashboardUrl)"
                [class.copied]="copiedDashboard"
              >
                {{ copiedDashboard ? 'تم النسخ!' : 'نسخ الرابط' }}
              </button>
            </div>
          </div>
        </div>

        <div class="access-actions">
          <button class="btn-grant" (click)="grantAccess()">منح الوصول</button>
          <button class="btn-revoke" (click)="revokeAccess()">
            إلغاء الوصول
          </button>
        </div>

        <div class="access-status">
          <p>
            حالة الوصول:
            <span [class]="'status-' + (hasAccess ? 'granted' : 'denied')">
              {{ hasAccess ? 'ممنوح' : 'مرفوض' }}
            </span>
          </p>
          <p *ngIf="hasAccess">
            المستخدم: <strong>{{ currentUsername }}</strong>
            <br />
            وقت تسجيل الدخول: <strong>{{ loginTime }}</strong>
          </p>
        </div>

        <div class="instructions">
          <h3>تعليمات الاستخدام:</h3>
          <ul>
            <li>استخدم رابط تسجيل الدخول للوصول إلى صفحة تسجيل الدخول</li>
            <li>
              أدخل اسم المستخدم: <code>admin</code> وكلمة المرور:
              <code>admin</code>
            </li>
            <li>بعد تسجيل الدخول، سيتم توجيهك إلى لوحة التحكم</li>
            <li>يمكن إلغاء الوصول في أي وقت</li>
            <li>الجلسة صالحة لمدة 24 ساعة</li>
          </ul>
        </div>

        <div class="credentials-info">
          <h4>بيانات الدخول الافتراضية</h4>
          <div class="credentials">
            <div class="credential-item">
              <span class="label">اسم المستخدم:</span>
              <span class="value">admin</span>
            </div>
            <div class="credential-item">
              <span class="label">كلمة المرور:</span>
              <span class="value">admin</span>
            </div>
          </div>
          <small class="note"
            >يمكن تغيير هذه البيانات في ملف
            <code>dashboard-access.service.ts</code></small
          >
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-access.component.scss'],
})
export class AdminAccessComponent {
  dashboardUrl: string;
  loginUrl: string;
  copiedLogin = false;
  copiedDashboard = false;
  hasAccess = false;
  currentUsername = '';
  loginTime = '';

  constructor(private dashboardAccess: DashboardAccessService) {
    this.dashboardUrl = this.dashboardAccess.getDashboardUrl();
    this.loginUrl = this.dashboardAccess.getLoginUrl();
    this.hasAccess = this.dashboardAccess.hasAccess();
    this.currentUsername = this.dashboardAccess.getCurrentUsername();
    this.loginTime = this.formatLoginTime(this.dashboardAccess.getLoginTime());
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      if (text === this.loginUrl) {
        this.copiedLogin = true;
        setTimeout(() => {
          this.copiedLogin = false;
        }, 2000);
      } else {
        this.copiedDashboard = true;
        setTimeout(() => {
          this.copiedDashboard = false;
        }, 2000);
      }
    });
  }

  grantAccess(): void {
    // This will redirect to login page
    window.location.href = this.loginUrl;
  }

  revokeAccess(): void {
    this.dashboardAccess.revokeAccess();
    this.hasAccess = false;
    this.currentUsername = '';
    this.loginTime = '';
  }

  private formatLoginTime(loginTime: string): string {
    if (!loginTime) return '';

    try {
      const date = new Date(loginTime);
      return date.toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return loginTime;
    }
  }
}

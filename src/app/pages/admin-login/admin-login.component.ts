import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardAccessService } from '../../shared/services/dashboard-access.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>تسجيل الدخول للوحة التحكم</h1>
          <p>أدخل بيانات الاعتماد للوصول إلى لوحة إدارة المدونة</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="username">اسم المستخدم</label>
            <input 
              type="text" 
              id="username" 
              formControlName="username"
              placeholder="أدخل اسم المستخدم"
              [class.invalid]="isFieldInvalid('username')"
              autocomplete="username"
            >
            <div class="error-message" *ngIf="isFieldInvalid('username')">
              {{ getErrorMessage('username') }}
            </div>
          </div>

          <div class="form-group">
            <label for="password">كلمة المرور</label>
            <div class="password-input">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="password" 
                formControlName="password"
                placeholder="أدخل كلمة المرور"
                [class.invalid]="isFieldInvalid('password')"
                autocomplete="current-password"
              >
              <button 
                type="button" 
                class="password-toggle"
                (click)="togglePassword()"
                [attr.aria-label]="showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
              >
                <i class="fas" [class]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
            <div class="error-message" *ngIf="isFieldInvalid('password')">
              {{ getErrorMessage('password') }}
            </div>
          </div>

          <div class="form-group">
            <button 
              type="submit" 
              class="btn-login" 
              [disabled]="isSubmitting"
            >
              <i class="fas fa-sign-in-alt" *ngIf="!isSubmitting"></i>
              <i class="fas fa-spinner fa-spin" *ngIf="isSubmitting"></i>
              {{ isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول' }}
            </button>
          </div>
        </form>

        <div class="login-info">
          <div class="info-card">
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
            <small class="note">يمكن تغيير هذه البيانات في الكود</small>
          </div>
        </div>

        <!-- Error Messages -->
        <div class="message-container" *ngIf="message">
          <div class="message" [class]="'message-' + messageType">
            <i class="fas" [class]="messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dashboardAccess: DashboardAccessService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.dashboardAccess.hasAccess()) {
      this.router.navigate(['/dashboard/blog']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.message = '';
      
      const { username, password } = this.loginForm.value;
      
      // Simulate API call delay
      setTimeout(() => {
        if (this.dashboardAccess.login(username, password)) {
          this.message = 'تم تسجيل الدخول بنجاح! جاري التوجيه...';
          this.messageType = 'success';
          
          // Redirect to dashboard after 1 second
          setTimeout(() => {
            this.router.navigate(['/dashboard/blog']);
          }, 1000);
        } else {
          this.message = 'اسم المستخدم أو كلمة المرور غير صحيحة';
          this.messageType = 'error';
          this.isSubmitting = false;
          
          // Clear message after 3 seconds
          setTimeout(() => {
            this.message = '';
          }, 3000);
        }
      }, 1000);
    } else {
      this.markFormGroupTouched();
      this.message = 'يرجى ملء جميع الحقول المطلوبة';
      this.messageType = 'error';
      
      // Clear message after 3 seconds
      setTimeout(() => {
        this.message = '';
      }, 3000);
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `يجب أن يكون الطول على الأقل ${requiredLength} حروف`;
      }
    }
    return '';
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control?.invalid && control.touched);
  }
}

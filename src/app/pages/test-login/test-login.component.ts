import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-test-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatProgressSpinnerModule
  ],
  template: `
    <div class="test-login-container">
      <mat-card class="test-login-card">
        <mat-card-header>
          <mat-card-title>اختبار تسجيل الدخول</mat-card-title>
          <mat-card-subtitle>لاختبار مشكلة auth/invalid-credential</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="testLogin()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>البريد الإلكتروني</mat-label>
              <input matInput 
                     formControlName="email" 
                     placeholder="admin@royalnano.com"
                     type="email">
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                البريد الإلكتروني مطلوب
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                بريد إلكتروني غير صحيح
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>كلمة المرور</mat-label>
              <input matInput 
                     formControlName="password" 
                     placeholder="Admin123!"
                     type="password">
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                كلمة المرور مطلوبة
              </mat-error>
            </mat-form-field>

            <div class="test-credentials">
              <h4>بيانات الاختبار:</h4>
              <div class="credential-item">
                <strong>مدير:</strong> admin&#64;royalnano.com / Admin123!
              </div>
              <div class="credential-item">
                <strong>مستخدم 1:</strong> user1&#64;royalnano.com / User123!
              </div>
              <div class="credential-item">
                <strong>مستخدم 2:</strong> user2&#64;royalnano.com / User123!
              </div>
              <div class="credential-item">
                <strong>مستخدم تجريبي:</strong> testuser&#64;royalnano.com / TestUser123!
              </div>
            </div>

            <div class="result" *ngIf="result">
              <h4>النتيجة:</h4>
              <div class="result-content" [class.success]="result.success" [class.error]="!result.success">
                <strong>{{ result.success ? 'نجح تسجيل الدخول!' : 'فشل تسجيل الدخول' }}</strong>
                <div *ngIf="result.message">{{ result.message }}</div>
                <div *ngIf="result.user" class="user-info">
                  <p><strong>الاسم:</strong> {{ result.user.name }}</p>
                  <p><strong>الدور:</strong> {{ result.user.role }}</p>
                  <p><strong>UID:</strong> {{ result.user.uid }}</p>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button mat-raised-button 
                      color="primary" 
                      type="submit" 
                      [disabled]="loginForm.invalid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                اختبار تسجيل الدخول
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .test-login-card {
      max-width: 500px;
      width: 100%;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .test-credentials {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin: 20px 0;
      
      h4 {
        margin-top: 0;
        color: #1976d2;
      }
      
      .credential-item {
        margin-bottom: 8px;
        padding: 8px;
        background-color: white;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.9em;
      }
    }

    .result {
      margin: 20px 0;
      
      h4 {
        color: #333;
        margin-bottom: 12px;
      }
      
      .result-content {
        padding: 16px;
        border-radius: 8px;
        
        &.success {
          background-color: #e8f5e8;
          border-left: 4px solid #4caf50;
          color: #2e7d32;
        }
        
        &.error {
          background-color: #ffebee;
          border-left: 4px solid #f44336;
          color: #c62828;
        }
        
        .user-info {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(0,0,0,0.1);
          
          p {
            margin: 4px 0;
            font-size: 0.9em;
          }
        }
      }
    }

    .form-actions {
      text-align: center;
      margin-top: 24px;
      
      button {
        min-width: 200px;
      }
    }
  `]
})
export class TestLoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  result: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async testLogin() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.result = null;

    try {
      const { email, password } = this.loginForm.value;
      console.log('🧪 Testing login with:', email);

      const user = await this.authService.login(email, password);
      
      this.result = {
        success: true,
        message: 'تم تسجيل الدخول بنجاح!',
        user: user
      };

      console.log('✅ Login successful:', user);

    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      this.result = {
        success: false,
        message: `خطأ: ${error.code || error.message || 'خطأ غير معروف'}`
      };
    } finally {
      this.isLoading = false;
    }
  }
}

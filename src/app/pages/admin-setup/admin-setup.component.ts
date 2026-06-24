import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-admin-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-setup.component.html',
  styleUrls: ['./admin-setup.component.scss']
})
export class AdminSetupComponent implements OnInit {
  setupForm: FormGroup;
  loading = false;
  setupComplete = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.setupForm = this.fb.group({
      email: ['admin@royalnano.com', [Validators.required, Validators.email]],
      password: ['Admin123!', [Validators.required, Validators.minLength(6)]],
      name: ['مدير النظام', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    // Check if admin user already exists
    this.checkAdminExists();
  }

  private async checkAdminExists(): Promise<void> {
    try {
      const adminUser = await this.authService.getUserByEmail('admin@royalnano.com');
      if (adminUser && adminUser.role === 'admin') {
        this.setupComplete = true;
        this.showSuccess('المدير موجود بالفعل. يمكنك تسجيل الدخول الآن.');
      }
    } catch (error) {
      console.log('Admin user not found, setup required');
    }
  }

  async setupAdmin(): Promise<void> {
    if (this.setupForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const { email, password, name } = this.setupForm.value;

    try {
      await this.authService.createUser(
        email,
        password,
        name,
        'admin',
        {
          royal_nano: {
            access: true,
            overview: true,
            messages: true,
            services: true,
            gallery: true,
            blog: true,
            reviews: true,
            manage_users: true,
            analytics: true,
            landing_pages: true
          },
          royal_shield: {
            access: true,
            serials: true,
            requests: true,
            activated_warrantys: true
          }
        }
      );

      this.setupComplete = true;
      this.showSuccess('تم إنشاء حساب المدير بنجاح! يمكنك الآن تسجيل الدخول.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/admin']);
      }, 2000);

    } catch (error: any) {
      console.error('Setup error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        this.showError('البريد الإلكتروني مستخدم بالفعل');
      } else {
        this.showError('خطأ في إنشاء حساب المدير: ' + error.message);
      }
    } finally {
      this.loading = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/admin']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.setupForm.controls).forEach(key => {
      const control = this.setupForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'إغلاق', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'إغلاق', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}

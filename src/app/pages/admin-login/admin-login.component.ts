import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminApiService } from '../../shared/services/admin-api.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  successMessage: string = '';

  constructor(
    private router: Router,
    private adminApiService: AdminApiService
  ) {}

  onSubmit(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'يرجى إدخال اسم المستخدم وكلمة المرور';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('🔄 Attempting admin login...');

    this.adminApiService
      .login(this.username, this.password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Login successful:', response);
          this.successMessage = 'تم تسجيل الدخول بنجاح!';
          this.isLoading = false;

          // Navigate to admin dashboard after short delay
          setTimeout(() => {
            this.router.navigate(['/admin/dashboard']);
          }, 1000);
        },
        error: (error) => {
          console.error('❌ Login failed:', error);
          this.errorMessage =
            error.error?.message ||
            'خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى.';
          this.isLoading = false;
        },
      });
  }

  // Hide password in console/logs
  getPasswordDisplay(): string {
    return '••••••';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

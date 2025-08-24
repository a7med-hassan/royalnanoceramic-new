import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService } from '../../shared/services/translation.service';
import { ApiService, JoinFormData } from '../../shared/services/api.service';

@Component({
  selector: 'app-join-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './join-us.component.html',
  styleUrls: ['./join-us.component.scss'],
})
export class JoinUsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentLang = 'ar';
  isRtl = true;

  // Reactive Form
  joinForm: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  submitSuccess = false;

  constructor(
    public translationService: TranslationService,
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.joinForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^(\+20|0)?1[0125][0-9]{8}$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      position: ['', Validators.required],
      experience: ['', [Validators.required, Validators.minLength(10)]],
      message: ['', [Validators.required, Validators.minLength(20)]],
      cvFile: [null],
    });
  }

  ngOnInit(): void {
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Handle file selection
  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.joinForm.patchValue({ cvFile: file });
      console.log('📎 CV file selected:', file.name);
    }
  }

  // Submit form
  onSubmit(): void {
    console.log('🔄 Join form submission started');

    if (this.joinForm.valid && !this.isSubmitting) {
      console.log('✅ Form is valid, proceeding with submission');
      this.isSubmitting = true;
      this.submitMessage = '';
      this.submitSuccess = false;

      const formData: JoinFormData = this.joinForm.value;

      this.apiService
        .submitJoinForm(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ API response received:', response);
            this.submitSuccess = true;
            this.submitMessage =
              'تم إرسال طلب الانضمام بنجاح! سنتواصل معك قريباً.';
            this.resetForm();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('❌ API error:', error);
            this.submitSuccess = false;
            this.submitMessage =
              'حدث خطأ في إرسال طلب الانضمام. يرجى المحاولة مرة أخرى.';
            this.isSubmitting = false;
          },
        });
    } else {
      console.log('❌ Form validation failed or already submitting');
      this.markFormGroupTouched();
    }
  }

  // Reset form
  private resetForm(): void {
    this.joinForm.reset();
    // Reset file input
    const fileInput = document.getElementById('cvFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Mark all form controls as touched
  private markFormGroupTouched(): void {
    Object.keys(this.joinForm.controls).forEach((key) => {
      const control = this.joinForm.get(key);
      control?.markAsTouched();
    });
  }

  // Get error message for a field
  getErrorMessage(controlName: string): string {
    const control = this.joinForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (control.errors['minlength']) {
        return `يجب أن يكون الطول على الأقل ${control.errors['minlength'].requiredLength} أحرف`;
      }
      if (control.errors['email']) {
        return 'صيغة البريد الإلكتروني غير صحيحة';
      }
      if (control.errors['pattern']) {
        return 'صيغة رقم الهاتف غير صحيحة';
      }
    }
    return '';
  }

  // Check if a field is invalid
  isFieldInvalid(controlName: string): boolean {
    const control = this.joinForm.get(controlName);
    return !!(control?.invalid && control?.touched);
  }

  // Get form data for API
  private getFormData(): JoinFormData {
    return this.joinForm.value;
  }
}

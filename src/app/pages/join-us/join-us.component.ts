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

  // Handle file selection with validation
  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        console.error('❌ Invalid file type:', file.type);
        this.submitMessage =
          'نوع الملف غير مسموح به. يرجى رفع ملف PDF أو Word فقط.';
        this.submitSuccess = false;
        // Reset file input
        event.target.value = '';
        return;
      }

      if (file.size > maxSize) {
        console.error('❌ File too large:', file.size, 'bytes');
        this.submitMessage = 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت.';
        this.submitSuccess = false;
        // Reset file input
        event.target.value = '';
        return;
      }

      // File is valid
      this.joinForm.patchValue({ cvFile: file });
      console.log(
        '📎 CV file selected:',
        file.name,
        'Size:',
        file.size,
        'Type:',
        file.type
      );

      // Clear any previous error messages
      this.submitMessage = '';
      this.submitSuccess = false;
    }
  }

  // Remove selected file
  removeFile(): void {
    this.joinForm.patchValue({ cvFile: null });
    const fileInput = document.getElementById('cvFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    console.log('🗑️ CV file removed');
  }

  // Submit form
  onSubmit(): void {
    console.log('🔄 Join form submission started');

    if (this.joinForm.valid && !this.isSubmitting) {
      console.log('✅ Form is valid, proceeding with submission');
      this.isSubmitting = true;
      this.submitMessage = '';
      this.submitSuccess = false;

      const formData: JoinFormData = {
        ...this.joinForm.value,
        jobPosition: this.joinForm.value.position, // Map position to jobPosition for backend
      };

      console.log('📤 Form data with jobPosition:', formData);

      // Check if CV file is required and exists
      if (!formData.cvFile) {
        this.submitMessage = 'يرجى رفع ملف السيرة الذاتية (CV)';
        this.submitSuccess = false;
        this.isSubmitting = false;
        return;
      }

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

            // Auto-hide success message after 5 seconds
            setTimeout(() => {
              this.submitSuccess = false;
              this.submitMessage = '';
            }, 5000);
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
  resetForm(): void {
    this.joinForm.reset();
    // Reset file input
    const fileInput = document.getElementById('cvFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    // Clear messages
    this.submitMessage = '';
    this.submitSuccess = false;
    console.log('🔄 Form reset successfully');
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

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
      jobPosition: ['', Validators.required], // Changed from 'position' to match API
      experience: ['', [Validators.required, Validators.minLength(10)]],
      additionalMessage: ['', [Validators.required, Validators.minLength(20)]], // Changed from 'message' to match API
      // CV fields commented out since CV upload is disabled
      // cvFile: [null],
      // cvFileName: [''], // Added for uploaded file name
      // cvPath: [''], // Added for uploaded file path
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

  // CV Upload Methods - Hidden/Commented Out
  /*
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    const maxSize = 4 * 1024 * 1024; // 4MB

    if (!allowedTypes.includes(file.type)) {
      alert("❌ نوع الملف غير صحيح. يُسمح فقط بملفات PDF أو DOC أو DOCX.");
      this.submitMessage = 'نوع الملف غير مسموح. يُسمح فقط بملفات PDF أو DOC أو DOCX.';
      this.submitSuccess = false;
      return;
    }

    if (file.size > maxSize) {
      alert("❌ حجم الملف كبير جداً. الحد الأقصى 4 ميجابايت.");
      this.submitMessage = 'حجم الملف كبير جداً. الحد الأقصى 4 ميجابايت.';
      this.submitSuccess = false;
      return;
    }

    this.submitMessage = 'جاري رفع ملف السيرة الذاتية...';
    this.submitSuccess = false;

    this.apiService.uploadCVFile(file).subscribe({
      next: (res: any) => {
        console.log('✅ Uploaded CV:', res.fileUrl);
        
        this.joinForm.patchValue({ 
          cvFile: file,
          cvFileName: res.fileName || file.name,
          cvPath: res.fileUrl
        });
        
        this.submitMessage = 'تم رفع ملف السيرة الذاتية بنجاح!';
        this.submitSuccess = true;
        
        setTimeout(() => {
          this.submitMessage = '';
          this.submitSuccess = false;
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Upload failed:', err);
        const errorMessage = err?.error?.message || err.message || 'حدث خطأ غير متوقع';
        alert("فشل في رفع الملف: " + errorMessage);
        this.submitMessage = 'فشل في رفع ملف السيرة الذاتية. يرجى المحاولة مرة أخرى.';
        this.submitSuccess = false;
      }
    });
  }
  */

  // Legacy file selection method - Hidden/Commented Out
  /*
  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      const maxSize = 4 * 1024 * 1024; // 4MB

      if (!allowedTypes.includes(file.type)) {
        console.error('❌ Invalid file type:', file.type);
        alert("❌ نوع الملف غير صحيح. يُسمح فقط بملفات PDF أو DOC أو DOCX.");
        this.submitMessage = 'نوع الملف غير مسموح. يُسمح فقط بملفات PDF أو DOC أو DOCX.';
        this.submitSuccess = false;
        event.target.value = '';
        return;
      }

      if (file.size > maxSize) {
        console.error('❌ File too large:', file.size, 'bytes');
        alert("❌ حجم الملف كبير جداً. الحد الأقصى 4 ميجابايت.");
        this.submitMessage = 'حجم الملف كبير جداً. الحد الأقصى 4 ميجابايت.';
        this.submitSuccess = false;
        event.target.value = '';
        return;
      }

      this.uploadCVFile(file);
    }
  }
  */

  // CV Upload Methods - Hidden/Commented Out
  /*
  private uploadCVFile(file: File): void {
    console.log('📤 Starting CV file upload...');
    this.submitMessage = 'جاري رفع ملف السيرة الذاتية...';
    this.submitSuccess = false;

    this.apiService.uploadCVFile(file).subscribe({
      next: (response) => {
        console.log('✅ CV file uploaded successfully:', response);
        console.log('✅ Uploaded CV:', response.fileUrl);
        
        this.joinForm.patchValue({ 
          cvFile: file,
          cvFileName: response.fileName || file.name,
          cvPath: response.fileUrl
        });
        
        this.submitMessage = 'تم رفع ملف السيرة الذاتية بنجاح!';
        this.submitSuccess = true;
        
        setTimeout(() => {
          this.submitMessage = '';
          this.submitSuccess = false;
        }, 3000);
      },
      error: (error) => {
        console.error('❌ CV file upload failed:', error);
        const errorMessage = error?.error?.message || error.message || 'حدث خطأ غير متوقع';
        alert("فشل في رفع الملف: " + errorMessage);
        this.submitMessage = 'فشل في رفع ملف السيرة الذاتية. يرجى المحاولة مرة أخرى.';
        this.submitSuccess = false;
        
        const fileInput = document.getElementById('cvFile') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
    });
  }

  removeFile(): void {
    this.joinForm.patchValue({ 
      cvFile: null,
      cvFileName: '',
      cvPath: ''
    });
    const fileInput = document.getElementById('cvFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    console.log('🗑️ CV file removed');
  }
  */

  // Submit form
  onSubmit(): void {
    console.log('🔄 Join form submission started');

    if (this.joinForm.valid && !this.isSubmitting) {
      console.log('✅ Form is valid, proceeding with submission');
      this.isSubmitting = true;
      this.submitMessage = '';
      this.submitSuccess = false;

      // Prepare form data without CV file (CV upload is disabled)
      const formData: JoinFormData = {
        fullName: this.joinForm.value.fullName,
        phoneNumber: this.joinForm.value.phoneNumber,
        email: this.joinForm.value.email,
        jobPosition: this.joinForm.value.jobPosition,
        experience: this.joinForm.value.experience,
        additionalMessage: this.joinForm.value.additionalMessage,
        cvFileName: '', // Empty since CV upload is disabled
        cvPath: '' // Empty since CV upload is disabled
      };

      console.log('📤 Form data with CV info:', formData);

      this.apiService
        .submitJoinForm(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
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

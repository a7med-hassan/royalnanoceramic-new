import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService } from '../../shared/services/translation.service';
import { ApiService } from '../../shared/services/api.service';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ContactFormComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentLang = 'ar';
  isRtl = true;

  // Simple form data without forms modules
  formData = {
    fullName: '',
    phoneNumber: '',
    carType: '',
    carModel: '',
    additionalNotes: '', // Changed from 'notes' to match API
  };

  isSubmitting = false;
  submitMessage = '';
  submitSuccess = false;

  constructor(
    public translationService: TranslationService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    console.log('🚀 ContactComponent initialized');
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;
    console.log('🔧 Current language:', this.currentLang);
    console.log('🔧 Is RTL:', this.isRtl);
    console.log('🔧 Form data initialized:', this.formData);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Simple input handling without ngModel
  onInputChange(field: string, value: string): void {
    console.log('📝 Input change:', field, '=', value);
    this.formData[field as keyof typeof this.formData] = value;
    console.log('📝 Updated formData:', this.formData);
  }

  onSubmit(): void {
    console.log('🚀 onSubmit() method called!');
    console.log('🔄 Form submission started');
    console.log('📝 Form data:', this.formData);
    console.log('🔧 Form validation result:', this.isFormValid());
    console.log('🔧 Is submitting:', this.isSubmitting);
    console.log('🔧 ApiService instance:', this.apiService);

    if (this.isFormValid() && !this.isSubmitting) {
      console.log('✅ Form is valid, proceeding with submission');
      this.isSubmitting = true;
      this.submitMessage = '';
      this.submitSuccess = false;

      console.log('📤 About to call ApiService.submitContactForm');

      this.apiService
        .submitContactForm(this.formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ API response received:', response);
            this.submitSuccess = true;
            this.submitMessage = 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.';
            this.resetForm();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('❌ API error:', error);
            this.submitSuccess = false;
            this.submitMessage =
              'حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.';
            this.isSubmitting = false;
            console.error('Contact form submission error:', error);
          },
        });
    } else {
      console.log('❌ Form validation failed or already submitting');
      console.log('Form valid:', this.isFormValid());
      console.log('Is submitting:', this.isSubmitting);
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.formData.fullName &&
      this.formData.phoneNumber &&
      this.formData.carType &&
      this.formData.carModel
    );
  }

  private resetForm(): void {
    this.formData = {
      fullName: '',
      phoneNumber: '',
      carType: '',
      carModel: '',
      additionalNotes: '',
    };
  }
}

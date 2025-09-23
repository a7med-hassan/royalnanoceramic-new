import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService, ContactFormData } from '../../shared/services/api.service';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public translationService: TranslationService,
    private route: ActivatedRoute
  ) {
    this.contactForm = this.fb.group({
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(
            /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z\s]+$/
          ),
        ],
      ],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^(\+20|0)?1[0125][0-9]{8}$/)],
      ],
      carType: ['', [Validators.required]],
      carModel: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
        ],
      ],
      additionalNotes: ['', [Validators.maxLength(500)]],
      // 🟢 UTM fields for tracking
      utm_source: [''],
      utm_medium: [''],
      utm_campaign: [''],
    });
  }

  ngOnInit(): void {
    // Log form initialization
    console.log('🚀 ContactFormComponent initialized');
    console.log('📝 Form controls:', this.contactForm.controls);

    // قراءة الـ UTM Parameters من URL
    this.route.queryParamMap.subscribe(params => {
      console.log('🔍 UTM Parameters found:', {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign')
      });

      const utmSource = params.get('utm_source') || '';
      const utmMedium = params.get('utm_medium') || '';
      const utmCampaign = params.get('utm_campaign') || '';

      this.contactForm.patchValue({
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign
      });

      console.log('✅ UTM Parameters added to form:', {
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign
      });
      console.log('✅ Complete form data after UTM update:', this.contactForm.value);
    });
  }

  onSubmit(): void {
    console.log('🔄 Contact form submission started');
    console.log('📝 Form data:', this.contactForm.value);
    console.log('🔍 UTM Data being sent:', {
      utm_source: this.contactForm.get('utm_source')?.value,
      utm_medium: this.contactForm.get('utm_medium')?.value,
      utm_campaign: this.contactForm.get('utm_campaign')?.value
    });
    console.log('✅ Form valid:', this.contactForm.valid);
    console.log('❌ Form errors:', this.contactForm.errors);

    if (this.contactForm.valid) {
      console.log('✅ Form is valid, proceeding with submission');
      this.isSubmitting = true;
      this.submitError = '';
      this.submitSuccess = false;

      const formData: ContactFormData = this.contactForm.value;
      console.log('📤 Submitting data to API:', formData);
      console.log('🔍 UTM Data in formData:', {
        utm_source: formData.utm_source,
        utm_medium: formData.utm_medium,
        utm_campaign: formData.utm_campaign
      });

      this.apiService.submitContactForm(formData).subscribe({
        next: (response) => {
          console.log('✅ API response received:', response);
          this.isSubmitting = false;
          this.submitSuccess = true;
          this.contactForm.reset();
          this.showSuccessMessage();
        },
        error: (error) => {
          console.error('❌ API error:', error);
          this.isSubmitting = false;
          this.submitError = this.getApiErrorMessage(error);
          this.showErrorMessage();
        },
      });
    } else {
      console.log('❌ Form validation failed');
      this.markFormGroupTouched();
      this.showValidationErrors();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach((key) => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return this.translationService.getTranslation('common.field_required');
      }
      if (control.errors['minlength']) {
        return this.translationService
          .getTranslation('common.min_length_error')
          .replace('{0}', control.errors['minlength'].requiredLength);
      }
      if (control.errors['maxlength']) {
        return this.translationService
          .getTranslation('common.max_length_error')
          .replace('{0}', control.errors['maxlength'].requiredLength);
      }
      if (control.errors['pattern']) {
        if (controlName === 'fullName') {
          return this.translationService.getTranslation(
            'common.name_format_error'
          );
        }
        if (controlName === 'phoneNumber') {
          return this.translationService.getTranslation(
            'common.phone_format_error'
          );
        }
        return this.translationService.getTranslation('common.invalid_format');
      }
    }
    return '';
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(control?.invalid && control?.touched);
  }

  isFieldRequired(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!control?.hasValidator(Validators.required);
  }

  getFieldValue(controlName: string): string {
    const control = this.contactForm.get(controlName);
    return control?.value || '';
  }

  getFieldControl(controlName: string): AbstractControl | null {
    return this.contactForm.get(controlName);
  }

  private getApiErrorMessage(error: any): string {
    if (error.error && typeof error.error === 'string') {
      return error.error;
    }
    if (error.message) {
      return error.message;
    }
    if (error.status === 0) {
      return this.translationService.getTranslation(
        'common.server_connection_error'
      );
    }
    if (error.status === 400) {
      return this.translationService.getTranslation('common.invalid_form_data');
    }
    if (error.status === 500) {
      return this.translationService.getTranslation('common.server_error');
    }
    return this.translationService.getTranslation('common.general_error');
  }

  private showSuccessMessage(): void {
    console.log('✅ Showing success message');
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      this.submitSuccess = false;
    }, 5000);
  }

  private showErrorMessage(): void {
    console.log('❌ Showing error message:', this.submitError);
    // Auto-hide error message after 8 seconds
    setTimeout(() => {
      this.submitError = '';
    }, 8000);
  }

  private showValidationErrors(): void {
    console.log('⚠️ Showing validation errors');
    // Log all form errors for debugging
    Object.keys(this.contactForm.controls).forEach((key) => {
      const control = this.contactForm.get(key);
      if (control?.errors) {
        console.log(`❌ ${key} errors:`, control.errors);
      }
    });
  }

  // Method to check if form has any errors
  hasFormErrors(): boolean {
    return this.contactForm.invalid && this.contactForm.touched;
  }

  // Method to get total error count
  getTotalErrorCount(): number {
    let errorCount = 0;
    Object.keys(this.contactForm.controls).forEach((key) => {
      const control = this.contactForm.get(key);
      if (control?.invalid && control?.touched) {
        errorCount++;
      }
    });
    return errorCount;
  }

  // Method to get form controls count
  getFormControlsCount(): number {
    return Object.keys(this.contactForm.controls).length;
  }

  // Method to reset form and clear messages
  resetForm(): void {
    this.contactForm.reset();
    this.submitSuccess = false;
    this.submitError = '';
    console.log('🔄 Form reset successfully');
  }
}

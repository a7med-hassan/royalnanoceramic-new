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
import { HttpClient } from '@angular/common/http';
import { ApiService, ContactFormData } from '../../shared/services/api.service';
import { TranslationService } from '../../shared/services/translation.service';
import { CarBrandsService } from '../../shared/services/car-brands.service';
import { CarModelsService } from '../../shared/services/car-models.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

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

  // Autocomplete properties
  brandResults: string[] = [];
  brandSearch$ = new Subject<string>();
  modelResults: string[] = [];
  modelSearch$ = new Subject<string>();
  
  // Dropdown visibility
  showBrandDropdown = false;
  showModelDropdown = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,
    public translationService: TranslationService,
    private route: ActivatedRoute,
    private carBrandsService: CarBrandsService,
    private carModelsService: CarModelsService
  ) {
    this.contactForm = this.fb.group({
      full_name: [
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
      mobile: [
        '',
        [Validators.required, Validators.pattern(/^(\+20|0)?1[0125][0-9]{8}$/)],
      ],
      client_16492512972331: ['', [Validators.required]], // ماركة العربية
      client_16849336084508: ['', [Validators.required]], // الموديل
      client_17293620987926: ['', [Validators.required]], // نوع الخدمة
      client_16492513797105: ['', [Validators.maxLength(500)]], // الملاحظات
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

    // 🔹 بحث الماركات
    this.brandSearch$
      .pipe(
        debounceTime(200),
        switchMap((query) => this.carBrandsService.searchBrands(query))
      )
      .subscribe((results) => this.brandResults = results);

    // 🔹 بحث الموديلات حسب الماركة
    this.modelSearch$
      .pipe(
        debounceTime(200),
        switchMap((query) =>
          this.carModelsService.searchModels(
            this.contactForm.value.client_16492512972331,
            query
          )
        )
      )
      .subscribe((results) => this.modelResults = results);
  }

  // Autocomplete methods
  onBrandInput(event: any) {
    const value = event.target.value;
    this.brandSearch$.next(value);
    this.modelResults = []; // امسح الموديلات القديمة لما يغير الماركة
  }

  selectBrand(brand: string) {
    this.contactForm.patchValue({ client_16492512972331: brand });
    this.brandResults = [];
    this.showBrandDropdown = false;
    // Clear model when brand changes
    this.contactForm.patchValue({ client_16849336084508: '' });
    this.modelResults = [];
  }

  onModelInput(event: any) {
    const value = event.target.value;
    this.modelSearch$.next(value);
  }

  selectModel(model: string) {
    this.contactForm.patchValue({ client_16849336084508: model });
    this.modelResults = [];
    this.showModelDropdown = false;
  }

  // Dropdown methods
  toggleBrandDropdown() {
    this.showBrandDropdown = !this.showBrandDropdown;
    if (this.showBrandDropdown) {
      // Load all brands when dropdown opens
      this.brandSearch$.next('');
    }
  }

  toggleModelDropdown() {
    this.showModelDropdown = !this.showModelDropdown;
    if (this.showModelDropdown) {
      // Load models for selected brand when dropdown opens
      const selectedBrand = this.contactForm.value.client_16492512972331;
      if (selectedBrand) {
        this.modelSearch$.next('');
      }
    }
  }

  hideBrandDropdown() {
    setTimeout(() => {
      this.showBrandDropdown = false;
    }, 200);
  }

  hideModelDropdown() {
    setTimeout(() => {
      this.showModelDropdown = false;
    }, 200);
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitError = '';
      this.submitSuccess = false;

      const formData: ContactFormData = this.contactForm.value;

      // Send to backend API
      this.http.post('https://royal-nano-backend.vercel.app/api/contact', {
        full_name: this.contactForm.value.full_name,
        mobile: this.contactForm.value.mobile,
        client_16492512972331: this.contactForm.value.client_16492512972331,
        client_16849336084508: this.contactForm.value.client_16849336084508,
        client_16492513797105: this.contactForm.value.client_16492513797105,
        client_17293620987926: this.contactForm.value.client_17293620987926,
        utm_source: this.contactForm.value.utm_source,
        utm_medium: this.contactForm.value.utm_medium,
        utm_campaign: this.contactForm.value.utm_campaign
      }).subscribe({
        next: (response) => {
          console.log('✅ Backend response received:', response);
          this.isSubmitting = false;
          this.submitSuccess = true;
          this.contactForm.reset();
          this.showSuccessMessage();
        },
        error: (error) => {
          console.error('❌ Backend error:', error);
          this.isSubmitting = false;
          this.submitError = 'حدث خطأ في إرسال البيانات. يرجى المحاولة مرة أخرى.';
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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap } from 'rxjs/operators';
import { ApiService, ContactFormData } from '../../shared/services/api.service';
import { CarBrandsService } from '../../shared/services/car-brands.service';
import { CarModelsService } from '../../shared/services/car-models.service';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-discount',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss']
})
export class DiscountComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Form
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  
  // Autocomplete properties
  brandResults: string[] = [];
  brandSearch$ = new Subject<string>();
  modelResults: string[] = [];
  modelSearch$ = new Subject<string>();
  
  // Dropdown visibility
  showBrandDropdown = false;
  showModelDropdown = false;
  
  // Countdown Timer
  timeLeft = {
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  private countdownInterval: any;
  
  // UTM Parameters
  utmSource = '';
  utmMedium = '';
  utmCampaign = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private carBrandsService: CarBrandsService,
    private carModelsService: CarModelsService,
    public translationService: TranslationService
  ) {
    this.contactForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      mobile: ['', [Validators.required, Validators.pattern(/^(\+20|0)?1[0125][0-9]{8}$/)]],
      client_16492512972331: ['', Validators.required], // ماركة العربية
      client_16849336084508: ['', Validators.required], // الموديل
      client_17293620987926: ['', Validators.required], // نوع الخدمة
      client_16492513797105: [''], // الملاحظات
      // UTM fields
      utm_source: [''],
      utm_medium: [''],
      utm_campaign: ['']
    });
  }

  ngOnInit(): void {
    // Capture UTM parameters
    this.route.queryParamMap.subscribe(params => {
      this.utmSource = params.get('utm_source') || '';
      this.utmMedium = params.get('utm_medium') || '';
      this.utmCampaign = params.get('utm_campaign') || '';

      this.contactForm.patchValue({
        utm_source: this.utmSource,
        utm_medium: this.utmMedium,
        utm_campaign: this.utmCampaign
      });

      console.log('🎯 Landing Page UTM Parameters:', {
        utm_source: this.utmSource,
        utm_medium: this.utmMedium,
        utm_campaign: this.utmCampaign
      });
    });

    // Start countdown timer (24 hours)
    this.startCountdown();

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startCountdown(): void {
    // Set countdown to 24 hours from now
    const endTime = new Date().getTime() + (24 * 60 * 60 * 1000);
    
    this.countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(this.countdownInterval);
        this.timeLeft = { hours: 0, minutes: 0, seconds: 0 };
        return;
      }

      this.timeLeft = {
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      };
    }, 1000);
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submitError = '';
      this.submitSuccess = false;

      const formData: ContactFormData = this.contactForm.value;
      console.log('🎯 Landing Page Form Data:', formData);

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
      })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ Backend response received:', response);
            this.isSubmitting = false;
            this.submitSuccess = true;
            this.contactForm.reset();
            
            // Reset UTM parameters after successful submission
            this.contactForm.patchValue({
              utm_source: this.utmSource,
              utm_medium: this.utmMedium,
              utm_campaign: this.utmCampaign
            });
          },
          error: (error) => {
            console.error('❌ Backend error:', error);
            this.isSubmitting = false;
            this.submitError = 'حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.';
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(control?.invalid && control?.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (control.errors['minlength']) {
        return 'يجب أن يكون الاسم أكثر من حرفين';
      }
      if (control.errors['pattern']) {
        return 'رقم الهاتف غير صحيح';
      }
    }
    return '';
  }

  scrollToForm(): void {
    const formElement = document.getElementById('order-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
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
}

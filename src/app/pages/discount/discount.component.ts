import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService, ContactFormData } from '../../shared/services/api.service';

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
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(\+20|0)?1[0125][0-9]{8}$/)]],
      carType: ['', Validators.required],
      carModel: ['', Validators.required],
      additionalNotes: [''],
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

      this.apiService.submitContactForm(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('✅ Landing Page Form Submitted Successfully:', response);
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
            console.error('❌ Landing Page Form Error:', error);
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
}

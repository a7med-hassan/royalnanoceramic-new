import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, map } from 'rxjs/operators';
import { LandingPageService, LandingPage } from '../../shared/services/landing-page.service';
import { ContactFormService, ContactFormData } from '../../shared/services/contact-form.service';
import { ApiService, ContactFormData as ApiContactFormData } from '../../shared/services/api.service';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { AnalyticsService } from '../../shared/services/analytics.service';
import { ReviewsService, Review } from '../../shared/services/reviews.service';
import { PerformanceService } from '../../shared/services/performance.service';
import { LazyLoadingService } from '../../shared/services/lazy-loading.service';
import Swiper from 'swiper';
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { WhiteFridayWheelComponent } from '../../components/white-friday-wheel/white-friday-wheel.component';

interface ReviewItem {
  id: number | string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  gender: 'male' | 'female';
}

@Component({
  selector: 'app-dynamic-landing-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SafeUrlPipe, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './dynamic-landing-page.component.html',
  styleUrls: ['./dynamic-landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Ø­Ø±ÙƒØ© Ø§Ù„Ø±Ù‚Ù… Ø¹Ù†Ø¯ Ø§Ù„ØªØºÙŠÙŠØ±
    trigger('countChange', [
      transition('* => *', [
        style({ transform: 'scale(1.3)', color: '#ff5252' }),
        animate('0.4s ease', style({ transform: 'scale(1)', color: '#ffd600' }))
      ])
    ]),
    // Ù†Ø¨Ø¶ Ù„Ø¨Ø§Ù‚ÙŠ Ø§Ù„Ø¹Ø¯Ø¯
    trigger('pulse', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :increment, :decrement', [
        style({ transform: 'scale(1.1)', opacity: 0.5 }),
        animate('0.5s ease', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    // ÙˆÙ…ÙŠØ¶ Ø§Ù„Ø£ÙŠÙ‚ÙˆÙ†Ø© - ÙŠØ¹Ù…Ù„ Ø¹Ù†Ø¯ ØªØºÙŠÙŠØ± reserved
    trigger('flash', [
      state('*', style({ transform: 'scale(1)', opacity: 1 })),
      transition('* => *', [
        animate('0.3s ease', style({ transform: 'scale(1.2)', opacity: 0.7 })),
        animate('0.3s ease', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class DynamicLandingPageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('reviewsSwiperRef') reviewsSwiperRef!: ElementRef;
  
  pageData: LandingPage | null = null;
  loading = true;
  error = false;
  timeLeft: any = {};
  contactForm: FormGroup;
  
  // Booking information - Counter values for animations
  reserved = 12;
  total = 20;
  counterInterval: any;
  
  get remainingSlots(): number {
    // Always calculate from current reserved and total values
    return Math.max(0, this.totalSlots - this.bookedSlots);
  }
  
  get bookedSlots(): number {
    // Always use reserved which gets updated dynamically by the counter
    // It's initialized from pageData.booking.booked_slots in startCounter()
    return this.reserved;
  }
  
  get totalSlots(): number {
    // Always use total which is set from pageData.booking.total_slots
    // It's initialized in startCounter()
    return this.total;
  }
  
  get bookingProgress(): number {
    const booked = this.bookedSlots;
    const total = this.totalSlots;
    if (total === 0) return 0;
    return Math.round((booked / total) * 100);
  }
  
  get bookingMessage(): string {
    if (!this.pageData?.booking) return 'ØªÙ… Ø­Ø¬Ø² 12/20 â€“ Ø¨Ø§Ù‚ÙŠ 8 ÙÙ‚Ø·';
    return this.pageData.booking.booking_message || `ØªÙ… Ø­Ø¬Ø² ${this.bookedSlots}/${this.totalSlots} â€“ Ø¨Ø§Ù‚ÙŠ ${this.remainingSlots} ÙÙ‚Ø·`;
  }
  formSubmitted = false;
  formSuccess = false;
  formError = false;
  
  // Reviews properties
  reviewsLoading = false;
  reviewsError = '';
  reviewsFromApi: Review[] = [];
  displayedReviews: ReviewItem[] = [];
  private reviewsSwiper?: Swiper;
  
  // Fallback reviews in case Firebase is not working
  fallbackReviews: ReviewItem[] = [
    {
      id: 1,
      name: 'Ø£Ø­Ù…Ø¯ Ù…Ø­Ù…Ø¯',
      text: 'Ø®Ø¯Ù…Ø© Ù…Ù…ØªØ§Ø²Ø© ÙˆÙ…Ù‡Ù†ÙŠØ© Ø¹Ø§Ù„ÙŠØ©. Ø§Ù„Ø³ÙŠØ±Ø§Ù…ÙŠÙƒ ÙØ¹Ù„Ø§Ù‹ Ø¨ÙŠØ­Ù…ÙŠ Ø§Ù„Ø³ÙŠØ§Ø±Ø© Ù…Ù† Ø§Ù„Ø®Ø¯ÙˆØ´ ÙˆØ§Ù„Ø·Ù‚Ø³. Ø£Ù†ØµØ­ Ø¨Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹Ù‡Ù….',
      rating: 5,
      avatar: 'assets/reviews/man-optimized.webp',
      gender: 'male'
    },
    {
      id: 2,
      name: 'ÙØ§Ø·Ù…Ø© Ø¹Ù„ÙŠ',
      text: 'Ø§Ù„ÙØ±ÙŠÙ‚ Ù…Ø­ØªØ±Ù Ø¬Ø¯Ø§Ù‹ ÙˆØ§Ù„Ù†ØªÙŠØ¬Ø© ØªÙÙˆÙ‚ Ø§Ù„ØªÙˆÙ‚Ø¹Ø§Øª. Ø§Ù„Ø³ÙŠØ§Ø±Ø© Ø¨Ù‚ÙŠØª Ù„Ø§Ù…Ø¹Ø© Ù„Ù…Ø¯Ø© Ø·ÙˆÙŠÙ„Ø©. Ø´ÙƒØ±Ø§Ù‹ Ù„ÙƒÙ….',
      rating: 5,
      avatar: 'assets/reviews/woman-optimized.webp',
      gender: 'female'
    },
    {
      id: 3,
      name: 'Ù…Ø­Ù…ÙˆØ¯ Ø­Ø³Ù†',
      text: 'Ø¬ÙˆØ¯Ø© Ø¹Ø§Ù„ÙŠØ© ÙˆØ£Ø³Ø¹Ø§Ø± Ù…Ù†Ø§Ø³Ø¨Ø©. Ø§Ù„Ø³ÙŠØ§Ø±Ø© Ø¨Ù‚ÙŠØª Ù„Ø§Ù…Ø¹Ø© Ù„Ù…Ø¯Ø© Ø·ÙˆÙŠÙ„Ø©. Ø§Ù„Ø®Ø¯Ù…Ø© Ø³Ø±ÙŠØ¹Ø© ÙˆÙ…Ø¶Ù…ÙˆÙ†Ø©.',
      rating: 4,
      avatar: 'assets/reviews/man-optimized.webp',
      gender: 'male'
    },
    {
      id: 4,
      name: 'Ø³Ø§Ø±Ø© Ø£Ø­Ù…Ø¯',
      text: 'Ø£ÙØ¶Ù„ Ø®Ø¯Ù…Ø© Ø­Ù…Ø§ÙŠØ© Ù„Ù„Ø³ÙŠØ§Ø±Ø§Øª ÙÙŠ Ù…ØµØ±. Ø§Ù„ÙØ±ÙŠÙ‚ Ù…ØªØ®ØµØµ ÙˆØ§Ù„Ù…ÙˆØ§Ø¯ Ø¹Ø§Ù„ÙŠØ© Ø§Ù„Ø¬ÙˆØ¯Ø©. Ø£Ù†ØµØ­ Ø§Ù„Ø¬Ù…ÙŠØ¹.',
      rating: 5,
      avatar: 'assets/reviews/woman-optimized.webp',
      gender: 'female'
    },
    {
      id: 5,
      name: 'Ø¹Ù„ÙŠ Ù…Ø­Ù…ÙˆØ¯',
      text: 'Ø®Ø¯Ù…Ø© Ø±Ø§Ø¦Ø¹Ø© ÙˆØ³Ø¹Ø± Ù…Ù†Ø§Ø³Ø¨. Ø§Ù„Ø³ÙŠØ§Ø±Ø© Ø¨Ù‚ÙŠØª Ø¬Ø¯ÙŠØ¯Ø© Ù„Ù…Ø¯Ø© Ø³Ù†Ø© ÙƒØ§Ù…Ù„Ø©. Ø´ÙƒØ±Ø§Ù‹ Ù„Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ù…ØªÙ…ÙŠØ².',
      rating: 5,
      avatar: 'assets/reviews/man-optimized.webp',
      gender: 'male'
    },
    {
      id: 6,
      name: 'Ù†ÙˆØ±Ø§ Ø³Ø¹Ø¯',
      text: 'ØªØ¬Ø±Ø¨Ø© Ù…Ù…ØªØ§Ø²Ø© Ù…Ø¹ Ø§Ù„ÙØ±ÙŠÙ‚. Ø§Ù„Ø®Ø¯Ù…Ø© Ø³Ø±ÙŠØ¹Ø© ÙˆØ§Ù„Ù†ØªÙŠØ¬Ø© Ù…Ø°Ù‡Ù„Ø©. Ø§Ù„Ø³ÙŠØ§Ø±Ø© Ø¨Ù‚ÙŠØª Ù„Ø§Ù…Ø¹Ø© Ø¬Ø¯Ø§Ù‹.',
      rating: 4,
      avatar: 'assets/reviews/woman-optimized.webp',
      gender: 'female'
    }
  ];
  
  // Navigation and UI properties
  isScrolled = false;
  isMenuOpen = false;
  currentLang = 'ar';
  isDarkMode = false;
  
  // Performance optimization properties
  private pageDataSubject = new BehaviorSubject<LandingPage | null>(null);
  pageData$ = this.pageDataSubject.asObservable();
  private formValidationSubject = new BehaviorSubject<boolean>(false);
  formValidation$ = this.formValidationSubject.asObservable();
  
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private landingPageService: LandingPageService,
    private contactFormService: ContactFormService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private analyticsService: AnalyticsService,
    private reviewsService: ReviewsService,
    private performanceService: PerformanceService,
    private lazyLoadingService: LazyLoadingService,
    private cdr: ChangeDetectorRef
  ) {
    this.contactForm = this.createContactForm();
  }

  ngOnInit(): void {
    const initStartTime = this.performanceService.startTiming('component-init');
    
    // Preload critical resources
    this.preloadCriticalResources();
    
    const slug = this.route.snapshot.paramMap.get('pageSlug');
    if (slug) {
      this.loadLandingPageOptimized(slug);
    } else {
      this.error = true;
      this.loading = false;
      this.cdr.markForCheck();
    }
    
    // Add scroll listener with debouncing
    this.addScrollListenerOptimized();
    
    // Setup form validation with debouncing
    this.setupFormValidationOptimized();
    
    // Setup lazy loading for images
    this.setupLazyLoading();
    
    // Load reviews
    this.loadReviews();
    
    // Note: Counter will be started after pageData is loaded in loadLandingPageOptimized
    
    // Preload non-critical resources when browser is idle
    this.preloadNonCriticalResources();
    
    this.performanceService.endTiming('component-init', initStartTime);
  }

  ngAfterViewInit(): void {
    this.setupReviewsSwiper();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    // Clear countdown interval to prevent memory leaks
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    // Clear promo counter interval
    if (this.counterInterval) {
      clearInterval(this.counterInterval);
      this.counterInterval = null;
    }
  }
  
  // Start promo counter - updates reserved slots every 8 seconds
  startCounter(): void {
    // Clear existing interval if any
    if (this.counterInterval) {
      clearInterval(this.counterInterval);
      this.counterInterval = null;
    }
    
    // Initialize values from pageData if available, otherwise use defaults
    if (this.pageData?.booking) {
      this.reserved = this.pageData.booking.booked_slots ?? 12;
      this.total = this.pageData.booking.total_slots ?? 20;
    } else {
      // Use default values if no booking data
      this.reserved = 12;
      this.total = 20;
    }
    
    // Only start counter if we should show booking count
    // If show_booking_count is not set, assume true for demo purposes
    const shouldShow = this.pageData?.booking?.show_booking_count ?? true;
    if (!shouldShow) {
      return;
    }
    
    // Don't start if already at max
    if (this.reserved >= this.total) {
      return;
    }
    
    // Start counter that updates every 8-12 seconds
    this.counterInterval = setInterval(() => {
      // Re-check if we should continue (in case data changed)
      const shouldContinue = this.pageData?.booking?.show_booking_count ?? true;
      if (!shouldContinue) {
        if (this.counterInterval) {
          clearInterval(this.counterInterval);
          this.counterInterval = null;
        }
        return;
      }
      
      const maxIncrement = Math.min(2, this.total - this.reserved); // Max 2 at a time
      if (maxIncrement > 0) {
        const rand = Math.floor(Math.random() * maxIncrement) + 1; // 1 or 2
        if (this.reserved + rand <= this.total) {
          this.reserved += rand;
          this.cdr.markForCheck(); // Trigger change detection for animations
          
          // Stop if reached max
          if (this.reserved >= this.total && this.counterInterval) {
            clearInterval(this.counterInterval);
            this.counterInterval = null;
          }
        }
      }
    }, 8000 + Math.random() * 4000); // Random interval between 8-12 seconds
  }

  private loadLandingPage(slug: string): void {
    this.subscription.add(
      this.landingPageService.getLandingPage(slug).subscribe({
        next: (data) => {
          if (data) {
            this.pageData = data;
            this.startCountdown();
            this.loading = false;
          } else {
            // Page not found, redirect to home
            this.router.navigate(['/home']);
          }
        },
        error: (err) => {
          console.error('Error loading landing page:', err);
          // Error loading page, redirect to home
          this.router.navigate(['/home']);
        }
      })
    );
  }

  private countdownInterval: any = null;

  private startCountdown(): void {
    if (!this.pageData?.expires_at) return;

    // Clear any existing interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expireTime = new Date(this.pageData!.expires_at!).getTime();
      const timeDiff = expireTime - now;

      if (timeDiff > 0) {
        this.timeLeft = {
          days: Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((timeDiff % (1000 * 60)) / 1000)
        };
      } else {
        this.timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        // Clear interval when countdown reaches zero
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
      }
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  }

  openWhatsApp(): void {
    if (this.pageData?.whatsapp_number) {
      const message = `Ù…Ø±Ø­Ø¨Ø§Ù‹ØŒ Ø£Ø±ÙŠØ¯ Ø§Ù„Ø§Ø³ØªÙØ³Ø§Ø± Ø¹Ù† ${this.pageData.title}`;
      const whatsappUrl = `https://wa.me/${this.pageData.whatsapp_number}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  scrollToContact(): void {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  // Contact Form Methods
  private createContactForm(): FormGroup {
    // Create form with all fields but without validators initially
    // Validators will be added dynamically based on enabled fields
    return this.fb.group({
      full_name: [''],
      mobile: [''],
      client_17293620987926: [''], // Service Type
      client_16945026668577: [''], // Car Type
      client_16945026691088: [''], // Car Model
      client_16492513797105: [''] // Notes
    });
  }

  // Update form validators based on enabled fields
  private updateFormValidators(): void {
    if (!this.pageData?.contact_form?.enabled || !this.contactForm) {
      return;
    }

    const fields = this.pageData.contact_form.fields || {};

    // Update full_name validators
    const fullNameControl = this.contactForm.get('full_name');
    if (fullNameControl) {
      if (fields.full_name) {
        fullNameControl.setValidators([Validators.required, Validators.minLength(2)]);
      } else {
        fullNameControl.clearValidators();
        fullNameControl.setValue(''); // Clear value if disabled
      }
      fullNameControl.updateValueAndValidity({ emitEvent: false });
    }

    // Update mobile validators
    const mobileControl = this.contactForm.get('mobile');
    if (mobileControl) {
      if (fields.mobile) {
        mobileControl.setValidators([Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]);
      } else {
        mobileControl.clearValidators();
        mobileControl.setValue(''); // Clear value if disabled
      }
      mobileControl.updateValueAndValidity({ emitEvent: false });
    }

    // Update service_type validators
    const serviceTypeControl = this.contactForm.get('client_17293620987926');
    if (serviceTypeControl) {
      if (fields.service_type) {
        serviceTypeControl.setValidators([Validators.required]);
      } else {
        serviceTypeControl.clearValidators();
        serviceTypeControl.setValue(''); // Clear value if disabled
      }
      serviceTypeControl.updateValueAndValidity({ emitEvent: false });
    }

    // Update car_type (optional field, no validators needed)
    const carTypeControl = this.contactForm.get('client_16945026668577');
    if (carTypeControl && !fields.car_type) {
      carTypeControl.setValue(''); // Clear value if disabled
    }

    // Update car_model (optional field, no validators needed)
    const carModelControl = this.contactForm.get('client_16945026691088');
    if (carModelControl && !fields.car_model) {
      carModelControl.setValue(''); // Clear value if disabled
    }

    // Update notes (optional field, no validators needed)
    const notesControl = this.contactForm.get('client_16492513797105');
    if (notesControl && !fields.notes) {
      notesControl.setValue(''); // Clear value if disabled
    }
  }

  onSubmitContactForm(): void {
    if (!this.pageData?.contact_form?.enabled) {
      return;
    }

    // Only validate enabled fields
    const fields = this.pageData.contact_form.fields || {};
    let isValid = true;

    // Check each enabled field
    if (fields.full_name && this.contactForm.get('full_name')?.invalid) {
      isValid = false;
    }
    if (fields.mobile && this.contactForm.get('mobile')?.invalid) {
      isValid = false;
    }
    if (fields.service_type && this.contactForm.get('client_17293620987926')?.invalid) {
      isValid = false;
    }

    if (isValid && this.pageData) {
      const formStartTime = this.performanceService.startTiming('form-submission');
      
      this.formSubmitted = true;
      this.formError = false;
      this.formSuccess = false;
      
      // Lazy load analytics when user submits form
      this.lazyLoadingService.loadAnalytics().catch(error => {
        console.warn('Failed to load analytics:', error);
      });
      
              // Track form submission start
        this.analyticsService.logCustomEvent('form_submission_start', {
          form_type: 'contact_form',
          page_slug: this.pageData.slug
        });

        // Only include enabled fields in form data
        const formValue = this.contactForm.value;
        const formData: Partial<ApiContactFormData> = {
          landing_page_slug: this.pageData.slug,
          landing_page_title: this.pageData.title
        };

        // Only add enabled fields (required fields are already validated above)
        if (fields.full_name) {
          formData.full_name = formValue.full_name || '';
        }
        if (fields.mobile) {
          formData.mobile = formValue.mobile || '';
        }
        if (fields.service_type) {
          formData.client_17293620987926 = formValue.client_17293620987926 || '';
        }
        if (fields.car_type) {
          formData.client_16945026668577 = formValue.client_16945026668577 || '';
        }
        if (fields.car_model) {
          formData.client_16945026691088 = formValue.client_16945026691088 || '';
        }
        if (fields.notes) {
          formData.notes = formValue.notes || '';
          formData.client_16492513797105 = formValue.client_16492513797105 || formValue.notes || '';
        }

        // âœ… Ø¥Ø¶Ø§ÙØ© form_source Ù„Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ø¹ slug Ù…Ø­Ø¯Ø¯
        const slug = this.pageData?.slug || '';
        formData.form_source = slug ? `dynamic_landing:/${slug}` : 'dynamic_landing';

        // Also save to Firestore for backup
        // âœ… Build firestore data with proper defaults to avoid undefined values
        const firestoreData: Partial<ContactFormData> = {
          landing_page_slug: this.pageData.slug,
          landing_page_title: this.pageData.title,
          full_name: formData.full_name || '',
          mobile: formData.mobile || '',
          client_17293620987926: formData.client_17293620987926 || ''
        };

        // âœ… Only add optional fields if they exist in formData
        if (formData.client_16945026668577 !== undefined) {
          firestoreData.client_16945026668577 = formData.client_16945026668577 || '';
        }
        if (formData.client_16945026691088 !== undefined) {
          firestoreData.client_16945026691088 = formData.client_16945026691088 || '';
        }
        if (formData.client_16492513797105 !== undefined) {
          firestoreData.client_16492513797105 = formData.client_16492513797105 || '';
        }

        // Submit to API (primary method)
        console.log('ðŸ“¤ Sending Form Data:', formData);
        this.subscription.add(
          this.apiService.submitContactForm(formData).subscribe({
            next: async (response: any) => {
              console.log('âœ… Backend response received:', response);

              // âœ… Ø­Ø§Ù„Ø© Ø§Ù„Ù†Ø¬Ø§Ø­ Ø§Ù„Ø¹Ø§Ù…Ø©
              if (response.success) {
                console.log('âœ… Form saved in Dashboard (MongoDB)');
              }

              // âœ… 8xCRM Response (Ù…Ù† Ø§Ù„Ø¨Ø§Ùƒ Ø¥Ù†Ø¯)
              if (response.eightxResponse) {
                console.log('âœ… 8xCRM success:', response.eightxResponse);
              } else if (response.eightxError) {
                console.warn('âš ï¸ 8xCRM failed:', response.eightxError);
              } else {
                console.log('âš ï¸ 8xCRM skipped or no data from backend.');
              }

              // âœ… Ø¥Ø±Ø³Ø§Ù„ Ù…Ù†ÙØµÙ„ Ù„Ù„Ù€ 8xCRM API
              this.apiService.submit8xLead({
                full_name: formData.full_name || '',
                mobile: formData.mobile || '',
                notes: formData.notes || formData.client_16492513797105 || ''
              }).subscribe({
                next: (res) => {
                  console.log('âœ… 8xCRM Response:', res);
                },
                error: (err) => {
                  console.error('âŒ 8xCRM Error:', err);
                }
              });
              
              // âœ… ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ù†Ø¬Ø§Ø­ ÙÙŠ Ø§Ù„Ù†Ù‡Ø§ÙŠØ©
              this.formSuccess = true;
              this.formSubmitted = false;

              // ðŸ§  Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ù„Ù„Ù…Ø·ÙˆØ± ÙÙŠ Ø§Ù„ÙƒÙˆÙ†Ø³ÙˆÙ„
              console.group('ðŸ“‹ Form Submission Details');
              console.log('ðŸ§¾ Full Name:', formData.full_name);
              console.log('ðŸ“± Mobile:', formData.mobile);
              console.log('ðŸ“ Notes:', formData.notes || formData.client_16492513797105);
              console.log('ðŸš˜ Car Type:', formData.client_16945026668577 || formData.client_16492512972331);
              console.log('ðŸ§© Model:', formData.client_16945026691088 || formData.client_16849336084508);
              console.log('ðŸ’¼ Service:', formData.client_17293620987926);
              console.log('ðŸ”— UTM Source:', formData.utm_source);
              console.log('ðŸ“£ UTM Campaign:', formData.utm_campaign);
              console.log('ðŸ“„ Landing Page:', this.pageData?.slug);
              console.groupEnd();

              // Also save to Firestore as backup (fire and forget)
              this.contactFormService.submitContactForm(firestoreData).subscribe({
                next: (id) => console.log('Backup saved to Firestore:', id),
                error: (err) => console.warn('Firestore backup failed:', err)
              });
              
              // Track successful submission performance
              const submissionTime = this.performanceService.endTiming('form-submission', formStartTime);
              this.analyticsService.logCustomEvent('form_submission_success', {
                form_type: 'contact_form',
                submission_time: submissionTime,
                page_slug: this.pageData?.slug
              });
              
              // âœ… Ø³Ø¬Ù„ Ø§Ù„ØªØ­ÙˆÙŠÙ„Ø§Øª ÙÙŠ Analytics
              await this.analyticsService.logFormSubmit('landing_page', {
                name: formData.full_name,
                phone: formData.mobile,
                notes: formData.notes || formData.client_16492513797105,
                serviceType: formData.client_17293620987926,
                carType: formData.client_16945026668577 || formData.client_16492512972331,
                carModel: formData.client_16945026691088 || formData.client_16849336084508,
                landingPageSlug: this.pageData?.slug,
                landingPageTitle: this.pageData?.title
              });
              
              await this.analyticsService.logConversion('landing_page_form_submit', 1, {
                formType: 'landing_page',
                page: `/${this.pageData?.slug}`,
                landingPageTitle: this.pageData?.title
              });
              
              // Redirect to thank you page with customer name
              this.router.navigate(['/thank-you'], {
                queryParams: {
                  name: formData.full_name,
                  type: 'landing_page'
                }
              });
              
              this.cdr.markForCheck();
            },
          error: (err) => {
            console.error('Error submitting contact form:', err);
            this.formError = true;
            this.formSubmitted = false;
            
            // Track failed submission performance
            this.analyticsService.logCustomEvent('form_submission_error', {
              form_type: 'contact_form',
              submission_time: 0,
              error_message: err.message || 'Unknown error',
              page_slug: this.pageData?.slug
            });
            
            this.cdr.markForCheck();
          }
        })
      );
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

  // Styling Methods
  getCustomStyles(): string {
    if (!this.pageData?.styling) return '';

    const styling = this.pageData.styling;
    return `
      .modern-landing {
        --primary-color: ${styling.primary_color || '#667eea'} !important;
        --secondary-color: ${styling.secondary_color || '#764ba2'} !important;
        --accent-color: ${styling.accent_color || '#c5a059'} !important;
        --background-gradient: ${styling.background_gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'} !important;
        --font-family: ${styling.font_family || 'Cairo, sans-serif'} !important;
        --button-style: ${styling.button_style || 'rounded'};
        --layout-style: ${styling.layout_style || 'modern'};
      }
      
      .modern-landing .hero-section {
        background: var(--background-gradient) !important;
      }
      
      .modern-landing .btn-primary {
        background: linear-gradient(45deg, var(--primary-color), ${this.lightenColor(styling.primary_color || '#667eea', 20)}) !important;
        border: none !important;
      }
      
      .modern-landing .btn-primary:hover {
        background: linear-gradient(45deg, ${this.lightenColor(styling.primary_color || '#667eea', -15)}, var(--primary-color)) !important;
        transform: translateY(-3px) !important;
      }
      
      .modern-landing .discount-price {
        color: var(--accent-color) !important;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
      }
      
      .modern-landing .discount-badge {
        background: linear-gradient(45deg, #ff6b6b, #ff8e8e) !important;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4) !important;
      }
      
      .modern-landing .feature-icon {
        background: linear-gradient(45deg, var(--primary-color), var(--secondary-color)) !important;
      }
      
      .modern-landing .contact-icon {
        background: rgba(255,255,255,0.2) !important;
      }
      
      .modern-landing .timer-number {
        color: var(--accent-color) !important;
      }
      
      .modern-landing .form-control:focus {
        border-color: var(--primary-color) !important;
        box-shadow: 0 0 0 3px ${this.hexToRgba(styling.primary_color || '#667eea', 0.1)} !important;
      }
      
      .modern-landing .section-title::after {
        background: linear-gradient(45deg, var(--primary-color), var(--secondary-color)) !important;
      }
      
      .modern-landing .image-badge {
        background: linear-gradient(45deg, #4ecdc4, #44a08d) !important;
      }
    `;
  }

  // Performance optimization methods
  private preloadCriticalResources(): void {
    // Preload critical CSS and fonts
    if (typeof window !== 'undefined') {
      // Preload critical fonts
      const fontPreload = document.createElement('link');
      fontPreload.rel = 'preload';
      fontPreload.href = '/assets/fonts/cairo-arabic-400-normal.woff2';
      fontPreload.as = 'font';
      fontPreload.type = 'font/woff2';
      fontPreload.crossOrigin = 'anonymous';
      document.head.appendChild(fontPreload);
      
      // Preload critical images
      if (this.pageData?.image) {
        const imgPreload = document.createElement('link');
        imgPreload.rel = 'preload';
        imgPreload.href = this.pageData.image;
        imgPreload.as = 'image';
        document.head.appendChild(imgPreload);
      }
    }
  }

  private loadLandingPageOptimized(slug: string): void {
    this.loading = true;
    this.cdr.markForCheck();
    
    // Use requestIdleCallback for non-critical operations
    const loadData = () => {
      this.subscription.add(
        this.landingPageService.getLandingPage(slug).subscribe({
                      next: (data: LandingPage | undefined) => {
              if (data) {
                this.pageData = data;
                this.pageDataSubject.next(data);
                this.loading = false;
                this.error = false;
                
                // Initialize counter values from pageData
                if (data.booking) {
                  this.reserved = data.booking.booked_slots || 12;
                  this.total = data.booking.total_slots || 20;
                }
                
                // Update form validators based on enabled fields
                this.updateFormValidators();
                
                // Preload critical images
                this.preloadCriticalImages();
                
                // Start countdown if needed
                if (data.expires_at) {
                  this.startCountdown();
                }
                
                // Restart counter with updated values
                this.startCounter();
              } else {
                            // Create default landing page data for demo purposes
                this.pageData = this.createDefaultLandingPageData(slug);
                this.pageDataSubject.next(this.pageData);
                this.loading = false;
                this.error = false;
                
                // Initialize counter values
                if (this.pageData.booking) {
                  this.reserved = this.pageData.booking.booked_slots || 12;
                  this.total = this.pageData.booking.total_slots || 20;
                }
                
                // Update form validators based on enabled fields
                this.updateFormValidators();
                
                // Start countdown for demo
                this.startCountdown();
                
                // Start counter
                this.startCounter();
            }
            
            
            this.cdr.markForCheck();
          },
          error: (error: any) => {
            console.error('Error loading landing page:', error);
                          // Create default landing page data even on error
              this.pageData = this.createDefaultLandingPageData(slug);
              this.pageDataSubject.next(this.pageData);
              this.loading = false;
              this.error = false;
              
              // Initialize counter values
              if (this.pageData.booking) {
                this.reserved = this.pageData.booking.booked_slots || 12;
                this.total = this.pageData.booking.total_slots || 20;
              }
              
              // Update form validators based on enabled fields
              this.updateFormValidators();
              
              // Start countdown for demo
              this.startCountdown();
              
              // Start counter
              this.startCounter();
            
            this.cdr.markForCheck();
          }
        })
      );
    };

    // Use requestIdleCallback if available, otherwise use setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadData, { timeout: 100 });
    } else {
      setTimeout(loadData, 0);
    }
  }

  private addScrollListenerOptimized(): void {
    if (typeof window === 'undefined') return;
    
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.isScrolled = window.scrollY > 50;
          this.cdr.markForCheck();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    this.subscription.add(() => {
      window.removeEventListener('scroll', scrollHandler);
    });
  }

  private setupFormValidationOptimized(): void {
    // Debounced form validation
    this.subscription.add(
      this.contactForm.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        map(() => this.contactForm.valid)
      ).subscribe(isValid => {
        this.formValidationSubject.next(isValid);
        this.cdr.markForCheck();
      })
    );
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  getButtonClass(): string {
    if (!this.pageData?.styling?.button_style) return 'btn';
    
    const style = this.pageData.styling.button_style;
    switch (style) {
      case 'pill': return 'btn btn-pill';
      case 'square': return 'btn btn-square';
      default: return 'btn btn-rounded';
    }
  }

  getLayoutClass(): string {
    if (!this.pageData?.styling?.layout_style) return 'layout-modern';
    
    const style = this.pageData.styling.layout_style;
    return `layout-${style}`;
  }

  // Navigation and UI methods
  addScrollListener(): void {
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 50;
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  toggleLanguage(): void {
    this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  // Reviews methods
  loadReviews(): void {
    this.reviewsLoading = true;
    this.reviewsError = '';
    
    this.reviewsService.getApprovedReviewsSimple().subscribe({
      next: (reviews) => {
        console.log('Reviews loaded:', reviews);
        this.reviewsFromApi = reviews || [];
        this.displayedReviews = this.reviewsFromApi.map((rv): ReviewItem => ({
          id: rv.id,
          name: rv.name,
          avatar: '',
          rating: rv.rating ?? 5,
          text: rv.text,
          gender: this.determineGender(rv.name),
        }));
        
        console.log('Displayed reviews:', this.displayedReviews);
        this.reviewsLoading = false;
        this.cdr.markForCheck();
        
        // Refresh swiper after DOM updates
        setTimeout(() => this.setupReviewsSwiper(), 100);
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        console.log('Using fallback reviews');
        // Use fallback reviews if Firebase fails
        this.displayedReviews = [...this.fallbackReviews];
        this.reviewsError = '';
        this.reviewsLoading = false;
        this.cdr.markForCheck();
        
        // Refresh swiper after DOM updates
        setTimeout(() => this.setupReviewsSwiper(), 100);
      }
    });
  }

  private determineGender(name: string): 'male' | 'female' {
    const femaleNames = ['Ø³Ø§Ø±Ø©', 'Ù…Ø±ÙŠÙ…', 'Ù„ÙŠÙ„Ù‰', 'ÙØ§Ø·Ù…Ø©', 'Ù†ÙˆØ±', 'Ù‡Ø¨Ø©', 'Sara', 'Mariam', 'Laila', 'Fatima', 'Nour', 'Heba'];
    const lowerName = name.toLowerCase();
    
    for (const femaleName of femaleNames) {
      if (lowerName.includes(femaleName.toLowerCase())) {
        return 'female';
      }
    }
    
    return 'male';
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < rating ? 1 : 0));
  }

  getAvatar(review: ReviewItem): string {
    const basePath = 'assets/reviews';
    return review.gender === 'female'
      ? `${basePath}/woman.png`
      : `${basePath}/man.png`;
  }

  private setupReviewsSwiper(): void {
    // Lazy load Swiper modules when needed
    this.lazyLoadingService.loadSwiperModules().then(() => {
      this.initializeSwiper();
    }).catch(error => {
      console.warn('Failed to load Swiper modules:', error);
      // Fallback: try to initialize without modules
      this.initializeSwiper();
    });
  }

  private initializeSwiper(): void {
    try {
      const container: HTMLElement | undefined = this.reviewsSwiperRef?.nativeElement;
      if (!container) return;

      // Destroy existing swiper if it exists
      if (this.reviewsSwiper) {
        this.reviewsSwiper.destroy(true, true);
      }

      // Get modules from lazy loading service or use defaults
      const modules = (window as any).SwiperModules || { Autoplay, Pagination, EffectCoverflow };

      this.reviewsSwiper = new Swiper(container as any, {
        modules: [modules.Autoplay, modules.Pagination, modules.EffectCoverflow],
        slidesPerView: 1,
        spaceBetween: 16,
        loop: this.displayedReviews.length > 1,
        autoplay: this.displayedReviews.length > 1 ? { delay: 3000, disableOnInteraction: false } : false,
        pagination: { el: '.reviews-pagination', clickable: true },
        effect: this.displayedReviews.length > 1 ? 'coverflow' : 'slide',
        coverflowEffect: {
          rotate: 10,
          stretch: 0,
          depth: 120,
          modifier: 2,
          slideShadows: false,
        },
        breakpoints: {
          576: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1200: { slidesPerView: 3 },
          1400: { slidesPerView: 4 },
        },
      });
    } catch (err) {
      console.error('Failed to initialize reviews swiper', err);
    }
  }

  private createDefaultLandingPageData(slug: string): LandingPage {
    // Create a default landing page with demo data
    const now = new Date();
    const expireDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    return {
      id: 'demo-' + slug,
      slug: slug,
      title: '',
      subtitle: 'Ø£ÙØ¶Ù„ Ø¹Ø±Ø¶ ÙÙŠ Ø§Ù„Ø¹Ø§Ù… - Ù„ÙØªØ±Ø© Ù…Ø­Ø¯ÙˆØ¯Ø© ÙÙ‚Ø·',
      description: 'Ø§Ø­ØµÙ„ Ø¹Ù„Ù‰ Ø­Ù…Ø§ÙŠØ© ÙƒØ§Ù…Ù„Ø© Ù„Ø³ÙŠØ§Ø±ØªÙƒ Ø¨Ø£ÙØ¶Ù„ Ø§Ù„Ø®Ø¯Ù…Ø§Øª. Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ù†Ø§Ù†Ùˆ Ø³ÙŠØ±Ø§Ù…ÙŠÙƒ ÙˆØ§Ù„Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø©.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      video_url: undefined,
      whatsapp_number: '201234567890',
      original_price: undefined,
      discount_price: undefined,
      discount_percent: undefined,
      expires_at: expireDate.toISOString(),
      active: true,
      show_pricing: false,
      show_cta_buttons: true,
      show_contact: true,
      show_image: true,
      show_features: true,
      features: [
        '10 Ø·Ø¨Ù‚Ø§Øª Ø­Ù…Ø§ÙŠØ© Ù…ØªÙ‚Ø¯Ù…Ø©',
        'Ù„Ù…Ø¹Ø§Ù† Ø«Ø§Ø¨Øª Ù„Ù…Ø¯Ø© 10 Ø³Ù†ÙˆØ§Øª',
        'Ø¶Ù…Ø§Ù† Ø´Ø§Ù…Ù„ Ù„Ù…Ø¯Ø© 12 Ø³Ù†ÙˆØ§Øª',
        'Ø®Ø§Ù…Ø© Ø£Ù…Ø±ÙŠÙƒÙŠØ© Ù…Ø¹ØªÙ…Ø¯Ø©',
        'Ø­Ù…Ø§ÙŠØ© Ù…Ù† Ø§Ù„Ø£Ø´Ø¹Ø© ÙÙˆÙ‚ Ø§Ù„Ø¨Ù†ÙØ³Ø¬ÙŠØ©',
        'Ù…Ù‚Ø§ÙˆÙ…Ø© Ù„Ù„Ø®Ø¯ÙˆØ´ ÙˆØ§Ù„ØªØ¢ÙƒÙ„'
      ],
      contact_form: {
        enabled: true,
        fields: {
          full_name: true,
          mobile: true,
          service_type: true,
          car_type: true,
          car_model: true,
          notes: true
        },
        submit_button_text: 'Ø§Ø­Ø¬Ø² Ø§Ù„Ø®ØµÙ… Ø§Ù„Ø¢Ù†',
        success_message: 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨Ùƒ Ø¨Ù†Ø¬Ø§Ø­! Ø³Ù†ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ Ø®Ù„Ø§Ù„ Ø¯Ù‚Ø§Ø¦Ù‚.'
      },
      styling: {
        primary_color: '#667eea',
        secondary_color: '#764ba2',
        accent_color: '#c5a059',
        background_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        font_family: 'Cairo, sans-serif',
        button_style: 'rounded',
        layout_style: 'modern'
      },
      booking: {
        total_slots: 20,
        booked_slots: 12,
        show_booking_count: true,
        booking_message: 'ØªÙ… Ø­Ø¬Ø² 12/20 â€“ Ø¨Ø§Ù‚ÙŠ 8 ÙÙ‚Ø·'
      },
      // Mobile Optimization Settings
      mobile_optimized: true,
      fullscreen_mobile: true,
      responsive_design: true,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
  }

  // Image handling methods
  onImageError(event: any): void {
    console.warn('Image failed to load:', event.target.src);
    event.target.classList.add('error');
    // You could set a fallback image here if needed
  }

  onImageLoad(event: any): void {
    console.log('Image loaded successfully:', event.target.src);
    event.target.classList.remove('error');
  }

  // Performance optimization: TrackBy functions for *ngFor loops
  trackByReviewId(index: number, review: ReviewItem): string | number {
    return review.id;
  }

  trackByFeatureId(index: number, feature: any): string | number {
    return feature.id || index;
  }

  trackByStarIndex(index: number, star: number): number {
    return index;
  }

  // Performance optimization: Lazy loading for images
  private setupLazyLoading(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset['src']) {
            img.src = img.dataset['src']!;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));

    // Cleanup
    this.subscription.add(() => {
      imageObserver.disconnect();
    });
  }

  // Performance optimization: Preload critical images
  private preloadCriticalImages(): void {
    if (typeof window === 'undefined' || !this.pageData?.image) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = this.pageData.image;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  // Performance optimization: Preload non-critical resources
  private preloadNonCriticalResources(): void {
    const nonCriticalResources = [
      'assets/fonts/cairo-arabic-600-normal.woff2',
      'assets/fonts/cairo-arabic-700-normal.woff2',
      'assets/images/optimized/slider/photo-1723242581089-48fc37043796-1920x1080-xl.webp',
      'https://bucolic-liger-463ea4.netlify.app/imgs/photo-1723242581089-48fc37043796-1920x1080.webp',
      'https://bucolic-liger-463ea4.netlify.app/imgs/2026-Ford-Mustang-GTD-Liquid-Carbon-002-2160.webp',
      'https://bucolic-liger-463ea4.netlify.app/imgs/theevan-rao-2F4XOL0E3oQ-unsplash.webp'
    ];

    this.lazyLoadingService.preloadWhenIdle(nonCriticalResources);
  }
}

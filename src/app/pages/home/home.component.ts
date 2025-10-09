// home.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeroSliderComponent } from '../../components/hero-slider/hero-slider.component';
import { BeforeAfterSliderComponent } from '../../components/before-after-slider/before-after-slider.component';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';

import { TranslationService } from '../../shared/services/translation.service';
import { ScrollToTopService } from '../../shared/services/scroll-to-top.service';
import { ReviewsService, Review } from '../../shared/services/reviews.service';
import { MatDialog } from '@angular/material/dialog';
import { ReviewDialogComponent, ReviewDialogData, ReviewDialogResult } from '../../components/review-dialog/review-dialog.component';
import Swiper from 'swiper';
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules';

interface Service {
  id: number;
  key: string;
  icon: string;
  image?: string; // Made optional since we're not displaying images
}

interface Feature {
  id: number;
  key: string;
  icon: string;
  color: string;
}

interface ReviewItem {
  id: number | string;
  name: string;
  avatar: string; // image path
  rating: number; // 1..5
  text: string;
  gender: 'male' | 'female';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    HeroSliderComponent,
    BeforeAfterSliderComponent,
    ContactFormComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  currentLang = 'ar';
  isRtl = true;

  // Single slider references
  @ViewChild('sliderContainer') sliderContainer!: ElementRef;
  @ViewChild('afterImg') afterImg!: ElementRef;
  @ViewChild('dragHandle') dragHandle!: ElementRef;
  @ViewChild('reviewsSwiperRef') reviewsSwiperRef!: ElementRef;

  // Slider data and state
  sliderData = [
    {
      title: 'تطبيق السيراميك',
      beforeImage: 'assets/images/before&after/B.webp',
      afterImage: 'assets/images/before&after/A.webp',
    },
    {
      title: 'حماية الطلاء',
      beforeImage: 'assets/images/before&after/B1.webp',
      afterImage: 'assets/images/before&after/A1.webp',
    },
    {
      title: 'النتيجة النهائية',
      beforeImage: 'assets/images/before&after/B5.webp',
      afterImage: 'assets/images/before&after/A5.webp',
    },
  ];

  currentSlideIndex = 0;
  private reviewsSwiper?: Swiper;

  // Reviews from backend
  reviewsLoading = false;
  reviewsError = '';
  reviewsPage = 1;
  reviewsLimit = 12;
  reviewsFromApi: Review[] = [];
  displayedReviews: ReviewItem[] = [];

  get currentSliderTitle(): string {
    return this.sliderData[this.currentSlideIndex]?.title || '';
  }

  get currentBeforeImage(): string {
    return this.sliderData[this.currentSlideIndex]?.beforeImage || '';
  }

  get currentAfterImage(): string {
    return this.sliderData[this.currentSlideIndex]?.afterImage || '';
  }

  services: Service[] = [
    {
      id: 1,
      key: 'ceramic_coating',
      icon: 'fas fa-shield-alt',
    },
    {
      id: 2,
      key: 'paint_protection',
      icon: 'fas fa-car',
    },
    {
      id: 3,
      key: 'interior_protection',
      icon: 'fas fa-couch',
    },
  ];

  features: Feature[] = [
    {
      id: 1,
      key: 'experience',
      icon: 'fas fa-star',
      color: '#FFD700',
    },
    {
      id: 2,
      key: 'quality',
      icon: 'fas fa-award',
      color: '#FF6B6B',
    },
    {
      id: 3,
      key: 'warranty',
      icon: 'fas fa-shield-alt',
      color: '#4ECDC4',
    },
    {
      id: 4,
      key: 'team',
      icon: 'fas fa-users',
      color: '#45B7D1',
    },
  ];

  // Fallback reviews (empty - will be populated from Firestore)
  reviews: ReviewItem[] = [
    {
      id: 1,
      name: 'أحمد محمد',
      text: 'خدمة ممتازة ومهنية عالية. السيراميك فعلاً بيحمي السيارة من الخدوش.',
      rating: 5,
      avatar: 'assets/reviews/man.png',
      gender: 'male'
    },
    {
      id: 2,
      name: 'فاطمة علي',
      text: 'الفريق محترف جداً والنتيجة تفوق التوقعات. أنصح بالتعامل معهم.',
      rating: 4,
      avatar: 'assets/reviews/woman.png',
      gender: 'female'
    },
    {
      id: 3,
      name: 'محمود حسن',
      text: 'جودة عالية وأسعار مناسبة. السيارة بقيت لامعة لمدة طويلة.',
      rating: 5,
      avatar: 'assets/reviews/man.png',
      gender: 'male'
    }
  ];

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
    try {
      const container: HTMLElement | undefined = this.reviewsSwiperRef?.nativeElement;
      if (!container) return;

      // Destroy existing swiper if it exists
      if (this.reviewsSwiper) {
        this.reviewsSwiper.destroy(true, true);
      }

      this.reviewsSwiper = new Swiper(container as any, {
        modules: [Autoplay, Pagination, EffectCoverflow],
        slidesPerView: 1,
        spaceBetween: 16,
        loop: this.displayedReviews.length > 1, // Only loop if more than 1 review
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

  constructor(
    private router: Router,
    public translationService: TranslationService,
    private scrollToTopService: ScrollToTopService,
    private reviewsService: ReviewsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;

    // Load reviews from Firestore immediately
    this.loadReviews();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Cleanup slider
    if (this.sliderContainer?.nativeElement?.cleanup) {
      this.sliderContainer.nativeElement.cleanup();
    }
  }

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
    this.setupSingleSlider();
    this.setupReviewsSwiper();
  }

  setupSingleSlider(): void {
    if (this.sliderContainer?.nativeElement && this.afterImg?.nativeElement && this.dragHandle?.nativeElement) {
      this.setupSlider(
        this.sliderContainer.nativeElement,
        this.afterImg.nativeElement,
        this.dragHandle.nativeElement
      );
    }
  }

  // Navigation methods
  nextSlide(): void {
    if (this.currentSlideIndex < this.sliderData.length - 1) {
      this.currentSlideIndex++;
      this.resetSlider();
    }
  }

  previousSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.resetSlider();
    }
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.sliderData.length) {
      this.currentSlideIndex = index;
      this.resetSlider();
    }
  }

  private resetSlider(): void {
    // Reset slider to center position
    if (this.afterImg?.nativeElement && this.dragHandle?.nativeElement) {
      const container = this.sliderContainer.nativeElement;
      const centerPosition = container.offsetWidth / 2;

      this.afterImg.nativeElement.style.width = centerPosition + 'px';
      this.dragHandle.nativeElement.style.left = centerPosition + 'px';
    }
  }

  private setupSlider(
    slider: HTMLElement,
    afterImg: HTMLElement,
    drag: HTMLElement
  ): void {
    let isDragging = false;

    const onMouseDown = () => {
      isDragging = true;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const rect = slider.getBoundingClientRect();
      let x = e.clientX - rect.left;

      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;

      afterImg.style.width = x + 'px';
      drag.style.left = x + 'px';
    };

    const onTouchStart = () => {
      isDragging = true;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const rect = slider.getBoundingClientRect();
      let x = e.touches[0].clientX - rect.left;

      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;

      afterImg.style.width = x + 'px';
      drag.style.left = x + 'px';
    };

    // Mouse events
    drag.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);

    // Touch events for mobile
    drag.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchmove', onTouchMove);

    // Cleanup function
    const cleanup = () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchmove', onTouchMove);
    };

    // Store cleanup function for later removal
    (slider as any).cleanup = cleanup;
  }

  updateLanguage(): void {
    // Get language from parent component
    const appComponent = document.querySelector('app-root') as any;
    if (appComponent && appComponent.currentLang) {
      this.currentLang = appComponent.currentLang;
      this.isRtl = appComponent.isRtl;
    }
  }

  setupScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]).then(() => {
      this.scrollToTopService.scrollToTop();
    });
  }

  // Reviews API integration
  loadReviews(page: number = this.reviewsPage): void {
    this.reviewsLoading = true;
    this.reviewsError = '';
    
    // Load reviews from Firestore
    this.reviewsService.getApprovedReviewsSimple().subscribe({
      next: (reviews) => {
        // Convert Firestore reviews to display format
        this.reviewsFromApi = reviews || [];
        this.displayedReviews = this.reviewsFromApi.map((rv): ReviewItem => ({
          id: rv.id,
          name: rv.name,
          avatar: '', // Will use default avatar
          rating: rv.rating ?? 5,
          text: rv.text,
          gender: this.determineGender(rv.name), // Determine gender from name
        }));
        
        // Update fallback reviews with current data
        this.reviews = [...this.displayedReviews];
        
        // Refresh swiper after DOM updates
        setTimeout(() => this.setupReviewsSwiper(), 0);
      },
      error: (error) => {
        this.reviewsError = this.isRtl ? 'تعذر تحميل المراجعات الآن' : 'Failed to load reviews';
        this.displayedReviews = [];
      },
      complete: () => {
        this.reviewsLoading = false;
      }
    });
  }

  // Helper method to determine gender from name
  private determineGender(name: string): 'male' | 'female' {
    const femaleNames = ['سارة', 'مريم', 'ليلى', 'فاطمة', 'نور', 'هبة', 'Sara', 'Mariam', 'Laila', 'Fatima', 'Nour', 'Heba'];
    const lowerName = name.toLowerCase();
    
    for (const femaleName of femaleNames) {
      if (lowerName.includes(femaleName.toLowerCase())) {
        return 'female';
      }
    }
    
    return 'male'; // Default to male
  }

  openReviewDialog(): void {
    // First, scroll to center the reviews section
    this.scrollToReviewsSection();
    
    // Small delay to ensure scroll completes before opening dialog
    setTimeout(() => {
      const dialogData: ReviewDialogData = {
        name: '',
        text: '',
        rating: 5
      };

      const dialogRef = this.dialog.open(ReviewDialogComponent, {
        width: '600px',
        maxWidth: '98vw',
        maxHeight: '95vh',
        disableClose: false,
        data: dialogData,
        panelClass: 'review-dialog-panel',
        autoFocus: true,
        restoreFocus: true,
        hasBackdrop: true,
        backdropClass: 'review-dialog-backdrop'
      });

      dialogRef.afterClosed().subscribe((result: ReviewDialogResult) => {
        if (result) {
          // Submit the review using the service
          this.submitReview(result);
        }
      });
    }, 300);
  }

  private submitReview(reviewData: ReviewDialogResult): void {
    // This method is now handled by the dialog component
    // Just refresh reviews after dialog closes
    this.loadReviews();
  }

  private scrollToReviewsSection(): void {
    const writeReviewButton = document.querySelector('.write-review-button-container');
    
    if (writeReviewButton) {
      // Use scrollIntoView with center alignment
      writeReviewButton.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    } else {
      // Fallback to reviews section if button not found
      const reviewsSection = document.querySelector('.reviews-section');
      if (reviewsSection) {
        reviewsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    }
  }



  getServiceTitle(key: string): string {
    return this.translationService.getTranslation(`service.${key}.title`);
  }

  getServiceDescription(key: string): string {
    return this.translationService.getTranslation(`service.${key}.description`);
  }

  getFeatureTitle(key: string): string {
    return this.translationService.getTranslation(`feature.${key}.title`);
  }

  getFeatureDescription(key: string): string {
    return this.translationService.getTranslation(`feature.${key}.description`);
  }
}

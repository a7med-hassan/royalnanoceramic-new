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
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeroSliderComponent } from '../../components/hero-slider/hero-slider.component';
import { BeforeAfterSliderComponent } from '../../components/before-after-slider/before-after-slider.component';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';

import { TranslationService } from '../../shared/services/translation.service';

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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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

  // Slider data and state
  sliderData = [
    {
      title: 'تطبيق السيراميك',
      beforeImage: 'assets/images/before&after/B.jpg',
      afterImage: 'assets/images/before&after/A.jpg',
    },
    {
      title: 'حماية الطلاء',
      beforeImage: 'assets/images/before&after/B1.jpg',
      afterImage: 'assets/images/before&after/A1.jpg',
    },
    {
      title: 'النتيجة النهائية',
      beforeImage: 'assets/images/before&after/B_A1.jpg',
      afterImage: 'assets/images/before&after/B-A.jpg',
    },
  ];

  currentSlideIndex = 0;

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

  constructor(
    private router: Router,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;

    // Language initialized
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
  }

  setupSingleSlider(): void {
    this.setupSlider(
      this.sliderContainer.nativeElement,
      this.afterImg.nativeElement,
      this.dragHandle.nativeElement
    );
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
    this.router.navigate([`/${route}`]);
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

import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-slider.component.html',
  styleUrls: ['./hero-slider.component.scss'],
})
export class HeroSliderComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  private slideInterval: any;

  currentSlide = 0;
  isRtl = true;
  currentLang = 'ar';

  slides = [
    {
      id: 1,
      image:
        'assets/images/slider/photo-1723242581089-48fc37043796-1920x1080.jpg',
      title: 'home.hero.title',
      subtitle: 'home.hero.subtitle',
      description: 'home.hero.description',
      ctaText: 'home.hero.cta_button',
      ctaLink: 'contact',
    },
    {
      id: 2,
      image:
        'assets/images/slider/2026-Ford-Mustang-GTD-Liquid-Carbon-002-2160.webp',
      title: 'home.hero.title',
      subtitle: 'home.hero.subtitle',
      description: 'home.hero.description',
      ctaText: 'home.hero.learn_more',
      ctaLink: 'services',
    },
    {
      id: 3,
      image: 'assets/images/slider/theevan-rao-2F4XOL0E3oQ-unsplash.jpg',
      title: 'home.hero.title',
      subtitle: 'home.hero.subtitle',
      description: 'home.hero.description',
      ctaText: 'common.read_more',
      ctaLink: 'gallery',
    },
  ];

  constructor(
    private router: Router,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Get initial language and RTL settings
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;

    // Language initialized
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  ngAfterViewInit(): void {
    this.startAutoSlide();
  }

  updateLanguage(): void {
    // Get language from parent component
    const appComponent = document.querySelector('app-root') as any;
    if (appComponent && appComponent.currentLang) {
      this.currentLang = appComponent.currentLang;
      this.isRtl = appComponent.isRtl;
    }
  }

  startAutoSlide(): void {
    // Clear any existing interval first
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }

    // Start auto-sliding every 3 seconds for slower, more comfortable transitions
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  pauseAutoSlide(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  resumeAutoSlide(): void {
    if (!this.slideInterval) {
      this.startAutoSlide();
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    // Restart auto-slide after manual navigation
    this.restartAutoSlide();
  }

  onCTAClick(link: string): void {
    this.router.navigate([`/${link}`]);
  }

  restartAutoSlide(): void {
    this.pauseAutoSlide();
    setTimeout(() => {
      this.resumeAutoSlide();
    }, 1000);
  }

  getSlideText(slide: any, field: string): string {
    // If the field is a translation key, get the translation
    if (typeof slide[field] === 'string' && slide[field].includes('.')) {
      const translation = this.translationService.getTranslation(slide[field]);
      return translation || slide[field]; // Fallback to key if translation fails
    }
    // Fallback for any other type
    const result = slide[field] || '';
    return result;
  }

  refreshSlides(): void {
    // Force change detection by triggering a small change
    // This ensures the text is updated when language changes

    // Force Angular to re-evaluate the slides array
    this.slides = [...this.slides];

    // Trigger change detection manually
    setTimeout(() => {}, 100);
  }
}

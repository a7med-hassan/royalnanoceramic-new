import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentLang = 'ar';
  isRtl = true;
  currentSlide = 0;
  totalSlides = 4;
  private autoPlayInterval: any;
  private autoPlayDelay = 5000; // 5 seconds

  constructor(public translationService: TranslationService) {}

  ngOnInit(): void {
    // Get initial language and RTL settings
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;

    // Start auto-play
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopAutoPlay();
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlider();
    this.restartAutoPlay(); // Restart auto-play when user interacts
  }

  previousSlide(): void {
    this.currentSlide =
      this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
    this.updateSlider();
    this.restartAutoPlay(); // Restart auto-play when user interacts
  }

  goToSlide(slideIndex: number): void {
    this.currentSlide = slideIndex;
    this.updateSlider();
    this.restartAutoPlay(); // Restart auto-play when user interacts
  }

  private startAutoPlay(): void {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  private restartAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  onSliderHover(): void {
    this.stopAutoPlay(); // Pause auto-play when hovering
  }

  onSliderLeave(): void {
    this.startAutoPlay(); // Resume auto-play when leaving
  }

  private updateSlider(): void {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.nav-dot');

    // Remove active class from all slides and dots
    slides.forEach((slide) => slide.classList.remove('active'));
    dots.forEach((dot) => dot.classList.remove('active'));

    // Add active class to current slide and dot
    slides[this.currentSlide]?.classList.add('active');
    dots[this.currentSlide]?.classList.add('active');
  }
}

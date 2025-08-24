import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Input,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../shared/services/translation.service';

interface BeforeAfterImage {
  id: number;
  beforeImage: string;
  afterImage: string;
  title: string;
  description: string;
  category: string;
}

@Component({
  selector: 'app-before-after-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './before-after-slider.component.html',
  styleUrls: ['./before-after-slider.component.scss'],
})
export class BeforeAfterSliderComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('sliderContainer') sliderContainer!: ElementRef;
  @ViewChild('sliderTrack') sliderTrack!: ElementRef;
  @ViewChild('beforeImage') beforeImage!: ElementRef;
  @ViewChild('afterImage') afterImage!: ElementRef;
  @ViewChild('movingDivider') movingDivider!: ElementRef;

  @Input() images: BeforeAfterImage[] = [];
  @Input() autoPlay: boolean = true;
  @Input() autoPlayInterval: number = 15000; // 15 seconds

  currentImageIndex: number = 0;
  sliderPosition: number = 50;
  isDragging: boolean = false;
  autoPlayTimer: any;
  isVisible: boolean = false;

  defaultImages: BeforeAfterImage[] = [
    {
      id: 1,
      beforeImage: 'assets/images/before&after/B.jpg',
      afterImage: 'assets/images/before&after/A.jpg',
      title: 'تطبيق السيراميك',
      description: 'تطبيق احترافي لطلاء السيراميك مع حماية دائمة ولمعان',
      category: 'طلاء السيراميك',
    },
    {
      id: 2,
      beforeImage: 'assets/images/before&after/B1.jpg',
      afterImage: 'assets/images/before&after/A1.jpg',
      title: 'حماية الطلاء',
      description: 'تركيب حماية كاملة للطلاء للحفاظ على السيارة',
      category: 'حماية الطلاء',
    },
    {
      id: 3,
      beforeImage: 'assets/images/before&after/B5.jpeg',
      afterImage: 'assets/images/before&after/A5.jpeg',
      title: 'تلميع السيراميك',
      description: 'تلميع احترافي للسيراميك مع إزالة الخدوش والعلامات',
      category: 'تلميع السيراميك',
    },
    {
      id: 4,
      beforeImage: 'assets/images/before&after/B6.jpeg',
      afterImage: 'assets/images/before&after/A6.jpeg',
      title: 'حماية النانو',
      description: 'تطبيق طبقة حماية النانو للحفاظ على الطلاء الأصلي',
      category: 'حماية النانو',
    },
  ];

  constructor(public translationService: TranslationService) {}

  ngOnInit(): void {
    if (this.images.length === 0) {
      this.images = this.defaultImages;
    }
  }

  ngAfterViewInit(): void {
    this.setupSlider();
    this.setupIntersectionObserver();
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }

  // Keyboard controls removed for simplicity

  setupSlider(): void {
    if (this.sliderTrack) {
      this.updateSliderPosition(this.sliderPosition);
    }
  }

  setupIntersectionObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.isVisible = true;
            this.animateIn();
          } else {
            this.isVisible = false;
          }
        });
      },
      { threshold: 0.3 }
    );

    if (this.sliderContainer) {
      observer.observe(this.sliderContainer.nativeElement);
    }
  }

  animateIn(): void {
    const container = this.sliderContainer.nativeElement;
    container.style.opacity = '0';
    container.style.transform = 'translateY(15px)';

    setTimeout(() => {
      container.style.transition = 'all 0.3s ease';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 30);
  }

  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;
    this.updateSliderFromEvent(event);

    document.addEventListener('mousemove', this.onMouseMove, {
      passive: false,
    });
    document.addEventListener('mouseup', this.onMouseUp, { passive: false });
  }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.isDragging = true;
    this.updateSliderFromTouch(event);
    document.addEventListener('touchmove', this.onTouchMove, {
      passive: false,
    });
    document.addEventListener('touchend', this.onTouchEnd, { passive: false });
  }

  onMouseMove = (event: MouseEvent): void => {
    if (this.isDragging) {
      event.preventDefault();
      this.updateSliderFromEvent(event);
    }
  };

  onTouchMove = (event: TouchEvent): void => {
    if (this.isDragging) {
      event.preventDefault();
      this.updateSliderFromTouch(event);
    }
  };

  onMouseUp = (): void => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  onTouchEnd = (): void => {
    this.isDragging = false;
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
  };

  updateSliderFromEvent(event: MouseEvent): void {
    const rect = this.sliderTrack.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    this.updateSliderPosition(Math.max(0, Math.min(100, percentage)));
  }

  updateSliderFromTouch(event: TouchEvent): void {
    const rect = this.sliderTrack.nativeElement.getBoundingClientRect();
    const x = event.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    this.updateSliderPosition(Math.max(0, Math.min(100, percentage)));
  }

  updateSliderPosition(position: number): void {
    this.sliderPosition = position;

    if (this.movingDivider && this.beforeImage && this.afterImage) {
      // تحريك الخط الفاصل
      this.movingDivider.nativeElement.style.left = `${position}%`;

      // تقسيم الصورة الأولى - الجزء الأيسر مع blur ديناميكي
      const blurAmount = Math.max(0, (50 - position) / 8);
      this.beforeImage.nativeElement.style.clipPath = `inset(0 ${
        100 - position
      }% 0 0)`;
      this.beforeImage.nativeElement.style.filter = `blur(${blurAmount}px)`;

      // تقسيم الصورة الثانية - الجزء الأيمن بدون blur
      this.afterImage.nativeElement.style.clipPath = `inset(0 0 0 ${position}%)`;
      this.afterImage.nativeElement.style.filter = 'blur(0px)';
    }
  }

  // Navigation functions
  goToImage(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.currentImageIndex = index;
      this.resetSlider();
      this.animateImageChange();
    }
  }

  resetSlider(): void {
    this.sliderPosition = 50; // يبدأ من المنتصف
    this.updateSliderPosition(this.sliderPosition);
  }

  animateImageChange(): void {
    const container = this.sliderContainer.nativeElement;

    container.style.transform = 'scale(0.95)';

    setTimeout(() => {
      container.style.transition = 'all 0.15s ease';
      container.style.transform = 'scale(1)';
    }, 30);
  }

  // AutoPlay functions
  startAutoPlay(): void {
    if (this.autoPlay && this.images.length > 1) {
      this.autoPlayTimer = setInterval(() => {
        this.nextImage();
      }, this.autoPlayInterval);
    }
  }

  stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  nextImage(): void {
    if (this.images.length > 1) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.images.length;
      this.resetSlider();
      this.animateImageChange();
    }
  }

  previousImage(): void {
    if (this.images.length > 1) {
      this.currentImageIndex =
        this.currentImageIndex === 0
          ? this.images.length - 1
          : this.currentImageIndex - 1;
      this.resetSlider();
      this.animateImageChange();
    }
  }
}

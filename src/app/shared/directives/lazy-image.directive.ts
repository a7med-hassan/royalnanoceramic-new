import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: 'img[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements OnInit, OnDestroy {
  @Input() appLazyImage: string = ''; // The actual image source
  @Input() placeholder: string = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18"%3ELoading...%3C/text%3E%3C/svg%3E';
  
  private observer: IntersectionObserver | null = null;
  private isLoaded = false;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Set placeholder
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.placeholder);
    this.renderer.addClass(this.el.nativeElement, 'lazy-loading');
    
    // Create observer
    this.createObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private createObserver() {
    const options = {
      root: null,
      rootMargin: '50px', // Start loading 50px before visible
      threshold: 0.01
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoaded) {
          this.loadImage();
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  private loadImage() {
    const img = new Image();
    
    img.onload = () => {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.appLazyImage);
      this.renderer.removeClass(this.el.nativeElement, 'lazy-loading');
      this.renderer.addClass(this.el.nativeElement, 'lazy-loaded');
      this.isLoaded = true;
      
      // Stop observing
      if (this.observer) {
        this.observer.unobserve(this.el.nativeElement);
      }
    };

    img.onerror = () => {
      console.error('Failed to load image:', this.appLazyImage);
      this.renderer.removeClass(this.el.nativeElement, 'lazy-loading');
      this.renderer.addClass(this.el.nativeElement, 'lazy-error');
    };

    img.src = this.appLazyImage;
  }
}


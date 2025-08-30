import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PerformanceService {
  private imageCache = new Map<string, string>();
  private preloadedImages = new Set<string>();

  constructor() {
    this.setupPerformanceOptimizations();
  }

  /**
   * Setup performance optimizations
   */
  private setupPerformanceOptimizations(): void {
    // Enable passive event listeners for better scroll performance
    this.enablePassiveEventListeners();

    // Setup intersection observer for lazy loading
    this.setupIntersectionObserver();

    // Preload critical resources
    this.preloadCriticalResources();
  }

  /**
   * Enable passive event listeners
   */
  private enablePassiveEventListeners(): void {
    // Override addEventListener to use passive listeners for scroll events
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options
    ) {
      if (type === 'scroll' || type === 'touchstart' || type === 'touchmove') {
        if (typeof options === 'boolean') {
          options = { capture: options, passive: true };
        } else if (typeof options === 'object') {
          options.passive = true;
        } else {
          options = { passive: true };
        }
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  /**
   * Setup intersection observer for lazy loading
   */
  private setupIntersectionObserver(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      );

      // Store observer globally for use in components
      (window as any).imageObserver = imageObserver;
    }
  }

  /**
   * Preload critical resources
   */
  private preloadCriticalResources(): void {
    // Preload critical fonts
    this.preloadFont(
      'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap'
    );

    // Preload critical images
    const criticalImages = [
      '/assets/images/logo.png',
      '/assets/images/hero-bg.jpg',
    ];

    criticalImages.forEach((src) => this.preloadImage(src));
  }

  /**
   * Preload font
   */
  private preloadFont(href: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  }

  /**
   * Preload image
   */
  private preloadImage(src: string): void {
    if (this.preloadedImages.has(src)) return;

    const img = new Image();
    img.onload = () => {
      this.preloadedImages.add(src);
    };
    img.src = src;
  }

  /**
   * Load image with caching
   */
  loadImage(img: HTMLImageElement): void {
    const src = img.dataset['src'] || img.src;

    if (this.imageCache.has(src)) {
      img.src = this.imageCache.get(src)!;
      img.classList.add('loaded');
      return;
    }

    const imageLoader = new Image();
    imageLoader.onload = () => {
      this.imageCache.set(src, src);
      img.src = src;
      img.classList.add('loaded');
      img.classList.remove('loading');
    };

    imageLoader.onerror = () => {
      img.classList.add('error');
      img.classList.remove('loading');
    };

    imageLoader.src = src;
  }

  /**
   * Optimize images for web
   */
  optimizeImage(src: string, width?: number, height?: number): string {
    // Add image optimization parameters
    let optimizedSrc = src;

    if (width || height) {
      const params = new URLSearchParams();
      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      params.set('q', '80'); // Quality
      params.set('f', 'webp'); // Format

      optimizedSrc += `?${params.toString()}`;
    }

    return optimizedSrc;
  }

  /**
   * Debounce function for performance
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Throttle function for performance
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): any {
    if (!('performance' in window)) return null;

    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    return {
      // Page load metrics
      domContentLoaded:
        navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint:
        paint.find((entry) => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint:
        paint.find((entry) => entry.name === 'first-contentful-paint')
          ?.startTime || 0,

      // Resource metrics
      totalResources: performance.getEntriesByType('resource').length,
      totalSize: performance
        .getEntriesByType('resource')
        .reduce((total, resource) => {
          return total + (resource as PerformanceResourceTiming).transferSize;
        }, 0),
    };
  }

  /**
   * Monitor performance
   */
  monitorPerformance(): void {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      // This would require the web-vitals library
      console.log('Web Vitals monitoring available');
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn('High memory usage detected');
        }
      }, 30000);
    }
  }

  /**
   * Clear caches
   */
  clearCaches(): void {
    this.imageCache.clear();
    this.preloadedImages.clear();
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LazyLoadingService {
  private loadedModules = new Set<string>();
  private loadingPromises = new Map<string, Promise<any>>();

  constructor() {}

  /**
   * Lazy load Swiper modules when needed
   */
  async loadSwiperModules(): Promise<void> {
    const moduleKey = 'swiper';
    
    if (this.loadedModules.has(moduleKey)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(moduleKey)) {
      return this.loadingPromises.get(moduleKey);
    }

    const loadPromise = this.loadSwiper();
    this.loadingPromises.set(moduleKey, loadPromise);

    try {
      await loadPromise;
      this.loadedModules.add(moduleKey);
      this.loadingPromises.delete(moduleKey);
    } catch (error) {
      this.loadingPromises.delete(moduleKey);
      throw error;
    }
  }

  private async loadSwiper(): Promise<void> {
    // Dynamically import Swiper modules
    const { Autoplay, Pagination, EffectCoverflow } = await import('swiper/modules');
    
    // Register modules globally if needed
    if (typeof window !== 'undefined') {
      (window as any).SwiperModules = { Autoplay, Pagination, EffectCoverflow };
    }
  }

  /**
   * Lazy load analytics when user interacts
   */
  async loadAnalytics(): Promise<void> {
    const moduleKey = 'analytics';
    
    if (this.loadedModules.has(moduleKey)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(moduleKey)) {
      return this.loadingPromises.get(moduleKey);
    }

    const loadPromise = this.loadAnalyticsScript();
    this.loadingPromises.set(moduleKey, loadPromise);

    try {
      await loadPromise;
      this.loadedModules.add(moduleKey);
      this.loadingPromises.delete(moduleKey);
    } catch (error) {
      this.loadingPromises.delete(moduleKey);
      throw error;
    }
  }

  private async loadAnalyticsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      // Check if analytics is already loaded
      if ((window as any).gtag) {
        resolve();
        return;
      }

      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load analytics'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Lazy load non-critical CSS
   */
  async loadNonCriticalCSS(href: string): Promise<void> {
    const moduleKey = `css-${href}`;
    
    if (this.loadedModules.has(moduleKey)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => {
        this.loadedModules.add(moduleKey);
        resolve();
      };
      link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
      
      document.head.appendChild(link);
    });
  }

  /**
   * Preload resources when browser is idle
   */
  preloadWhenIdle(resources: string[]): void {
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) {
      return;
    }

    (window as any).requestIdleCallback(() => {
      resources.forEach(resource => {
        this.preloadResource(resource);
      });
    }, { timeout: 2000 });
  }

  private preloadResource(href: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    
    // Determine resource type based on extension
    if (href.endsWith('.css')) {
      link.as = 'style';
    } else if (href.endsWith('.js')) {
      link.as = 'script';
    } else if (href.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
      link.as = 'image';
    } else if (href.endsWith('.woff2') || href.endsWith('.woff')) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  }

  /**
   * Check if module is loaded
   */
  isModuleLoaded(moduleKey: string): boolean {
    return this.loadedModules.has(moduleKey);
  }

  /**
   * Get loading status
   */
  isLoading(moduleKey: string): boolean {
    return this.loadingPromises.has(moduleKey);
  }
}


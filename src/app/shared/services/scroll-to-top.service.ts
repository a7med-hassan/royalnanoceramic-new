import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ScrollToTopService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  /**
   * Scroll to top of the page with smooth animation
   */
  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scrollToTopWithBehavior('smooth');
    }
  }

  /**
   * Scroll to top with custom behavior
   * @param behavior - 'smooth' | 'instant' | 'auto'
   */
  scrollToTopWithBehavior(behavior: 'smooth' | 'instant' | 'auto' = 'smooth'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      // Check if we're on a mobile device
      const isMobile = this.isMobileDevice();
      
      if (behavior === 'instant' || isMobile) {
        // Use instant scroll for mobile devices or when requested
        this.instantScrollToTop();
        return;
      }

      // Try smooth scrolling for desktop
      if (this.isScrollToTopSupported()) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: behavior,
        });
      } else {
        // Fallback for browsers that don't support smooth scrolling
        this.instantScrollToTop();
      }
    } catch (error) {
      console.error('Error scrolling to top:', error);
      // Fallback: instant scroll to top
      this.instantScrollToTop();
    }
  }

  /**
   * Scroll to a specific element
   * @param elementId - ID of the element to scroll to
   * @param behavior - Scroll behavior
   */
  scrollToElement(elementId: string, behavior: 'smooth' | 'instant' | 'auto' = 'smooth'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const element = document.getElementById(elementId);
      if (element) {
        const isMobile = this.isMobileDevice();
        
        if (behavior === 'instant' || isMobile) {
          // Use instant scroll for mobile devices
          element.scrollIntoView({
            behavior: 'auto',
            block: 'start',
            inline: 'nearest'
          });
        } else {
          element.scrollIntoView({
            behavior: behavior,
            block: 'start',
            inline: 'nearest'
          });
        }
      } else {
        console.warn(`Element with ID "${elementId}" not found.`);
      }
    } catch (error) {
      console.error('Error scrolling to element:', error);
    }
  }

  /**
   * Check if scroll to top functionality is supported
   */
  isScrollToTopSupported(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return 'scrollTo' in window && 'scrollBehavior' in document.documentElement.style;
  }

  /**
   * Check if the current device is mobile
   */
  private isMobileDevice(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    
    // Check user agent for mobile devices
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    
    // Also check screen size for mobile devices
    const isMobileScreen = window.innerWidth <= 768;
    
    return mobileRegex.test(userAgent) || isMobileScreen;
  }

  /**
   * Instant scroll to top (fallback method)
   */
  private instantScrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      // Try multiple methods to ensure compatibility
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // For mobile Safari and other mobile browsers
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
      }
    } catch (error) {
      console.error('Error with instant scroll to top:', error);
    }
  }
}

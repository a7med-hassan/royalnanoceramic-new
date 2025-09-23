import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {

  constructor() { }

  /**
   * Measure page load performance
   */
  measurePageLoad(): void {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          const metrics = {
            // DNS lookup time
            dns: perfData.domainLookupEnd - perfData.domainLookupStart,
            // TCP connection time
            tcp: perfData.connectEnd - perfData.connectStart,
            // Request time
            request: perfData.responseEnd - perfData.requestStart,
            // Response time
            response: perfData.responseEnd - perfData.responseStart,
            // DOM processing time
            domProcessing: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            // Total page load time
            totalLoad: perfData.loadEventEnd - perfData.fetchStart,
            // First Contentful Paint
            fcp: this.getFirstContentfulPaint(),
            // Largest Contentful Paint
            lcp: this.getLargestContentfulPaint()
          };

          console.log('Performance Metrics:', metrics);
          
          // Log performance issues
          if (metrics.totalLoad > 3000) {
            console.warn('Slow page load detected:', metrics.totalLoad + 'ms');
          }
        }, 0);
      });
    }
  }

  /**
   * Get First Contentful Paint time
   */
  private getFirstContentfulPaint(): number {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  /**
   * Get Largest Contentful Paint time
   */
  private getLargestContentfulPaint(): number {
    return new Promise<number>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Fallback timeout
      setTimeout(() => resolve(0), 5000);
    }) as any;
  }

  /**
   * Monitor Core Web Vitals
   */
  monitorCoreWebVitals(): void {
    // First Input Delay (FID)
    this.measureFirstInputDelay();
    
    // Cumulative Layout Shift (CLS)
    this.measureCumulativeLayoutShift();
  }

  private measureFirstInputDelay(): void {
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime;
        console.log('First Input Delay:', fid + 'ms');
        
        if (fid > 100) {
          console.warn('Poor FID detected:', fid + 'ms');
        }
      });
    }).observe({ entryTypes: ['first-input'] });
  }

  private measureCumulativeLayoutShift(): void {
    let clsValue = 0;
    
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      console.log('Cumulative Layout Shift:', clsValue);
      
      if (clsValue > 0.1) {
        console.warn('Poor CLS detected:', clsValue);
        // إرسال تحذير للتحسين
        this.reportCLSIssue(clsValue);
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources(): void {
    const criticalResources = [
      '/assets/images/logo.png',
      // Add other critical images here
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  /**
   * Optimize font loading
   */
  optimizeFontLoading(): void {
    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    fontLink.href = '/assets/fonts/cairo-arabic-400-normal.woff2';
    document.head.appendChild(fontLink);
  }

  /**
   * Report CLS issues for debugging
   */
  private reportCLSIssue(clsValue: number): void {
    // يمكن إرسال هذه البيانات لخدمة تحليل الأداء
    console.group('🔍 CLS Analysis');
    console.log('CLS Value:', clsValue);
    console.log('Recommendations:');
    console.log('- Add min-height to dynamic content');
    console.log('- Use font-display: block for critical fonts');
    console.log('- Reserve space for images and ads');
    console.log('- Avoid inserting content above existing content');
    console.groupEnd();
  }
}
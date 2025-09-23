import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {

  constructor() { }

  /**
   * Generate optimized image URL with WebP format and appropriate sizing
   */
  getOptimizedImageUrl(imagePath: string, width?: number, height?: number, quality: number = 80): string {
    // For now, return the original path
    // In production, you would integrate with an image optimization service
    // like Cloudinary, ImageKit, or implement server-side optimization
    return imagePath;
  }

  /**
   * Preload critical images
   */
  preloadImages(imageUrls: string[]): Promise<void[]> {
    const promises = imageUrls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    });
    return Promise.all(promises);
  }

  /**
   * Lazy load images with intersection observer
   */
  observeImages(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset['src']) {
              img.src = img.dataset['src'];
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      });

      // Observe all images with data-src attribute
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * Convert images to WebP format if supported
   */
  supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Get appropriate image format based on browser support
   */
  getImageFormat(): string {
    return this.supportsWebP() ? 'webp' : 'jpg';
  }
}

import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService } from '../../shared/services/translation.service';
import { LazyImageDirective } from '../../shared/directives/lazy-image.directive';
import { ViewportRenderDirective } from '../../shared/directives/viewport-render.directive';
import { GalleryService, GalleryImage } from '../../shared/services/gallery.service';
import { SchemaService } from '../../shared/services/schema.service';
import { SchemaDataService } from '../../shared/services/schema-data.service';
import GLightbox from 'glightbox';

declare var Swiper: any;

declare global {
  interface Window {
    glightbox?: any;
  }
}

interface FeaturedService {
  image: string;
  title: string;
  description: string;
  type: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, LazyImageDirective, ViewportRenderDirective],
  templateUrl: './gallery.component.html',
  styles: [`
    .gallery {
      background: #0a0a0a;
      color: white;
      min-height: 100vh;
      padding-top: 80px; /* Add top padding to account for fixed navbar */
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
      padding: 80px 0;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .hero-section::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
      opacity: 0.3;
    }
    
    .hero-content {
      position: relative;
      z-index: 2;
    }
    
    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      color: #c5a059;
      margin-bottom: 1rem;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    }
    
    .hero-subtitle {
      font-size: 1.3rem;
      color: #fff;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .hero-description {
      font-size: 1.1rem;
      color: #ccc;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    /* Featured Slider Section */
    .featured-slider-section {
      padding: 80px 0;
      background: #0a0a0a;
    }
    
    .section-title {
      text-align: center;
      font-size: 2.5rem;
      color: #c5a059;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    
    .section-description {
      text-align: center;
      font-size: 1.1rem;
      color: #ccc;
      margin-bottom: 3rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .slider-container {
      margin-top: 2rem;
    }
    
    .featured-swiper {
      padding: 20px 0;
    }
    
    .slide-content {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      height: 400px;
    }
    
    .slide-content:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
    }
    
    .slide-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .slide-content:hover .slide-image {
      transform: scale(1.05);
    }
    
        .slide-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .slide-content:hover .slide-overlay {
          opacity: 1;
          background: rgba(0, 0, 0, 0.6);
        }

        .slide-info {
          text-align: center;
          color: white;
        }

        .contact-text {
          color: #c5a059;
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
        }

        .slide-content:hover .contact-text {
          opacity: 1;
          transform: translateY(0);
        }
    
    /* Gallery Grid Section */
    .gallery-grid-section {
      padding: 80px 0;
      background: #0a0a0a;
    }
    
    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .image-item {
      position: relative;
      border-radius: 15px;
      overflow: hidden;
      transition: all 0.3s ease;
      text-decoration: none;
      display: block;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .image-item:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
    }
    
    .image-item img {
      width: 100%;
      height: 250px;
      object-fit: cover;
      display: block;
      transition: transform 0.3s ease;
    }
    
    .image-item:hover img {
      transform: scale(1.1);
    }
    
    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .image-item:hover .image-overlay {
      opacity: 1;
    }
    
    .overlay-content {
      text-align: center;
      color: white;
    }
    
    .overlay-content i {
      font-size: 2rem;
      color: #c5a059;
      margin-bottom: 10px;
      display: block;
    }
    
    .overlay-content span {
      font-size: 1rem;
      font-weight: 600;
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
      .gallery {
        padding-top: 70px; /* Adjust for mobile navbar height */
      }
      
      .container {
        padding: 0 15px;
      }
      
      .hero-section {
        padding: 40px 0; /* Reduce padding since we have top padding on gallery */
      }
      
      .hero-title {
        font-size: 2.8rem;
        margin-bottom: 1.5rem;
        line-height: 1.2;
      }
      
      .hero-subtitle {
        font-size: 1.3rem;
        margin-bottom: 1rem;
        line-height: 1.4;
      }
      
      .hero-description {
        font-size: 1.1rem;
        line-height: 1.6;
        padding: 0 10px;
      }
      
      .featured-slider-section,
      .gallery-grid-section {
        padding: 60px 0;
      }
      
      .section-title {
        font-size: 2.2rem;
        margin-bottom: 1.5rem;
        line-height: 1.2;
      }
      
      .section-description {
        font-size: 1.1rem;
        line-height: 1.6;
        padding: 0 10px;
      }
      
      .slide-content {
        height: 300px;
      }
      
      .image-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
      }
      
      .image-item img {
        height: 200px;
      }
    }
    
    @media (max-width: 480px) {
      .gallery {
        padding-top: 60px; /* Adjust for smaller mobile navbar height */
      }
      
      .hero-section {
        padding: 30px 0; /* Further reduce padding for smaller screens */
      }
      
      .hero-title {
        font-size: 2.2rem;
        margin-bottom: 1.2rem;
        line-height: 1.2;
      }
      
      .hero-subtitle {
        font-size: 1.2rem;
        margin-bottom: 0.8rem;
        line-height: 1.4;
      }
      
      .hero-description {
        font-size: 1rem;
        line-height: 1.6;
        padding: 0 15px;
      }
      
      .featured-slider-section,
      .gallery-grid-section {
        padding: 40px 0;
      }
      
      .section-title {
        font-size: 2rem;
        margin-bottom: 1.2rem;
        line-height: 1.2;
      }
      
      .section-description {
        font-size: 1rem;
        line-height: 1.6;
        padding: 0 15px;
      }
      
      .image-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .slide-content {
        height: 250px;
      }
    }
  `]
})
export class GalleryComponent implements OnInit, AfterViewInit, OnDestroy {
  // Static images (default gallery images)
  staticImages = [
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-10-13.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-10-20.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-10-28.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-12-01.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-16-20.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-17-00.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-17-20.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-17-28.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-18-00.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-18-21.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-18-57.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-19-05.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-19-08.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-19-54.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-20-44.webp',
    'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-24-31.webp'
  ];

  // Gallery images from Firebase
  galleryImages: GalleryImage[] = [];
  
  // Combined images (static + admin uploaded)
  images: string[] = [];
  
  // Images grouped by collection
  imagesByCollection: Map<string, GalleryImage[]> = new Map();
  
  loading = true;

  featuredServices: FeaturedService[] = [
    {
      image: 'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-10-13.webp',
      title: 'Ø­Ù…Ø§ÙŠØ© Ù†Ø§Ù†Ùˆ Ø³ÙŠØ±Ø§Ù…ÙŠÙƒ',
      description: 'Ø­Ù…Ø§ÙŠØ© Ù…ØªÙ‚Ø¯Ù…Ø© Ù„Ù„Ø³ÙŠØ§Ø±Ø© Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… ØªÙ‚Ù†ÙŠØ© Ø§Ù„Ù†Ø§Ù†Ùˆ Ø³ÙŠØ±Ø§Ù…ÙŠÙƒ',
      type: 'Nano Ceramic Coating'
    },
    {
      image: 'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-10-20.webp',
      title: 'Ø­Ù…Ø§ÙŠØ© Ø¯Ø§Ø®Ù„ÙŠØ© Ø´Ø§Ù…Ù„Ø©',
      description: 'Ù…Ø¹Ø§Ù„Ø¬Ø© Ø´Ø§Ù…Ù„Ø© Ù„Ù„Ù…Ù‚Ø§Ø¹Ø¯ ÙˆØ§Ù„Ø®Ø§Ù…Ø§Øª Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© Ù„Ù„Ø³ÙŠØ§Ø±Ø©',
      type: 'Interior Protection'
    },
    {
      image: 'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-10-28.webp',
      title: 'ØªÙØµÙŠÙ„ Ø§Ø­ØªØ±Ø§ÙÙŠ',
      description: 'Ø®Ø¯Ù…Ø© ØªÙ†Ø¸ÙŠÙ ÙˆØªØ¬Ù…ÙŠÙ„ Ø´Ø§Ù…Ù„Ø© Ù„Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø¨Ø±ÙŠÙ‚ Ø§Ù„Ø³ÙŠØ§Ø±Ø©',
      type: 'Professional Detailing'
    },
    {
      image: 'https://bucolic-liger-463ea4.netlify.app/imgs/photo_2025-08-14_11-12-01.webp',
      title: 'Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ø·Ù„Ø§Ø¡',
      description: 'Ø­Ù…Ø§ÙŠØ© ÙØ¹Ø§Ù„Ø© Ù„Ù„Ø·Ù„Ø§Ø¡ Ù…Ù† Ø§Ù„Ø®Ø¯ÙˆØ´ ÙˆØ§Ù„Ø¹ÙˆØ§Ù…Ù„ Ø§Ù„Ø¬ÙˆÙŠØ©',
      type: 'Paint Protection'
    }
  ];

  // Method to get featured services with dynamic images
  getFeaturedServices(): FeaturedService[] {
    // Try to get admin images for featured services
    const savedImages = localStorage.getItem('galleryImages');
    if (savedImages) {
      try {
        const adminImages = JSON.parse(savedImages);
        const activeAdminImages = adminImages.filter((img: any) => img.isActive !== false);
        
        // Update featured services with admin images if available
        const updatedServices = [...this.featuredServices];
        activeAdminImages.slice(0, 4).forEach((adminImg: any, index: number) => {
          if (updatedServices[index]) {
            updatedServices[index].image = adminImg.src;
            updatedServices[index].title = adminImg.serviceTypeAr || updatedServices[index].title;
            updatedServices[index].description = adminImg.description || updatedServices[index].description;
          }
        });
        return updatedServices;
      } catch (error) {
        console.error('Error loading featured services:', error);
      }
    }
    return this.featuredServices;
  }

  constructor(
    private router: Router,
    public translationService: TranslationService,
    private galleryService: GalleryService,
    private schemaService: SchemaService,
    private schemaData: SchemaDataService
  ) {}

  ngOnInit(): void {
    // â”€â”€ Structured Data (JSON-LD) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    this.schemaService.addSchema(
      'gallery-breadcrumb',
      this.schemaData.getBreadcrumbSchema([
        { name: 'Home', url: 'https://royalnanoceramic.com' },
        { name: 'Gallery', url: 'https://royalnanoceramic.com/gallery' },
      ])
    );

    // Load images from Firebase
    this.loadGalleryImagesFromFirebase();
    
    // Also load from localStorage as fallback
    this.loadGalleryImages();

    // Listen for gallery updates from admin panel
    window.addEventListener('galleryUpdated', this.handleGalleryUpdate);
    window.addEventListener('storage', this.handleStorageChange);

    // Optional one-time seeding via query param ?seed=1
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('seed') === '1') {
        this.seedProvidedCollections();
      }
    } catch {}

    // Expose manual trigger for seeding via browser console
    (window as any).seedGallery = () => this.seedProvidedCollections();
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    window.removeEventListener('galleryUpdated', this.handleGalleryUpdate);
    window.removeEventListener('storage', this.handleStorageChange);
    this.schemaService.removeSchema('gallery-breadcrumb');
  }

  private loadGalleryImagesFromFirebase(): void {
    this.loading = true;
    this.galleryService.getAllImages().subscribe({
      next: (images) => {
        this.galleryImages = images;
        
        // Group images by collection
        this.imagesByCollection.clear();
        images.forEach((image) => {
          const collectionId = image.collectionId || 'no-collection';
          if (!this.imagesByCollection.has(collectionId)) {
            this.imagesByCollection.set(collectionId, []);
          }
          this.imagesByCollection.get(collectionId)!.push(image);
        });
        
        // Build images array with all images
        this.images = images.map((img) => img.src);
        
        this.loading = false;
        
        // Reinitialize GLightbox after loading
        setTimeout(() => {
          this.initializeGLightbox();
        }, 300);
      },
      error: (error) => {
        console.error('Error loading gallery images from Firebase:', error);
        this.loading = false;
        // Fallback to localStorage
        this.loadGalleryImages();
      }
    });
  }

  private loadGalleryImages(): void {
    // Start with static images
    const staticImgs = [...this.staticImages];
    
    // Load admin uploaded images from localStorage
    const savedImages = localStorage.getItem('galleryImages');
    if (savedImages) {
      try {
        const adminImages = JSON.parse(savedImages);
        // Filter only active images and extract src
        const activeAdminImages = adminImages
          .filter((img: any) => img.isActive !== false)
          .map((img: any) => img.src);
        
        // Combine with static images
        this.images = [...staticImgs, ...activeAdminImages];
      } catch (error) {
        console.error('Error loading admin images:', error);
        this.images = staticImgs;
      }
    } else {
      this.images = staticImgs;
    }
  }
  
  /**
   * Get collection images for a specific collection ID
   */
  getCollectionImages(collectionId: string): GalleryImage[] {
    return this.imagesByCollection.get(collectionId) || [];
  }
  
  /**
   * Returns an array of image groups, each group contains all the photos for a single collectionId (car)
   */
  getCollectionsForDisplay(): GalleryImage[][] {
    return Array.from(this.imagesByCollection.values());
  }

  /**
   * Opens GLightbox with all images for selected collectionId (all images for a single car)
   */
  openCollectionLightbox(collectionId: string, startIndex: number = 0) {
    const images = this.getCollectionImages(collectionId);
    if (!images || images.length === 0) { return; }
    GLightbox({
      elements: images.map(img => ({
        href: img.src,
        type: 'image',
        title: img.title || img.alt,
        description: img.description || img.collectionName || ''
      })),
      touchNavigation: true,
      loop: true,
    } as any).openAt(startIndex);
  }
  
  /**
   * Get all images for GLightbox grouped by collection
   */
  getLightboxImages(): any[] {
    const lightboxItems: any[] = [];
    
    // Add static images first
    this.staticImages.forEach((img, index) => {
      lightboxItems.push({
        href: img,
        type: 'image',
        title: `ØµÙˆØ±Ø© ${index + 1}`,
        description: 'Ù…Ø¹Ø±Ø¶ ØµÙˆØ± Ø®Ø¯Ù…Ø§ØªÙ†Ø§ Ø§Ù„Ù…ØªÙ…ÙŠØ²Ø©'
      });
    });
    
    // Add gallery images grouped by collection
    this.galleryImages.forEach((image) => {
      const collectionId = image.collectionId || 'no-collection';
      const collectionName = image.collectionName || '';
      
      lightboxItems.push({
        href: image.src,
        type: 'image',
        title: image.title || image.alt,
        description: image.description || collectionName,
        'data-gallery': collectionId // Group by collection
      });
    });
    
    return lightboxItems;
  }

  private handleGalleryUpdate = (): void => {
    console.log('Gallery updated, reloading images...');
    this.loadGalleryImages();
    // Reinitialize GLightbox with new images
    setTimeout(() => {
      this.initializeGLightbox();
    }, 100);
  };

  private handleStorageChange = (e: StorageEvent): void => {
    if (e.key === 'galleryImages') {
      console.log('Gallery images changed in localStorage, reloading...');
      this.loadGalleryImages();
    }
  };

  ngAfterViewInit(): void {
    GLightbox({
      selector: '.glightbox',
      touchNavigation: true,
      loop: true,
    });
  }

  /**
   * Seed Firestore with provided collections (no titles/descriptions per image)
   */
  private seedProvidedCollections(): void {
    const seedData = [
      { collectionId: 'alpha', collectionName: 'alpha', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/alpha/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/alpha/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/alpha/3.jpg',
      ]},
      { collectionId: 'audi', collectionName: 'audi', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/audi/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/audi/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/audi/3.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/audi/4.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/audi/5.jpg',
      ]},
      { collectionId: 'bmw', collectionName: 'bmw', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/bmw/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/bmw/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/bmw/3.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/bmw/4.jpg',
      ]},
      { collectionId: 'hyundai', collectionName: 'hyundai', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/hyundai/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/hyundai/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/hyundai/3.jpg',
      ]},
      { collectionId: 'mercedes', collectionName: 'mercedes', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes/3.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes/4.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes/5.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes/6.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes/7.jpg',
      ]},
      { collectionId: 'peugeot', collectionName: 'peugeot', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/peugeot/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/peugeot/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/peugeot/3.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/peugeot/4.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/peugeot/5.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/peugeot/6.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/peugeot/7.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/peugeot/8.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/peugeot/9.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/peugeot/10.jpg',
      ]},
      { collectionId: 'pourche', collectionName: 'pourche', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/pourche/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/pourche/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/pourche/3.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/pourche/4.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/pourche/5.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/pourche/6.jpg',
      ]},
      { collectionId: 'rangrover', collectionName: 'rangrover', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/rangrover/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/rangrover/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/rangrover/3.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/rangrover/4.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/rangrover/5.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/rangrover/6.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/rangrover/7.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/rangrover/8.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/rangrover/9.jpg',
      ]},
      { collectionId: 'skoda', collectionName: 'skoda', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/skoda/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/skoda/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/skoda/3.jpg',
      ]},
      { collectionId: 'tesla', collectionName: 'tesla', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/tesla/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/tesla/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/tesla/3.jpg',
      ]},
      { collectionId: 'volkswagen', collectionName: 'volkswagen', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/volkswagen/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/volkswagen/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/volkswagen/3.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/volkswagen/4.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/volkswagen/5.jpg',
      ]},
      { collectionId: 'bmw2', collectionName: 'bmw2', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/bmw2/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/bmw2/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/bmw2/3.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/bmw2/4.jpg',
      ]},
      { collectionId: 'jeep', collectionName: 'jeep', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/jeep/1.jpg',
      ]},
      { collectionId: 'mercedes2', collectionName: 'mercedes2', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes2/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes2/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes2/3.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes2/4.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes2/5.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes2/6.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes2/7.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes2/8.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes2/9.jpg',
      ]},
      { collectionId: 'mercedes3', collectionName: 'mercedes3', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes3/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes3/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes3/3.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes3/4.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes3/5.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes3/6.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes3/7.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes3/8.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes3/9.jpg',
      ]},
      { collectionId: 'mercedes4', collectionName: 'mercedes4', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes4/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes4/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes4/3.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes4/4.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes4/5.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes4/6.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes4/7.jpg',
      ]},
      { collectionId: 'mercedes5', collectionName: 'mercedes5', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes5/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes5/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes5/3.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes5/4.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes5/5.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes5/6.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/mercedes5/7.jpg',
      ]},
      { collectionId: 'volkswagen2', collectionName: 'volkswagen2', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/volkswagen2/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/volkswagen2/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/volkswagen2/3.jpg',
      ]},
      { collectionId: 'volkswagen3', collectionName: 'volkswagen3', images: [
        'https://meek-mermaid-ea40cf.netlify.app/gallery/volkswagen3/1.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/volkswagen3/2.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/volkswagen3/3.jpg',
        'https://meek-mermaid-ea40cf.netlify.app/gallery/volkswagen3/4.jpg',
      ]},
    ];

    this.galleryService.bulkSeedCollectionsAndImages(seedData).subscribe({
      next: () => {
        console.log('Seeding completed');
        this.loadGalleryImagesFromFirebase();
      },
      error: (e) => console.error('Seeding error:', e)
    });
  }

  private initializeGLightbox(): void {
    // Try to load GLightbox dynamically if not available
    if (typeof GLightbox === 'undefined') {
      // Try to import GLightbox
      import('glightbox').then((module) => {
        if (module.default) {
          this.initGLightbox(module.default);
        }
      }).catch((error) => {
        console.error('Error loading GLightbox:', error);
        // Try using window.GLightbox if available
        if ((window as any).GLightbox) {
          this.initGLightbox((window as any).GLightbox);
        }
      });
    } else {
      this.initGLightbox(GLightbox);
    }
  }
  
  private initGLightbox(GLightboxClass: any): void {
    try {
      // Destroy existing GLightbox instance if it exists
      if (window.glightbox) {
        try {
          window.glightbox.destroy();
        } catch (e) {
          console.warn('Error destroying existing lightbox:', e);
        }
      }
      
      // Initialize new GLightbox instance
      const lightbox = GLightboxClass({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        autoplayVideos: false,
        skin: 'modern',
        width: '90%',
        height: '90%',
        zoomable: true,
        draggable: true,
        dragToleranceX: 40,
        dragToleranceY: 65,
        preload: true,
        cssEfects: {
          fade: { in: 'fadeIn', out: 'fadeOut' },
          zoom: { in: 'zoomIn', out: 'zoomOut' }
        },
        onOpen: () => {
          console.log('GLightbox opened');
        },
        onClose: () => {
          console.log('GLightbox closed');
        }
      });
      
      // Store reference for cleanup
      window.glightbox = lightbox;
      console.log('GLightbox initialized successfully');
    } catch (error) {
      console.error('Error initializing GLightbox:', error);
    }
  }

  navigateToContact(serviceType: string): void {
    const contactUrl = `/contact?service=${encodeURIComponent(serviceType)}`;
    this.router.navigateByUrl(contactUrl);
  }
}

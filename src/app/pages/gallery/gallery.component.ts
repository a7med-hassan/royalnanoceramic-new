import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService } from '../../shared/services/translation.service';

declare var GLightbox: any;
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
  imports: [CommonModule],
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
      color: #ffd700;
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
      color: #ffd700;
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
          color: #ffd700;
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
      color: #ffd700;
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
    'assets/images/gallery/photo_2025-08-14_11-10-13.jpg',
    'assets/images/gallery/photo_2025-08-14_11-10-20.jpg',
    'assets/images/gallery/photo_2025-08-14_11-10-28.jpg',
    'assets/images/gallery/photo_2025-08-14_11-12-01.jpg',
    'assets/images/gallery/photo_2025-08-14_11-16-20.jpg',
    'assets/images/gallery/photo_2025-08-14_11-17-00.jpg',
    'assets/images/gallery/photo_2025-08-14_11-17-20.jpg',
    'assets/images/gallery/photo_2025-08-14_11-17-28.jpg',
    'assets/images/gallery/photo_2025-08-14_11-18-00.jpg',
    'assets/images/gallery/photo_2025-08-14_11-18-21.jpg',
    'assets/images/gallery/photo_2025-08-14_11-18-57.jpg',
    'assets/images/gallery/photo_2025-08-14_11-19-05.jpg',
    'assets/images/gallery/photo_2025-08-14_11-19-08.jpg',
    'assets/images/gallery/photo_2025-08-14_11-19-54.jpg',
    'assets/images/gallery/photo_2025-08-14_11-20-44.jpg',
    'assets/images/gallery/photo_2025-08-14_11-24-31.jpg'
  ];

  // Combined images (static + admin uploaded)
  images: string[] = [];

  featuredServices: FeaturedService[] = [
    {
      image: 'assets/images/gallery/photo_2025-08-14_11-10-13.jpg',
      title: 'حماية نانو سيراميك',
        description: 'حماية متقدمة للسيارة باستخدام تقنية النانو سيراميك',
      type: 'Nano Ceramic Coating'
    },
    {
      image: 'assets/images/gallery/photo_2025-08-14_11-10-20.jpg',
      title: 'حماية داخلية شاملة',
        description: 'معالجة شاملة للمقاعد والخامات الداخلية للسيارة',
      type: 'Interior Protection'
    },
    {
      image: 'assets/images/gallery/photo_2025-08-14_11-10-28.jpg',
      title: 'تفصيل احترافي',
        description: 'خدمة تنظيف وتجميل شاملة لاستعادة بريق السيارة',
      type: 'Professional Detailing'
    },
    {
      image: 'assets/images/gallery/photo_2025-08-14_11-12-01.jpg',
      title: 'حماية الطلاء',
      description: 'حماية فعالة للطلاء من الخدوش والعوامل الجوية',
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
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Load images from localStorage and static images
    this.loadGalleryImages();

    // Listen for gallery updates from admin panel
    window.addEventListener('galleryUpdated', this.handleGalleryUpdate);
    window.addEventListener('storage', this.handleStorageChange);
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    window.removeEventListener('galleryUpdated', this.handleGalleryUpdate);
    window.removeEventListener('storage', this.handleStorageChange);
  }

  private loadGalleryImages(): void {
    // Start with static images
    this.images = [...this.staticImages];
    
    // Load admin uploaded images from localStorage
    const savedImages = localStorage.getItem('galleryImages');
    if (savedImages) {
      try {
        const adminImages = JSON.parse(savedImages);
        // Filter only active images and extract src
        const activeAdminImages = adminImages
          .filter((img: any) => img.isActive !== false)
          .map((img: any) => img.src);
        
        // Add admin images to the gallery
        this.images = [...this.images, ...activeAdminImages];
      } catch (error) {
        console.error('Error loading admin images:', error);
      }
    }
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
    // Initialize Swiper
    setTimeout(() => {
      if (typeof Swiper !== 'undefined') {
        new Swiper('.featured-swiper', {
          slidesPerView: 1,
          spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      breakpoints: {
        768: {
              slidesPerView: 2,
          spaceBetween: 30,
        },
        1024: {
              slidesPerView: 3,
          spaceBetween: 40,
        },
      },
    });
  }
    }, 100);

    // Initialize GLightbox
    setTimeout(() => {
      this.initializeGLightbox();
    }, 200);
  }

  private initializeGLightbox(): void {
    if (typeof GLightbox !== 'undefined') {
      // Destroy existing GLightbox instance if it exists
      if (window.glightbox) {
        window.glightbox.destroy();
      }
      
      // Initialize new GLightbox instance
      const lightbox = GLightbox({
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
    }
  }

  navigateToContact(serviceType: string): void {
    const contactUrl = `/contact?service=${encodeURIComponent(serviceType)}`;
    this.router.navigateByUrl(contactUrl);
  }
}

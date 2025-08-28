import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard-overview.component.html',
  styleUrls: ['./admin-dashboard-overview.component.scss'],
})
export class AdminDashboardOverviewComponent implements OnInit {
  stats = {
    totalMessages: 0,
    contactMessages: 0,
    joinMessages: 0,
    totalServices: 0,
    totalGalleryImages: 0,
    totalBlogPosts: 0,
  };

  recentMessages: any[] = [];
  recentServices: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Load stats from localStorage or API
    this.loadMessageStats();
    this.loadServiceStats();
    this.loadGalleryStats();
    this.loadBlogStats();
    this.loadRecentData();
  }

  private loadMessageStats(): void {
    // Load contact messages
    const contactMessages = JSON.parse(
      localStorage.getItem('contactMessages') || '[]'
    );
    this.stats.contactMessages = contactMessages.length;

    // Load join messages
    const joinMessages = JSON.parse(
      localStorage.getItem('joinMessages') || '[]'
    );
    this.stats.joinMessages = joinMessages.length;

    this.stats.totalMessages =
      this.stats.contactMessages + this.stats.joinMessages;
  }

  private loadServiceStats(): void {
    // Load services from localStorage (admin created services)
    const adminServices = JSON.parse(localStorage.getItem('services') || '[]');

    // Real services from the website (4 main services)
    const realServices = [
      'Diamond Hybrid Plus',
      'Nano Pro Ceramic',
      'Diamond Glass',
      'Shield UltraCool',
    ];

    // Combine real services with admin services
    this.stats.totalServices = realServices.length + adminServices.length;
  }

  private loadGalleryStats(): void {
    // Load gallery images from localStorage (admin added images)
    const adminGalleryImages = JSON.parse(
      localStorage.getItem('galleryImages') || '[]'
    );

    // Real gallery images from the website (count from gallery component)
    // Based on the gallery component, there are 28 images after removing empty ones
    const realGalleryImagesCount = 28; // This represents the actual images in the gallery component

    // Combine real gallery images with admin images
    this.stats.totalGalleryImages =
      realGalleryImagesCount + adminGalleryImages.length;
  }

  private loadBlogStats(): void {
    // Load blog posts from localStorage (admin created posts)
    const adminBlogPosts = JSON.parse(
      localStorage.getItem('blog-posts') || '[]'
    );

    // Real blog posts from the website (3 default posts)
    const realBlogPosts = [
      'أفضل طرق حماية السيارات من الخدوش',
      'تقنيات النانو في تلميع السيارات',
      'دليل شامل لصيانة السيارات',
    ];

    // Combine real blog posts with admin posts
    this.stats.totalBlogPosts = realBlogPosts.length + adminBlogPosts.length;
  }

  private loadRecentData(): void {
    // Load recent messages
    const contactMessages = JSON.parse(
      localStorage.getItem('contactMessages') || '[]'
    );
    const joinMessages = JSON.parse(
      localStorage.getItem('joinMessages') || '[]'
    );

    this.recentMessages = [
      ...contactMessages
        .slice(-3)
        .map((msg: any) => ({ ...msg, type: 'Contact' })),
      ...joinMessages.slice(-3).map((msg: any) => ({ ...msg, type: 'Join' })),
    ]
      .sort(
        (a: any, b: any) =>
          new Date(b.timestamp || b.createdAt).getTime() -
          new Date(a.timestamp || a.createdAt).getTime()
      )
      .slice(0, 5);

    // Load recent services (combine real services with admin services)
    const adminServices = JSON.parse(localStorage.getItem('services') || '[]');

    // Real services from the website
    const realServices = [
      {
        title: 'Diamond Hybrid Plus',
        description: 'حماية سيراميك فائقة الجودة مع تقنية الهجين الماسي',
        category: 'premium',
        createdAt: '2024-01-01T10:00:00Z',
        isActive: true,
      },
      {
        title: 'Nano Pro Ceramic',
        description: 'طلاء سيراميك نانو احترافي لحماية شاملة',
        category: 'ceramic',
        createdAt: '2024-01-01T10:00:00Z',
        isActive: true,
      },
      {
        title: 'Diamond Glass',
        description: 'حماية زجاج متقدمة بتقنية الماس',
        category: 'glass',
        createdAt: '2024-01-01T10:00:00Z',
        isActive: true,
      },
      {
        title: 'Shield UltraCool',
        description: 'حماية متطورة مع تقنية التبريد الفائق',
        category: 'protection',
        createdAt: '2024-01-01T10:00:00Z',
        isActive: true,
      },
    ];

    // Combine and show recent services
    this.recentServices = [...realServices, ...adminServices].slice(-5);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

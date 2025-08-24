import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService } from '../../shared/services/translation.service';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  tags: string[];
  featured: boolean;
  seoKeywords: string[];
  seoDescription: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
})
export class BlogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentLang = 'ar';
  isRtl = false;

  allPosts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];
  featuredPost: BlogPost | null = null;
  selectedPost: BlogPost | null = null;
  searchTerm: string = '';
  currentCategory: string = 'all';
  postsPerPage: number = 12;
  currentPage: number = 1;
  hasMorePosts: boolean = true;
  newsletterEmail: string = '';

  constructor(
    private router: Router,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Get initial language and RTL settings
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;

    // Language initialized

    this.initializeBlogPosts();
    this.filterPosts();
    this.setFeaturedPost();

    // Auto-refresh dashboard posts every 30 seconds
    setInterval(() => {
      this.refreshDashboardPosts();
    }, 30000);
  }

  refreshBlogPosts(): void {
    this.initializeBlogPosts();
    this.filterPosts();
    this.setFeaturedPost();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeBlogPosts(): void {
    // Default posts from translation service
    const defaultPosts: BlogPost[] = [
      {
        id: 1,
        title: this.translationService.getTranslation('blog.post.1.title'),
        excerpt: this.translationService.getTranslation('blog.post.1.excerpt'),
        content: this.translationService.getTranslation('blog.post.1.excerpt'),
        image: 'assets/images/blog/close-up-car-care-process.jpg',
        category: this.translationService.getTranslation(
          'blog.post.1.category'
        ),
        date: '2024-01-15',
        readTime: this.translationService.getTranslation(
          'blog.post.1.readTime'
        ),
        tags: this.translationService
          .getTranslation('blog.post.1.tags')
          .split(',')
          .map((tag) => tag.trim()),
        featured: true,
        seoKeywords: this.translationService
          .getTranslation('blog.post.1.seoKeywords')
          .split(',')
          .map((keyword) => keyword.trim()),
        seoDescription: this.translationService.getTranslation(
          'blog.post.1.seoDescription'
        ),
      },
      {
        id: 2,
        title: this.translationService.getTranslation('blog.post.2.title'),
        excerpt: this.translationService.getTranslation('blog.post.2.excerpt'),
        content: this.translationService.getTranslation('blog.post.2.excerpt'),
        image:
          'assets/images/blog/male-worker-wrapping-car-with-ptotective-foil (1).jpg',
        category: this.translationService.getTranslation(
          'blog.post.2.category'
        ),
        date: '2024-01-10',
        readTime: this.translationService.getTranslation(
          'blog.post.2.readTime'
        ),
        tags: this.translationService
          .getTranslation('blog.post.2.tags')
          .split(',')
          .map((tag) => tag.trim()),
        featured: false,
        seoKeywords: this.translationService
          .getTranslation('blog.post.2.seoKeywords')
          .split(',')
          .map((keyword) => keyword.trim()),
        seoDescription: this.translationService.getTranslation(
          'blog.post.2.seoDescription'
        ),
      },
      {
        id: 3,
        title: this.translationService.getTranslation('blog.post.3.title'),
        excerpt: this.translationService.getTranslation('blog.post.3.excerpt'),
        content: this.translationService.getTranslation('blog.post.3.excerpt'),
        image: 'assets/images/blog/pexels-autorecords-10126663.jpg',
        category: this.translationService.getTranslation(
          'blog.post.3.category'
        ),
        date: '2024-01-05',
        readTime: this.translationService.getTranslation(
          'blog.post.3.readTime'
        ),
        tags: this.translationService
          .getTranslation('blog.post.3.tags')
          .split(',')
          .map((tag) => tag.trim()),
        featured: false,
        seoKeywords: this.translationService
          .getTranslation('blog.post.3.seoKeywords')
          .split(',')
          .map((keyword) => keyword.trim()),
        seoDescription: this.translationService.getTranslation(
          'blog.post.3.seoDescription'
        ),
      },
    ];

    // Load posts from localStorage (added from dashboard)
    const dashboardPosts: BlogPost[] = this.loadDashboardPosts();

    // Merge default posts with dashboard posts
    this.allPosts = [...defaultPosts, ...dashboardPosts];

    // Sort posts by date (newest first)
    this.allPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    console.log('📚 Blog posts loaded:', this.allPosts.length, 'total posts');
    console.log('📝 Dashboard posts:', dashboardPosts.length, 'posts');
  }

  /**
   * Load posts that were added from the dashboard
   */
  private loadDashboardPosts(): BlogPost[] {
    try {
      const storedPosts = localStorage.getItem('blog-posts');
      if (storedPosts) {
        const posts = JSON.parse(storedPosts);
        console.log('📖 Loaded dashboard posts from localStorage:', posts);
        return posts;
      }
    } catch (error) {
      console.error('❌ Error loading dashboard posts:', error);
    }
    return [];
  }

  /**
   * Refresh posts from localStorage (useful after adding new posts)
   */
  refreshDashboardPosts(): void {
    const dashboardPosts = this.loadDashboardPosts();
    const defaultPosts = this.allPosts.filter((post) => post.id <= 3); // Keep default posts
    this.allPosts = [...defaultPosts, ...dashboardPosts];
    this.allPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    this.filterPosts();
    this.setFeaturedPost();

    console.log(
      '🔄 Dashboard posts refreshed:',
      this.allPosts.length,
      'total posts'
    );
  }

  filterByCategory(category: string): void {
    this.currentCategory = category;
    this.currentPage = 1;
    this.filterPosts();

    // Update active category
    document.querySelectorAll('.category-card').forEach((card) => {
      card.classList.remove('active');
    });
    const target = event?.target as HTMLElement;
    target?.closest('.category-card')?.classList.add('active');
  }

  filterPosts(): void {
    let filtered = this.allPosts;

    // Filter by category
    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(
        (post) => post.category === this.currentCategory
      );
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt.toLowerCase().includes(searchLower) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    this.filteredPosts = filtered.slice(
      0,
      this.currentPage * this.postsPerPage
    );
    this.hasMorePosts = this.filteredPosts.length < filtered.length;
  }

  setFeaturedPost(): void {
    this.featuredPost =
      this.allPosts.find((post) => post.featured) || this.allPosts[0];
  }

  quickView(post: BlogPost): void {
    this.selectedPost = post;
  }

  closeQuickView(): void {
    this.selectedPost = null;
  }

  readFullPost(post: BlogPost): void {
    // In a real application, this would navigate to a full blog post page
    console.log('Reading full post:', post.title);
    // this.router.navigate(['/blog', post.id]);
  }

  loadMorePosts(): void {
    this.currentPage++;
    this.filterPosts();
  }

  subscribeNewsletter(): void {
    if (this.newsletterEmail.trim()) {
      console.log('Subscribing to newsletter:', this.newsletterEmail);
      // In a real application, this would send the email to your backend
      alert(this.translationService.getTranslation('blog.subscribe_success'));
      this.newsletterEmail = '';
    }
  }
}

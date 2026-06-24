import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TranslationService } from '../../shared/services/translation.service';
import { BlogService, BlogPost } from '../../shared/services/blog.service';
import { SchemaService } from '../../shared/services/schema.service';
import { SchemaDataService } from '../../shared/services/schema-data.service';
import * as lucide from 'lucide';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
})
export class BlogComponent implements OnInit, OnDestroy, AfterViewChecked {
  private destroy$ = new Subject<void>();

  currentLang = 'ar';
  isRtl = true;

  allPosts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];
  featuredPost: BlogPost | null = null;
  searchTerm = '';
  currentCategory = 'all';
  loading = false;

  categories: string[] = [];

  faqs = [
    { question: 'ما هو النانو سيراميك؟', answer: 'النانو سيراميك هو مادة سائلة شفافة توضع على طلاء السيارة لتشكل طبقة حماية صلبة تدوم طويلاً، تحمي من الخدوش الدقيقة، العوامل الجوية، والأشعة فوق البنفسجية.' },
    { question: 'كم تدوم طبقة النانو سيراميك على السيارة؟', answer: 'تعتمد المدة على نوع الطبقة والمنتج المستخدم وعنايتك بالسيارة، وتتراوح عادةً بين سنتين إلى 5 سنوات مع ضمان موثق.' },
    { question: 'هل يمنع النانو سيراميك الخدوش العميقة؟', answer: 'يحمي من الخدوش الدقيقة (Swirl marks)، لكنه لا يمنع الخدوش العميقة الناتجة عن الاحتكاك القوي أو الحوادث.' },
    { question: 'ما الفرق بين PPF والنانو سيراميك؟', answer: 'PPF طبقة بلاستيكية سميكة تحمي من الخدوش القوية، بينما النانو سيراميك يوفر لمعاناً زجاجياً وحماية من الكيماويات. يمكن دمجهما للحماية القصوى.' },
  ];
  activeFaqIndex: number | null = null;
  toggleFaq(i: number): void { this.activeFaqIndex = this.activeFaqIndex === i ? null : i; }

  constructor(
    private router: Router,
    public translationService: TranslationService,
    private blogService: BlogService,
    private schemaService: SchemaService,
    private schemaData: SchemaDataService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.currentLang === 'ar';

    this.schemaService.addSchema('blog-breadcrumb', this.schemaData.getBreadcrumbSchema([
      { name: 'Home', url: 'https://royalnanoceramic.com' },
      { name: 'Blog', url: 'https://royalnanoceramic.com/blog' },
    ]));

    this.translationService.languageChanged$.subscribe((lang: string) => {
      this.currentLang = lang;
      this.isRtl = lang === 'ar';
    });

    this.loadPosts();
  }

  ngAfterViewChecked(): void {
    // Icons now use FontAwesome, so no init needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.schemaService.removeSchema('blog-breadcrumb');
  }

  loadPosts(): void {
    this.loading = true;
    this.blogService.getPublishedPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          this.allPosts = posts;
          this.extractCategories();
          this.filterPosts();
          this.setFeaturedPost();
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
  }

  extractCategories(): void {
    const cats = new Set(this.allPosts.map(p => p.category).filter(Boolean));
    this.categories = Array.from(cats);
  }

  filterByCategory(cat: string): void {
    this.currentCategory = cat;
    this.filterPosts();
  }

  onSearch(): void { this.filterPosts(); }

  filterPosts(): void {
    let posts = this.allPosts;
    if (this.currentCategory !== 'all') {
      posts = posts.filter(p => p.category === this.currentCategory);
    }
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      posts = posts.filter(p => {
        const title = (this.getTitle(p) + ' ' + (p.titleEn || '')).toLowerCase();
        const excerpt = (this.getExcerpt(p) + ' ' + (p.excerptEn || '')).toLowerCase();
        return title.includes(q) || excerpt.includes(q);
      });
    }
    this.filteredPosts = posts;
  }

  setFeaturedPost(): void {
    this.featuredPost = this.allPosts.find(p => p.featured) || this.allPosts[0] || null;
  }

  getTitle(post: BlogPost): string {
    return (this.currentLang === 'ar' ? post.titleAr : post.titleEn) || post.title || '';
  }

  getExcerpt(post: BlogPost): string {
    return (this.currentLang === 'ar' ? post.excerptAr : post.excerptEn) || post.excerpt || '';
  }

  navigateToPost(post: BlogPost): void {
    const slug = post.slug || post.id;
    if (slug) this.router.navigate(['/blog', slug]);
  }

  getFormattedDate(d: any): string {
    try {
      const date = d?.toDate ? d.toDate() : new Date(d);
      return date.toLocaleDateString(this.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch { return ''; }
  }
}

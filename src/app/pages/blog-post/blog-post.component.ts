import { Component, OnInit, OnDestroy, HostListener, inject, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { Title, Meta } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { BlogService, BlogPost } from '../../shared/services/blog.service';
import { TranslationService } from '../../shared/services/translation.service';
import * as lucide from 'lucide';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss']
})
export class BlogPostComponent implements OnInit, OnDestroy, AfterViewChecked {
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private blogService = inject(BlogService);
  private translationService = inject(TranslationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  post: BlogPost | null = null;
  relatedPosts: BlogPost[] = [];
  prevPost: BlogPost | null = null;
  nextPost: BlogPost | null = null;
  safeContent: SafeHtml = '';
  safeVideoUrl: SafeResourceUrl | null = null;
  loading = true;
  error = '';
  readingProgress = 0;
  currentLang = 'ar';
  isRtl = true;

  faqs = [
    { question: 'ما هو النانو سيراميك؟', answer: 'النانو سيراميك هو مادة سائلة شفافة توضع على طلاء السيارة لتشكل طبقة حماية صلبة تدوم طويلاً، تحمي من الخدوش الدقيقة، العوامل الجوية، والأشعة فوق البنفسجية.' },
    { question: 'كم تدوم طبقة النانو سيراميك على السيارة؟', answer: 'تعتمد المدة على نوع الطبقة والمنتج المستخدم وعنايتك بالسيارة، وتتراوح عادةً بين سنتين إلى 5 سنوات مع ضمان موثق.' },
    { question: 'هل يمنع النانو سيراميك الخدوش العميقة؟', answer: 'يحمي من الخدوش الدقيقة (Swirl marks)، لكنه لا يمنع الخدوش العميقة الناتجة عن الاحتكاك القوي أو الحوادث.' },
    { question: 'ما الفرق بين PPF والنانو سيراميك؟', answer: 'PPF طبقة بلاستيكية سميكة تحمي من الخدوش القوية، بينما النانو سيراميك يوفر لمعاناً زجاجياً وحماية من الكيماويات. يمكن دمجهما للحماية القصوى.' },
    { question: 'هل يحتاج النانو سيراميك للصيانة؟', answer: 'نعم، يُنصح بغسل السيارة بانتظام باستخدام منتجات خاصة وتجنب مواد الغسيل القوية. بعض الطبقات تحتاج تطبيقاً سنوياً للحفاظ على خصائصها.' },
  ];
  activeFaqIndex: number | null = null;
  toggleFaq(i: number): void { this.activeFaqIndex = this.activeFaqIndex === i ? null : i; }

  ngOnInit(): void {
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.currentLang === 'ar';

    this.translationService.languageChanged$.subscribe((lang: string) => {
      this.currentLang = lang;
      this.isRtl = lang === 'ar';
      if (this.post) this.updateContent(this.post);
    });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const slug = params.get('slug');
      if (slug) this.loadPost(slug);
      else this.router.navigate(['/blog']);
    });
  }

  ngAfterViewChecked(): void {
    // Icons now use FontAwesome, so no init needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.readingProgress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
  }

  private loadPost(slugOrId: string): void {
    this.loading = true;
    this.error = '';

    this.blogService.getPostBySlugOrId(slugOrId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (post) => {
          if (!post) {
            this.error = this.isRtl ? 'المقال غير موجود' : 'Article not found';
            this.loading = false;
            return;
          }
          this.post = post;
          this.updateContent(post);
          this.updateSEO(post);
          this.loading = false;

          if (post.id) this.blogService.incrementViews(post.id).catch(() => {});
          this.loadRelatedPosts(post);
          window.scrollTo({ top: 0, behavior: 'instant' });
        },
        error: () => {
          this.error = this.isRtl ? 'حدث خطأ أثناء تحميل المقال' : 'Error loading article';
          this.loading = false;
        }
      });
  }

  private updateContent(post: BlogPost): void {
    const content = this.isRtl
      ? (post.contentAr || post.content || '')
      : (post.contentEn || post.content || '');
    this.safeContent = this.sanitizer.bypassSecurityTrustHtml(content);

    if (post.videoUrl) {
      const embedUrl = this.blogService.getYouTubeEmbedUrl(post.videoUrl);
      this.safeVideoUrl = embedUrl
        ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl)
        : null;
    }
  }

  private updateSEO(post: BlogPost): void {
    const title = this.getTitle(post);
    const description = (this.isRtl ? post.seoDescriptionAr : post.seoDescriptionEn)
      || (this.isRtl ? post.excerptAr : post.excerptEn)
      || post.excerpt || '';
    const canonicalUrl = `https://royalnanoceramic.com/blog/${post.slug || post.id}`;

    this.titleService.setTitle(`${title} | Royal Nano Ceramic`);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: post.image || '' });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
  }

  private loadRelatedPosts(current: BlogPost): void {
    this.blogService.getPublishedPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          // Related
          this.relatedPosts = posts
            .filter(p => p.id !== current.id && p.category === current.category)
            .slice(0, 3);
          // Prev / Next (by date order)
          const idx = posts.findIndex(p => p.id === current.id);
          this.nextPost = idx > 0 ? posts[idx - 1] : null;
          this.prevPost = idx < posts.length - 1 ? posts[idx + 1] : null;
        },
        error: () => { this.relatedPosts = []; }
      });
  }

  getTitle(post: BlogPost): string {
    return (this.isRtl ? post.titleAr : post.titleEn) || post.title || '';
  }

  getExcerpt(post: BlogPost): string {
    return (this.isRtl ? post.excerptAr : post.excerptEn) || post.excerpt || '';
  }

  getFormattedDate(d: any): string {
    try {
      const date = d?.toDate ? d.toDate() : new Date(d);
      return date.toLocaleDateString(this.isRtl ? 'ar-SA' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return '';
    }
  }

  goBack(): void {
    this.router.navigate(['/blog']);
  }

  copyLink(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert(this.isRtl ? 'تم نسخ الرابط بنجاح!' : 'Link copied successfully!');
    }).catch(() => {
      alert(this.isRtl ? 'فشل نسخ الرابط.' : 'Failed to copy link.');
    });
  }

  sharePost(): void {
    if (navigator.share) {
      navigator.share({
        title: this.getTitle(this.post!),
        text: this.getExcerpt(this.post!),
        url: window.location.href
      }).catch(console.error);
    } else {
      this.copyLink();
    }
  }

  navigateToPost(post: BlogPost): void {
    const slug = post.slug || post.id;
    if (slug) {
      this.router.navigate(['/blog', slug]);
    }
  }
}

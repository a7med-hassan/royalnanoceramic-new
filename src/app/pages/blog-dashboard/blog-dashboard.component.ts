import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { BlogService, BlogPost } from '../../shared/services/blog.service';
import { AuthService } from '../../shared/services/auth.service';
import * as lucide from 'lucide';

type ActiveTab = 'editor' | 'manage';
type ContentLang = 'ar' | 'en';

@Component({
  selector: 'app-blog-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './blog-dashboard.component.html',
  styleUrls: ['./blog-dashboard.component.scss'],
})
export class BlogDashboardComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('editorAr') editorArRef!: ElementRef<HTMLDivElement>;
  @ViewChild('editorEn') editorEnRef!: ElementRef<HTMLDivElement>;

  private destroy$ = new Subject<void>();

  // ── UI State ──────────────────────────────────────────────────────────
  activeTab: ActiveTab = 'editor';
  contentLang: ContentLang = 'ar';
  isSubmitting = false;
  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  showPreviewAr = false;
  showPreviewEn = false;
  previewHtmlAr: SafeHtml = '';
  previewHtmlEn: SafeHtml = '';
  isEditorArInvalid = false;
  isEditorEnInvalid = false;
  slugTaken = false;
  slugChecking = false;
  imagePreviewUrl = '';
  videoEmbedUrl: SafeHtml | null = null;
  deleteConfirmId: string | null = null;

  // ── Edit mode ─────────────────────────────────────────────────────────
  isEditMode = false;
  editingPostId: string | null = null;

  // ── Data ─────────────────────────────────────────────────────────────
  existingPosts: BlogPost[] = [];
  stats = { total: 0, published: 0, draft: 0, featured: 0, totalViews: 0 };
  currentUsername = '';
  adminUser: any = null;

  categories = [
    'تقنيات متطورة',
    'صيانة السيارات',
    'تنظيف السيارات',
    'سيارات فاخرة',
    'تقنيات النانو',
    'عناية السيارات',
    'حماية الطلاء',
    'أفلام الحماية',
  ];

  blogForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private blogService: BlogService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.blogForm = this.fb.group({
      slug:            ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      titleAr:         ['', [Validators.required, Validators.minLength(5)]],
      titleEn:         ['', [Validators.required, Validators.minLength(5)]],
      excerptAr:       ['', [Validators.required, Validators.minLength(20)]],
      excerptEn:       ['', [Validators.required, Validators.minLength(20)]],
      contentAr:       ['', [Validators.required]],
      contentEn:       ['', [Validators.required]],
      image:           ['', Validators.required],
      hasVideo:        [false],
      videoUrl:        [''],
      category:        ['', Validators.required],
      tags:            [''],
      seoDescriptionAr:['', [Validators.minLength(50)]],
      seoDescriptionEn:['', [Validators.minLength(50)]],
      seoKeywords:     [''],
      readTime:        ['5 دقائق'],
      featured:        [false],
      published:       [true],
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/admin']);
      return;
    }
    this.adminUser = this.authService.getCurrentUser();
    this.currentUsername = this.adminUser?.name || 'Admin';
    this.loadPosts();

    // Auto-generate slug from English title
    this.blogForm.get('titleEn')?.valueChanges.subscribe(val => {
      if (!this.isEditMode && !this.blogForm.get('slug')?.dirty) {
        const slug = this.blogService.generateSlug(val || '');
        this.blogForm.get('slug')?.setValue(slug, { emitEvent: false });
      }
    });

    // Clear video URL when toggle is disabled
    this.blogForm.get('hasVideo')?.valueChanges.subscribe(hasVideo => {
      if (!hasVideo) {
        this.blogForm.get('videoUrl')?.setValue('');
        this.videoEmbedUrl = null;
      }
    });
  }

  ngAfterViewChecked(): void {
    // Icons now use FontAwesome, so no init needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Tab navigation ───────────────────────────────────────────────────

  setTab(tab: ActiveTab): void {
    this.activeTab = tab;
    if (tab === 'manage') this.loadPosts();
  }

  setContentLang(lang: ContentLang): void {
    this.contentLang = lang;
  }

  // ── Rich Editor ──────────────────────────────────────────────────────

  getActiveEditor(): HTMLDivElement | null {
    return this.contentLang === 'ar'
      ? this.editorArRef?.nativeElement || null
      : this.editorEnRef?.nativeElement || null;
  }

  execFormat(command: string, value?: string): void {
    const editor = this.getActiveEditor();
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, value);
    this.syncContent();
  }

  insertHeading(level: number): void {
    this.execFormat('formatBlock', `H${level}`);
  }

  insertImage(): void {
    const url = prompt(this.contentLang === 'ar' ? 'أدخل رابط الصورة (URL):' : 'Enter image URL:');
    if (url) {
      const imgHtml = `<img src="${url}" alt="image" style="max-width:100%; border-radius:8px; margin:1.5rem 0; border:1px solid rgba(197,160,89,0.15);" />`;
      this.execFormat('insertHTML', imgHtml);
    }
  }

  insertVideo(): void {
    const url = prompt(this.contentLang === 'ar' ? 'أدخل رابط يوتيوب (YouTube URL):' : 'Enter YouTube URL:');
    if (url) {
      const embedUrl = this.blogService.getYouTubeEmbedUrl(url);
      if (embedUrl) {
        const iframeHtml = `
          <div style="margin: 2rem 0; border-radius: 12px; overflow: hidden; position: relative; aspect-ratio: 16/9; background: #111; border: 1px solid rgba(197, 160, 89, 0.15);">
            <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen loading="lazy"></iframe>
          </div><p><br></p>`;
        this.execFormat('insertHTML', iframeHtml);
      } else {
        alert(this.contentLang === 'ar' ? 'رابط يوتيوب غير صحيح.' : 'Invalid YouTube URL.');
      }
    }
  }

  syncContent(): void {
    if (this.editorArRef) {
      const htmlAr = this.editorArRef.nativeElement.innerHTML;
      this.blogForm.get('contentAr')?.setValue(htmlAr);
      this.isEditorArInvalid = false;
    }
    if (this.editorEnRef) {
      const htmlEn = this.editorEnRef.nativeElement.innerHTML;
      this.blogForm.get('contentEn')?.setValue(htmlEn);
      this.isEditorEnInvalid = false;
    }
  }

  togglePreview(lang: ContentLang): void {
    if (lang === 'ar') {
      this.showPreviewAr = !this.showPreviewAr;
      if (this.showPreviewAr) {
        this.previewHtmlAr = this.sanitizer.bypassSecurityTrustHtml(this.blogForm.value.contentAr || '');
      }
    } else {
      this.showPreviewEn = !this.showPreviewEn;
      if (this.showPreviewEn) {
        this.previewHtmlEn = this.sanitizer.bypassSecurityTrustHtml(this.blogForm.value.contentEn || '');
      }
    }
  }

  // ── Inputs & Previews ────────────────────────────────────────────────

  get slugPreview(): string {
    const val = this.blogForm.get('slug')?.value;
    return val ? `https://royalnanoceramic.com/blog/${val}` : '';
  }

  onSlugInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const clean = input.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    this.blogForm.get('slug')?.setValue(clean, { emitEvent: false });
    this.checkSlug();
  }

  checkSlug(): void {
    const slug = this.blogForm.get('slug')?.value;
    if (!slug || this.blogForm.get('slug')?.invalid) return;

    this.slugChecking = true;
    this.blogService.checkSlugExists(slug).subscribe({
      next: (exists) => {
        // If edit mode and slug matches current post, it's fine
        const isSameAsCurrent = this.isEditMode && slug === this.existingPosts.find(p => p.id === this.editingPostId)?.slug;
        this.slugTaken = exists && !isSameAsCurrent;
        this.slugChecking = false;
      },
      error: () => {
        this.slugChecking = false;
      }
    });
  }

  onImageUrlChange(event: Event): void {
    this.imagePreviewUrl = (event.target as HTMLInputElement).value;
  }

  onVideoUrlChange(event: Event): void {
    const url = (event.target as HTMLInputElement).value;
    if (!url) {
      this.videoEmbedUrl = null;
      return;
    }
    const embedUrl = this.blogService.getYouTubeEmbedUrl(url);
    if (embedUrl) {
      this.videoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {
      this.videoEmbedUrl = null;
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.blogForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // ── Post Management ──────────────────────────────────────────────────

  loadPosts(): void {
    this.loading = true;
    this.blogService.getAllPosts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (posts) => {
          this.existingPosts = posts;
          this.calculateStats();
          this.loading = false;
        },
        error: () => {
          this.showMessage('خطأ في تحميل المقالات', 'error');
          this.loading = false;
        }
      });
  }

  calculateStats(): void {
    this.stats = {
      total: this.existingPosts.length,
      published: this.existingPosts.filter(p => p.published).length,
      draft: this.existingPosts.filter(p => !p.published).length,
      featured: this.existingPosts.filter(p => p.featured).length,
      totalViews: this.existingPosts.reduce((acc, p) => acc + (p.views || 0), 0)
    };
  }

  getFormattedDate(d: any): string {
    try {
      const date = d?.toDate ? d.toDate() : new Date(d);
      return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  getPostTitle(post: BlogPost): string {
    return post.titleAr || post.titleEn || post.title || 'بدون عنوان';
  }

  togglePublish(post: BlogPost): void {
    if (!post.id) return;
    this.blogService.updatePost(post.id, { published: !post.published }).subscribe(() => {
      this.showMessage(`تم ${!post.published ? 'نشر' : 'إلغاء نشر'} المقال`, 'success');
    });
  }

  toggleFeatured(post: BlogPost): void {
    if (!post.id) return;
    this.blogService.updatePost(post.id, { featured: !post.featured }).subscribe(() => {
      this.showMessage(`تم ${!post.featured ? 'تمييز' : 'إلغاء تمييز'} المقال`, 'success');
    });
  }

  confirmDelete(id: string): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deletePost(id: string): void {
    this.blogService.deletePost(id).subscribe({
      next: () => {
        this.showMessage('تم حذف المقال بنجاح', 'success');
        this.deleteConfirmId = null;
      },
      error: () => {
        this.showMessage('حدث خطأ أثناء الحذف', 'error');
      }
    });
  }

  editPost(post: BlogPost): void {
    this.isEditMode = true;
    this.editingPostId = post.id || null;
    this.activeTab = 'editor';
    this.contentLang = 'ar';

    this.blogForm.patchValue({
      slug: post.slug || '',
      titleAr: post.titleAr || post.title || '',
      titleEn: post.titleEn || '',
      excerptAr: post.excerptAr || post.excerpt || '',
      excerptEn: post.excerptEn || '',
      contentAr: post.contentAr || post.content || '',
      contentEn: post.contentEn || '',
      image: post.image || '',
      hasVideo: post.hasVideo || !!post.videoUrl || false,
      videoUrl: post.videoUrl || '',
      category: post.category || '',
      tags: post.tags ? post.tags.join(', ') : '',
      seoDescriptionAr: post.seoDescriptionAr || '',
      seoDescriptionEn: post.seoDescriptionEn || '',
      seoKeywords: post.seoKeywords ? post.seoKeywords.join(', ') : '',
      readTime: post.readTime || '5 دقائق',
      featured: post.featured || false,
      published: post.published !== false,
    });

    this.imagePreviewUrl = post.image || '';
    if (post.videoUrl) {
      const embedUrl = this.blogService.getYouTubeEmbedUrl(post.videoUrl);
      this.videoEmbedUrl = embedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl) : null;
    } else {
      this.videoEmbedUrl = null;
    }

    setTimeout(() => {
      if (this.editorArRef) this.editorArRef.nativeElement.innerHTML = post.contentAr || post.content || '';
      if (this.editorEnRef) this.editorEnRef.nativeElement.innerHTML = post.contentEn || '';
    }, 100);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.editingPostId = null;
    this.blogForm.reset({
      readTime: '5 دقائق',
      featured: false,
      published: true
    });
    this.imagePreviewUrl = '';
    this.videoEmbedUrl = null;
    this.slugTaken = false;
    if (this.editorArRef) this.editorArRef.nativeElement.innerHTML = '';
    if (this.editorEnRef) this.editorEnRef.nativeElement.innerHTML = '';
  }

  // ── Submit ───────────────────────────────────────────────────────────

  onSubmit(): void {
    this.syncContent();

    if (!this.blogForm.get('contentAr')?.value) this.isEditorArInvalid = true;
    if (!this.blogForm.get('contentEn')?.value) this.isEditorEnInvalid = true;

    if (this.blogForm.invalid || this.slugTaken || this.isEditorArInvalid || this.isEditorEnInvalid) {
      this.blogForm.markAllAsTouched();
      this.showMessage('يرجى ملء جميع الحقول المطلوبة بشكل صحيح', 'error');
      return;
    }

    this.isSubmitting = true;
    const formVal = this.blogForm.value;

    const newPost: BlogPost = {
      slug: formVal.slug,
      title: formVal.titleAr, // Fallback
      titleAr: formVal.titleAr,
      titleEn: formVal.titleEn,
      excerpt: formVal.excerptAr, // Fallback
      excerptAr: formVal.excerptAr,
      excerptEn: formVal.excerptEn,
      content: formVal.contentAr, // Fallback
      contentAr: formVal.contentAr,
      contentEn: formVal.contentEn,
      image: formVal.image,
      hasVideo: formVal.hasVideo,
      videoUrl: formVal.hasVideo ? formVal.videoUrl : '',
      category: formVal.category,
      tags: formVal.tags ? formVal.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      seoDescriptionAr: formVal.seoDescriptionAr,
      seoDescriptionEn: formVal.seoDescriptionEn,
      seoKeywords: formVal.seoKeywords ? formVal.seoKeywords.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      readTime: formVal.readTime,
      featured: formVal.featured,
      published: formVal.published,
      author: this.currentUsername,
      authorId: this.adminUser?.uid || 'admin',
      date: new Date().toISOString().split('T')[0],
    };

    if (this.isEditMode && this.editingPostId) {
      this.blogService.updatePost(this.editingPostId, newPost).subscribe({
        next: () => {
          this.showMessage('تم تحديث المقال بنجاح', 'success');
          this.isSubmitting = false;
          this.setTab('manage');
        },
        error: (err) => {
          console.error(err);
          this.showMessage('خطأ في التحديث', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      newPost.views = 0;
      this.blogService.createPost(newPost, formVal.slug).subscribe({
        next: () => {
          this.showMessage('تم إنشاء المقال بنجاح', 'success');
          this.isSubmitting = false;
          this.cancelEdit();
          this.setTab('manage');
        },
        error: (err) => {
          console.error(err);
          this.showMessage('خطأ في الإنشاء', 'error');
          this.isSubmitting = false;
        }
      });
    }
  }

  // ── Utils ────────────────────────────────────────────────────────────

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => { this.message = ''; }, 4000);
  }

  logout(): void {
    this.authService.signOut().then(() => this.router.navigate(['/admin']));
  }

  navigateToBlog(): void {
    window.open('/blog', '_blank');
  }

  trackByPostId(index: number, post: BlogPost): string {
    return post.id || index.toString();
  }
}

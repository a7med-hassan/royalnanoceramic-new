import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AdminApiService } from '../../shared/services/admin-api.service';

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
  selector: 'app-blog-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './blog-dashboard.component.html',
  styleUrls: ['./blog-dashboard.component.scss'],
})
export class BlogDashboardComponent implements OnInit {
  blogForm: FormGroup;
  isSubmitting = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  currentUsername = '';
  loginTime = '';
  adminUser: any = null;
  existingPosts: any[] = [];
  selectedPosts: string[] = [];
  showPostsPopup = false;

  // Sample categories for the dropdown
  categories = [
    'تقنيات متطورة',
    'صيانة السيارات',
    'تنظيف السيارات',
    'سيارات فاخرة',
    'تقنيات النانو',
    'عناية السيارات',
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private adminApiService: AdminApiService
  ) {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      excerpt: ['', [Validators.required, Validators.minLength(20)]],
      content: ['', [Validators.required, Validators.minLength(100)]],
      category: ['', Validators.required],
      image: ['', Validators.required],
      readTime: ['', Validators.required],
      tags: ['', Validators.required],
      seoKeywords: ['', Validators.required],
      seoDescription: ['', [Validators.required, Validators.minLength(50)]],
      featured: [false],
    });
  }

  ngOnInit(): void {
    // Check if user is logged in to admin system
    const isLoggedIn = this.adminApiService.isLoggedIn();
    if (!isLoggedIn) {
      this.router.navigate(['/admin']);
      return;
    }

    // Get user information
    this.adminUser = this.adminApiService.getCurrentAdmin();
    this.currentUsername = this.adminUser ? this.adminUser.username : 'Admin';
    this.loginTime = this.formatLoginTime(new Date().toISOString());

    // Load existing posts
    this.loadExistingPosts();
  }

  /**
   * تحميل المنشورات الموجودة
   */
  loadExistingPosts(): void {
    try {
      // تحميل المنشورات من localStorage
      const postsData = localStorage.getItem('blog-posts');
      let dashboardPosts: any[] = [];

      if (postsData) {
        dashboardPosts = JSON.parse(postsData);
        console.log('📝 Dashboard posts:', dashboardPosts);
      }

      // إضافة المنشورات القديمة
      const defaultPosts = [
        {
          id: 'default-1',
          title: 'أفضل طرق حماية السيارات من الخدوش',
          excerpt:
            'تعرف على أحدث التقنيات المستخدمة في حماية السيارات من الخدوش والتلف',
          content: 'محتوى كامل عن حماية السيارات...',
          image: 'assets/images/blog/close-up-car-care-process.jpg',
          category: 'حماية السيارات',
          date: new Date('2024-01-15'),
          readTime: '5 دقائق',
          tags: ['حماية', 'سيارات', 'تقنيات'],
          seoKeywords: 'حماية السيارات, خدوش, تقنيات',
          seoDescription:
            'أفضل طرق حماية السيارات من الخدوش والتلف باستخدام أحدث التقنيات',
          featured: true,
        },
        {
          id: 'default-2',
          title: 'تقنيات النانو في تلميع السيارات',
          excerpt: 'اكتشف كيف تستخدم تقنيات النانو في تلميع وحماية السيارات',
          content: 'محتوى كامل عن تقنيات النانو...',
          image:
            'assets/images/blog/male-worker-wrapping-car-with-ptotective-foil (1).jpg',
          category: 'تقنيات النانو',
          date: new Date('2024-01-10'),
          readTime: '7 دقائق',
          tags: ['نانو', 'تلميع', 'تقنيات'],
          seoKeywords: 'تقنيات النانو, تلميع السيارات, حماية',
          seoDescription:
            'اكتشف أحدث تقنيات النانو المستخدمة في تلميع وحماية السيارات',
          featured: false,
        },
        {
          id: 'default-3',
          title: 'دليل شامل لصيانة السيارات',
          excerpt: 'دليل شامل لصيانة السيارات والحفاظ على مظهرها الجديد',
          content: 'محتوى كامل عن صيانة السيارات...',
          image: 'assets/images/blog/pexels-autorecords-10126663.jpg',
          category: 'صيانة السيارات',
          date: new Date('2024-01-05'),
          readTime: '10 دقائق',
          tags: ['صيانة', 'سيارات', 'دليل'],
          seoKeywords: 'صيانة السيارات, دليل, حماية',
          seoDescription: 'دليل شامل لصيانة السيارات والحفاظ على مظهرها الجديد',
          featured: true,
        },
        {
          id: 'default-4',
          title: 'أهمية الحماية الوقائية للسيارات',
          excerpt: 'لماذا تعتبر الحماية الوقائية مهمة جداً لسيارتك',
          content: 'محتوى كامل عن الحماية الوقائية...',
          image: 'assets/images/blog/pexels-dimkidama-14908957.jpg',
          category: 'نصائح',
          date: new Date('2024-01-01'),
          readTime: '6 دقائق',
          tags: ['نصائح', 'حماية', 'وقائية'],
          seoKeywords: 'حماية وقائية, سيارات, نصائح',
          seoDescription:
            'اكتشف أهمية الحماية الوقائية للسيارات وكيف تحافظ على سيارتك',
          featured: false,
        },
      ];

      // دمج المنشورات مع ترتيب حسب التاريخ (الأحدث أولاً)
      this.existingPosts = [...dashboardPosts, ...defaultPosts].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      console.log('📝 Total posts loaded:', this.existingPosts.length);
    } catch (error) {
      console.error('❌ Error loading posts:', error);
      this.existingPosts = [];
    }
  }

  /**
   * Delete a blog post
   */
  deletePost(postId: number): void {
    const post = this.existingPosts.find((p) => p.id === postId);
    const postTitle = post ? post.title : 'هذا المنشور';

    const confirmMessage = `
🚨 تأكيد الحذف 🚨

هل أنت متأكد من حذف المنشور:
"${postTitle}"؟

⚠️  تحذير مهم:
• لا يمكن استرجاع المنشور بعد الحذف
• سيتم حذفه نهائياً من النظام
• لا يمكن التراجع عن هذه العملية

اكتب "نعم" للتأكيد أو اضغط "إلغاء" للتراجع
    `;

    const userConfirmation = prompt(confirmMessage);

    if (userConfirmation && userConfirmation.trim().toLowerCase() === 'نعم') {
      try {
        // Remove post from array
        this.existingPosts = this.existingPosts.filter(
          (post) => post.id !== postId
        );

        // Update localStorage
        localStorage.setItem('blog-posts', JSON.stringify(this.existingPosts));

        this.message = `✅ تم حذف "${postTitle}" بنجاح!`;
        this.messageType = 'success';

        console.log('🗑️ Post deleted:', postId, postTitle);
        console.log('📝 Remaining posts:', this.existingPosts.length);

        // Clear message after 6 seconds
        setTimeout(() => {
          this.message = '';
        }, 6000);
      } catch (error) {
        console.error('❌ Error deleting post:', error);
        this.message = '❌ حدث خطأ أثناء حذف المنشور';
        this.messageType = 'error';

        setTimeout(() => {
          this.message = '';
        }, 6000);
      }
    } else {
      console.log('🚫 Post deletion cancelled by user');
    }
  }

  /**
   * حذف جميع المنشورات
   */
  deleteAllPosts(): void {
    if (this.existingPosts.length === 0) {
      this.message = 'لا توجد منشورات للحذف';
      this.messageType = 'error';
      return;
    }

    const confirmMessage = `هل أنت متأكد من حذف جميع المنشورات (${this.existingPosts.length} منشور)؟\nاكتب "نعم" للتأكيد:`;
    const userInput = prompt(confirmMessage);

    if (userInput === 'نعم') {
      try {
        // حذف جميع المنشورات من localStorage
        localStorage.removeItem('dashboardPosts');
        this.existingPosts = [];

        this.message = `✅ تم حذف جميع المنشورات بنجاح! (${this.existingPosts.length} منشور)`;
        this.messageType = 'success';

        console.log('🗑️ All posts deleted successfully');

        // إخفاء الرسالة بعد 6 ثواني
        setTimeout(() => {
          this.message = '';
        }, 6000);
      } catch (error) {
        console.error('❌ Error deleting all posts:', error);
        this.message = '❌ حدث خطأ أثناء حذف جميع المنشورات';
        this.messageType = 'error';
      }
    } else {
      this.message = 'تم إلغاء عملية الحذف';
      this.messageType = 'error';

      setTimeout(() => {
        this.message = '';
      }, 3000);
    }
  }

  /**
   * Get formatted date for display
   */
  getFormattedDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  private formatLoginTime(loginTime: string): string {
    if (!loginTime) return '';

    try {
      const date = new Date(loginTime);
      return date.toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return loginTime;
    }
  }

  onSubmit(): void {
    if (this.blogForm.valid) {
      this.isSubmitting = true;
      this.message = '';

      const formData = this.blogForm.value;

      // Create new blog post
      const newPost: BlogPost = {
        id: Date.now(), // Simple ID generation
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        image: formData.image,
        category: formData.category,
        date: new Date().toISOString().split('T')[0],
        readTime: formData.readTime,
        tags: formData.tags.split(',').map((tag: string) => tag.trim()),
        featured: formData.featured,
        seoKeywords: formData.seoKeywords
          .split(',')
          .map((keyword: string) => keyword.trim()),
        seoDescription: formData.seoDescription,
      };

      // Save blog post
      setTimeout(() => {
        // Store in localStorage for demo purposes
        const existingPosts = JSON.parse(
          localStorage.getItem('blog-posts') || '[]'
        );
        existingPosts.push(newPost);
        localStorage.setItem('blog-posts', JSON.stringify(existingPosts));

        // Update the existing posts list
        this.existingPosts = existingPosts;

        this.message =
          'تم إضافة المنشور بنجاح! يمكنك الآن عرضه في صفحة المدونة.';
        this.messageType = 'success';
        this.isSubmitting = false;

        // Reset form
        this.blogForm.reset();
        this.blogForm.patchValue({ featured: false });

        // Clear message after 5 seconds
        setTimeout(() => {
          this.message = '';
        }, 5000);
      }, 1000);
    } else {
      this.markFormGroupTouched();
      this.message = 'يرجى ملء جميع الحقول المطلوبة';
      this.messageType = 'error';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.blogForm.controls).forEach((key) => {
      const control = this.blogForm.get(key);
      control?.markAsTouched();
    });
  }

  onImageUrlChange(event: any): void {
    const url = event.target.value;
    if (url) {
      // You can add image validation here
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.blogForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `يجب أن يكون الطول على الأقل ${requiredLength} حروف`;
      }
    }
    return '';
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.blogForm.get(controlName);
    return !!(control?.invalid && control.touched);
  }

  goToBlog(): void {
    this.router.navigate(['/blog']);
  }

  logout(): void {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    this.router.navigate(['/admin']);
  }

  /**
   * Track function for ngFor directive
   */
  trackByPostId(index: number, post: BlogPost): number {
    return post.id;
  }

  /**
   * تحديد جميع المنشورات
   */
  selectAllPosts(): void {
    this.selectedPosts = this.existingPosts.map((post) => post.id);
    console.log('📋 All posts selected:', this.selectedPosts.length);
  }

  /**
   * إلغاء تحديد جميع المنشورات
   */
  deselectAllPosts(): void {
    this.selectedPosts = [];
    console.log('📋 All posts deselected');
  }

  /**
   * تبديل اختيار منشور
   */
  togglePostSelection(postId: string): void {
    const index = this.selectedPosts.indexOf(postId);
    if (index > -1) {
      this.selectedPosts.splice(index, 1);
    } else {
      this.selectedPosts.push(postId);
    }
    console.log('📋 Selected posts:', this.selectedPosts);
  }

  /**
   * حذف المنشورات المحددة
   */
  deleteSelectedPosts(): void {
    if (this.selectedPosts.length === 0) {
      this.message = 'الرجاء تحديد المنشورات المراد حذفها';
      this.messageType = 'error';
      return;
    }

    const confirmMessage = `هل أنت متأكد من حذف ${this.selectedPosts.length} منشور محدد؟\nاكتب "نعم" للتأكيد:`;
    const userInput = prompt(confirmMessage);

    if (userInput === 'نعم') {
      try {
        // حذف المنشورات المحددة من localStorage
        const remainingPosts = this.existingPosts.filter(
          (post) => !this.selectedPosts.includes(post.id)
        );

        localStorage.setItem('blog-posts', JSON.stringify(remainingPosts));
        this.existingPosts = remainingPosts;
        this.selectedPosts = [];

        this.message = `✅ تم حذف ${this.selectedPosts.length} منشور بنجاح!`;
        this.messageType = 'success';

        console.log('🗑️ Selected posts deleted successfully');

        // إخفاء الرسالة بعد 6 ثواني
        setTimeout(() => {
          this.message = '';
        }, 6000);
      } catch (error) {
        console.error('❌ Error deleting selected posts:', error);
        this.message = '❌ حدث خطأ أثناء حذف المنشورات المحددة';
        this.messageType = 'error';
      }
    } else {
      this.message = 'تم إلغاء عملية الحذف';
      this.messageType = 'error';

      setTimeout(() => {
        this.message = '';
      }, 3000);
    }
  }

  /**
   * فتح النافذة المنبثقة لعرض المنشورات
   */
  openPostsPopup(): void {
    this.showPostsPopup = true;
    this.loadExistingPosts();
    // منع التمرير في الخلفية
    document.body.style.overflow = 'hidden';
  }

  /**
   * إغلاق النافذة المنبثقة
   */
  closePostsPopup(): void {
    this.showPostsPopup = false;
    // إعادة التمرير
    document.body.style.overflow = 'auto';
  }
}

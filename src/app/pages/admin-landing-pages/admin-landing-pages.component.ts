import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { LandingPageService, LandingPage } from '../../shared/services/landing-page.service';

@Component({
  selector: 'app-admin-landing-pages',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-landing-pages.component.html',
  styleUrls: ['./admin-landing-pages.component.scss']
})
export class AdminLandingPagesComponent implements OnInit, OnDestroy {
  landingPages: LandingPage[] = [];
  loading = true;
  showForm = false;
  editingPage: LandingPage | null = null;
  pageForm: FormGroup;
  private subscription: Subscription = new Subscription();

  constructor(
    private landingPageService: LandingPageService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.pageForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadLandingPages();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      title: ['', [Validators.required]],
      subtitle: ['', [Validators.required]],
      description: ['', [Validators.required]],
      image: ['', [Validators.required]],
      original_price: [0, [Validators.min(0)]],
      discount_price: [0, [Validators.min(0)]],
      discount_percent: [0, [Validators.min(0), Validators.max(100)]],
      video_url: [''],
      expires_at: [''],
      whatsapp_number: [''],
      features: [''],
      active: [true],
      
      // Section Visibility Controls
      show_pricing: [true],
      show_features: [true],
      show_contact: [true],
      show_cta_buttons: [true],
      show_image: [true],
      show_video: [true],
      
      // Contact Form Settings
      contact_form_enabled: [false],
      contact_form_full_name: [true],
      contact_form_mobile: [true],
      contact_form_service_type: [true],
      contact_form_car_type: [true],
      contact_form_car_model: [true],
      contact_form_notes: [true],
      contact_form_submit_text: ['إرسال الرسالة'],
      contact_form_success_message: ['تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'],
      
      // Styling Settings
      primary_color: ['#007bff'],
      secondary_color: ['#6c757d'],
      accent_color: ['#28a745'],
      background_gradient: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)'],
      font_family: ['Cairo'],
      button_style: ['rounded'],
      layout_style: ['modern'],
      
      // Booking Settings
      booking_total_slots: [20],
      booking_booked_slots: [12],
      booking_show_count: [true],
      booking_message: ['تم حجز 12/20 – باقي 8 فقط'],
      
      // Mobile Optimization Settings
      mobile_optimized: [true],
      fullscreen_mobile: [true],
      responsive_design: [true]
    });
  }

  private loadLandingPages(): void {
    this.subscription.add(
      this.landingPageService.getAllLandingPages().subscribe({
        next: (pages) => {
          this.landingPages = pages;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading landing pages:', err);
          this.snackBar.open('خطأ في تحميل الصفحات', 'إغلاق', { duration: 3000 });
          this.loading = false;
        }
      })
    );
  }

  showAddForm(): void {
    this.editingPage = null;
    this.pageForm.reset();
    this.pageForm.patchValue({ active: true });
    this.showForm = true;
  }

  showEditForm(page: LandingPage): void {
    this.editingPage = page;
    this.pageForm.patchValue({
      ...page,
      features: page.features?.join('\n') || '',
      // Section Visibility Controls
      show_pricing: page.show_pricing ?? true,
      show_features: page.show_features ?? true,
      show_contact: page.show_contact ?? true,
      show_cta_buttons: page.show_cta_buttons ?? true,
      show_image: page.show_image ?? true,
      show_video: page.show_video ?? true,
      // Contact Form Settings
      contact_form_enabled: page.contact_form?.enabled ?? false,
      contact_form_full_name: page.contact_form?.fields?.full_name ?? true,
      contact_form_mobile: page.contact_form?.fields?.mobile ?? true,
      contact_form_service_type: page.contact_form?.fields?.service_type ?? true,
      contact_form_car_type: page.contact_form?.fields?.car_type ?? true,
      contact_form_car_model: page.contact_form?.fields?.car_model ?? true,
      contact_form_notes: page.contact_form?.fields?.notes ?? true,
      contact_form_submit_text: page.contact_form?.submit_button_text ?? 'إرسال الرسالة',
      contact_form_success_message: page.contact_form?.success_message ?? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.',
      // Styling Settings
      primary_color: page.styling?.primary_color || '#007bff',
      secondary_color: page.styling?.secondary_color || '#6c757d',
      accent_color: page.styling?.accent_color || '#28a745',
      background_gradient: page.styling?.background_gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      font_family: page.styling?.font_family || 'Cairo',
      button_style: page.styling?.button_style || 'rounded',
      layout_style: page.styling?.layout_style || 'modern',
      // Booking Settings
      booking_total_slots: page.booking?.total_slots || 20,
      booking_booked_slots: page.booking?.booked_slots || 12,
      booking_show_count: page.booking?.show_booking_count || true,
      booking_message: page.booking?.booking_message || 'تم حجز 12/20 – باقي 8 فقط',
      // Mobile Optimization Settings
      mobile_optimized: page.mobile_optimized || true,
      fullscreen_mobile: page.fullscreen_mobile || true,
      responsive_design: page.responsive_design || true
    });
    this.showForm = true;
  }

  hideForm(): void {
    this.showForm = false;
    this.editingPage = null;
    this.pageForm.reset();
  }

  onSubmit(): void {
    if (this.pageForm.valid) {
      const formData = this.pageForm.value;
      const pageData: LandingPage = {
        slug: formData.slug,
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        image: formData.image,
        original_price: formData.original_price,
        discount_price: formData.discount_price,
        discount_percent: formData.discount_percent,
        video_url: formData.video_url,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : undefined,
        whatsapp_number: formData.whatsapp_number,
        features: formData.features ? formData.features.split('\n').filter((f: string) => f.trim()) : [],
        active: formData.active,
        
        // Section Visibility Controls
        show_pricing: formData.show_pricing,
        show_features: formData.show_features,
        show_contact: formData.show_contact,
        show_cta_buttons: formData.show_cta_buttons,
        show_image: formData.show_image,
        show_video: formData.show_video,
        
        // Contact Form Settings
        contact_form: {
          enabled: formData.contact_form_enabled,
          fields: {
            full_name: formData.contact_form_full_name,
            mobile: formData.contact_form_mobile,
            service_type: formData.contact_form_service_type,
            car_type: formData.contact_form_car_type,
            car_model: formData.contact_form_car_model,
            notes: formData.contact_form_notes
          },
          submit_button_text: formData.contact_form_submit_text,
          success_message: formData.contact_form_success_message
        },
        
        // Styling Settings
        styling: {
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          accent_color: formData.accent_color,
          background_gradient: formData.background_gradient,
          font_family: formData.font_family,
          button_style: formData.button_style,
          layout_style: formData.layout_style
        },
        
        // Booking Settings
        booking: {
          total_slots: formData.booking_total_slots,
          booked_slots: formData.booking_booked_slots,
          show_booking_count: formData.booking_show_count,
          booking_message: formData.booking_message
        },
        
        // Mobile Optimization Settings
        mobile_optimized: formData.mobile_optimized,
        fullscreen_mobile: formData.fullscreen_mobile,
        responsive_design: formData.responsive_design
      };

      if (this.editingPage) {
        this.updatePage(pageData);
      } else {
        this.addPage(pageData);
      }
    } else {
      this.snackBar.open('يرجى ملء جميع الحقول المطلوبة', 'إغلاق', { duration: 3000 });
    }
  }

  private addPage(pageData: LandingPage): void {
    this.subscription.add(
      this.landingPageService.addLandingPage(pageData).subscribe({
        next: () => {
          this.snackBar.open('تم إضافة الصفحة بنجاح', 'إغلاق', { duration: 3000 });
          this.hideForm();
          this.loadLandingPages();
        },
        error: (err) => {
          console.error('Error adding page:', err);
          this.snackBar.open('خطأ في إضافة الصفحة', 'إغلاق', { duration: 3000 });
        }
      })
    );
  }

  private updatePage(pageData: LandingPage): void {
    if (!this.editingPage?.id) return;

    this.subscription.add(
      this.landingPageService.updateLandingPage(this.editingPage.id, pageData).subscribe({
        next: () => {
          this.snackBar.open('تم تحديث الصفحة بنجاح', 'إغلاق', { duration: 3000 });
          this.hideForm();
          this.loadLandingPages();
        },
        error: (err) => {
          console.error('Error updating page:', err);
          this.snackBar.open('خطأ في تحديث الصفحة', 'إغلاق', { duration: 3000 });
        }
      })
    );
  }

  deletePage(page: LandingPage): void {
    if (!page.id) return;

    if (confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
      this.subscription.add(
        this.landingPageService.deleteLandingPage(page.id).subscribe({
          next: () => {
            this.snackBar.open('تم حذف الصفحة بنجاح', 'إغلاق', { duration: 3000 });
            this.loadLandingPages();
          },
          error: (err) => {
            console.error('Error deleting page:', err);
            this.snackBar.open('خطأ في حذف الصفحة', 'إغلاق', { duration: 3000 });
          }
        })
      );
    }
  }

  togglePageStatus(page: LandingPage): void {
    if (!page.id) return;

    this.subscription.add(
      this.landingPageService.togglePageStatus(page.id, !page.active).subscribe({
        next: () => {
          this.snackBar.open(`تم ${page.active ? 'إيقاف' : 'تفعيل'} الصفحة`, 'إغلاق', { duration: 3000 });
          this.loadLandingPages();
        },
        error: (err) => {
          console.error('Error toggling page status:', err);
          this.snackBar.open('خطأ في تغيير حالة الصفحة', 'إغلاق', { duration: 3000 });
        }
      })
    );
  }

  previewPage(page: LandingPage): void {
    const url = `${window.location.origin}/${page.slug}`;
    window.open(url, '_blank');
  }

  copyUrl(page: LandingPage): void {
    const url = `${window.location.origin}/${page.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('تم نسخ الرابط', 'إغلاق', { duration: 2000 });
    });
  }

  getPageUrl(page: LandingPage): string {
    return `${window.location.origin}/${page.slug}`;
  }

  isExpired(expiresAt: string): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  getTimeLeft(expiresAt: string): string {
    if (!expiresAt) return 'بدون انتهاء';
    
    const now = new Date().getTime();
    const expireTime = new Date(expiresAt).getTime();
    const timeDiff = expireTime - now;

    if (timeDiff <= 0) return 'منتهي';

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} يوم`;
    if (hours > 0) return `${hours} ساعة`;
    return 'أقل من ساعة';
  }
}

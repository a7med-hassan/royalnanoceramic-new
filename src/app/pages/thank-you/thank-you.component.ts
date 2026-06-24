import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

// Declare global tracking functions
declare const gtag: Function;
declare const ttq: any;

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit {
  customerName = '';
  formType = 'contact';
  countdown = 20;
  discount: number | null = null;
  discountCode: string = '';
  discountText: string = ''; // ✅ نص الخصم أو الهدية
  isGift: boolean = false; // ✅ تحديد إذا كان هدية
  isWhiteFridayWheel = false;
  private countdownInterval: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.customerName = params['name'] || '';
      this.formType = params['type'] || 'contact';
      this.discount = params['discount'] ? parseInt(params['discount']) : null;
      this.discountCode = params['code'] || '';
      this.discountText = params['discountText'] || '';
      this.isGift = params['isGift'] === 'true';
      this.isWhiteFridayWheel = this.formType === 'white_friday_wheel';
      
      // إذا لم يكن هناك كود خصم، نولد واحد
      if (this.isWhiteFridayWheel && !this.discountCode) {
        this.discountCode = this.generateDiscountCode();
      }
      
      // ✅ إذا لم يكن هناك نص خصم، نستخدم الخصم كنسبة مئوية
      if (this.isWhiteFridayWheel && !this.discountText && this.discount) {
        this.discountText = `خصم ${this.discount}%`;
      }
      
      // ✅ حفظ cookie أنه لعب العجلة بالفعل
      if (this.isWhiteFridayWheel) {
        this.markWheelAsPlayed();
      }
    });

    // Fire tracking events
    this.fireTrackingEvents();

    // Start countdown to redirect (فقط إذا لم يكن White Friday Wheel)
    if (!this.isWhiteFridayWheel) {
      this.startCountdown();
    }
  }

  // ✅ دالة لتوليد كود الخصم العشوائي
  generateDiscountCode(): string {
    const prefix = 'ROYAL';
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${randomPart}`;
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private fireTrackingEvents(): void {
    // Google Analytics Event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
        'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
        'transaction_id': Date.now().toString()
      });

      gtag('event', 'form_submission', {
        'event_category': 'engagement',
        'event_label': this.formType,
        'value': 1
      });
    }

    // Meta Pixel Event - Removed duplicate Lead event
    // Lead event is already tracked in contact-form.component.ts
    // This prevents duplicate tracking

    // TikTok Pixel Event
    if (typeof ttq !== 'undefined') {
      ttq.track('SubmitForm', {
        content_type: this.formType
      });
    }

    console.log('✅ Tracking events fired:', this.formType);
  }

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.goToHome();
      }
    }, 1000);
  }

  goToHome(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.router.navigate(['/']);
  }

  openWhatsApp(): void {
    const message = this.isWhiteFridayWheel 
      ? `مرحباً، حصلت على خصم ${this.discount}% - كود: ${this.discountCode}`
      : 'مرحباً، قمت بتعبئة النموذج وأريد المزيد من المعلومات';
    const whatsappUrl = `https://wa.me/201032222542?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  callNow(): void {
    window.location.href = 'tel:+201032222542';
  }

  // ✅ دالة لحفظ cookie أنه لعب العجلة
  private markWheelAsPlayed(): void {
    try {
      if (typeof document !== 'undefined') {
        // حفظ الكوكي لمدة سنة (365 يوم)
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `wheel_played=1; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
        console.log('✅ Cookie saved: wheel_played=1');
      }
    } catch (error) {
      console.error('❌ Error saving cookie:', error);
    }
  }

  // ✅ دالة نسخ كود الخصم
  copyDiscountCode(): void {
    if (this.discountCode) {
      navigator.clipboard.writeText(this.discountCode).then(() => {
        alert('✅ تم نسخ الكود بنجاح!');
      }).catch(() => {
        // Fallback للمتصفحات القديمة
        const textArea = document.createElement('textarea');
        textArea.value = this.discountCode;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          alert('✅ تم نسخ الكود بنجاح!');
        } catch (err) {
          alert('❌ فشل نسخ الكود. الكود: ' + this.discountCode);
        }
        document.body.removeChild(textArea);
      });
    }
  }
}


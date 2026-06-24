import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { WheelStateService } from '../../shared/services/wheel-state.service';

interface WheelSegment {
  text: string;
  discount: number | string;
  color: string;
  textColor: string;
  isGift?: boolean;
}

@Component({
  selector: 'app-wheel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wheel.component.html',
  styleUrl: './wheel.component.scss'
})
export class WheelComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('wheelCanvas', { static: false }) wheelCanvas!: ElementRef<HTMLCanvasElement>;

  formVisible = false;
  isSpinning = false;
  isLoading = false;
  hasPlayedBefore = false; // âœ… Ù„Ù„ØªØ­Ù‚Ù‚ Ø¥Ø°Ø§ ÙƒØ§Ù† Ù„Ø¹Ø¨ Ù…Ù† Ù‚Ø¨Ù„
  selectedDiscount: number | null = null;
  selectedSegmentIndex: number = -1;
  selectedSegmentText: string = '';
  rotationAngle = 0;
  currentRotation = 0;
  private readonly bodyScrollClass = 'wheel-modal-open';
  private readonly wheelPlayedCookieKey = 'wheel_played';
  private animationId: number | null = null;

  segments: WheelSegment[] = [
    { text: 'Ø®ØµÙ… 15%', discount: 15, color: '#ff6b6b', textColor: '#fff', isGift: false },
    { text: 'Ø®ØµÙ… 20%', discount: 20, color: '#4ecdc4', textColor: '#fff', isGift: false },
    { text: 'Ø®ØµÙ… 25%', discount: 25, color: '#ffe66d', textColor: '#000', isGift: false },
    { text: 'Ø®ØµÙ… 30%', discount: 30, color: '#95e1d3', textColor: '#000', isGift: false },
    { text: 'Ø¹Ø§Ø²Ù„ Ø­Ø±Ø§Ø±ÙŠ\nÙ‡Ø¯ÙŠØ©', discount: 'Ø¹Ø§Ø²Ù„ Ø­Ø±Ø§Ø±ÙŠ', color: '#f38181', textColor: '#fff', isGift: true },
    { text: 'ÙƒÙˆÙ…Ø¨Ø±Ø³Ø±\nÙ‡Ø¯ÙŠØ©', discount: 'ÙƒÙˆÙ…Ø¨Ø±Ø³Ø±', color: '#c5a059', textColor: '#000', isGift: true }
  ];

  formData = {
    name: '',
    phone: '',
    carType: ''
  };

  private ctx: CanvasRenderingContext2D | null = null;
  private wheelCenterX = 200;
  private wheelCenterY = 200;
  private wheelRadius = 180;
  private segmentAngle: number;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private wheelState: WheelStateService
  ) {
    this.segmentAngle = (2 * Math.PI) / this.segments.length;
  }

  ngOnInit() {
    // âœ… Ø§Ø³ØªØ±Ø¬Ø§Ø¹ Ø­Ø§Ù„Ø© Ø§Ù„Ø¹Ø¬Ù„Ø© Ù…Ù† Cookie/localStorage
    const state = this.wheelState.get();

    // âœ… Ø¥Ø°Ø§ ÙƒØ§Ù† Ù‚Ø¯ Ù„Ø¹Ø¨ Ø¨Ø§Ù„ÙØ¹Ù„ (submitted) â†’ Ø±Ø³Ø§Ù„Ø© ÙˆÙ‚ÙÙ„
    if (state.stage === 'submitted') {
      this.hasPlayedBefore = true;
      this.showPlayedMessage();
      return;
    }

    // âœ… Ø¥Ø°Ø§ ÙƒØ§Ù† ÙÙŠ Ù…Ø±Ø­Ù„Ø© Ø§Ù„ÙÙˆØ±Ù… (Ù„Ù ÙˆØ®ØµÙ…Ù‡ Ù…Ø­ÙÙˆØ¸) â†’ Ø¹Ø±Ø¶ Ø§Ù„ÙÙˆØ±Ù… Ù…Ø¨Ø§Ø´Ø±Ø©
    if (state.stage === 'form' && (state.discount !== undefined || state.discountText)) {
      this.selectedDiscount = typeof state.discount === 'number' ? state.discount : null;
      this.selectedSegmentText = state.discountText || (typeof state.discount === 'string' ? state.discount : '');
      
      // Ø§Ø³ØªØ±Ø¬Ø§Ø¹ index Ø§Ù„Ù‚Ø·Ø¹Ø© Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©
      if (state.isGift) {
        const giftSegment = this.segments.find(s => s.isGift && s.discount === state.discount);
        if (giftSegment) {
          this.selectedSegmentIndex = this.segments.indexOf(giftSegment);
        }
      } else if (typeof state.discount === 'number') {
        const discountSegment = this.segments.find(s => !s.isGift && s.discount === state.discount);
        if (discountSegment) {
          this.selectedSegmentIndex = this.segments.indexOf(discountSegment);
        }
      }
      
      this.formVisible = true;
      this.location.replaceState('/offers_wheel/form');
      this.cdr.markForCheck();
      return;
    }

    // âœ… ÙØ­Øµ Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„Ø¹Ù…ÙŠÙ„ Ù„Ø¹Ø¨ Ù…Ù† Ù‚Ø¨Ù„ (legacy check)
    this.hasPlayedBefore = this.hasPlayedWheelBefore();
    if (this.hasPlayedBefore) {
      console.log('âš ï¸ User has already played the wheel');
    }
  }
  
  // âœ… Ø¯Ø§Ù„Ø© Ù„Ù„ØªØ­Ù‚Ù‚ Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„Ø¹Ù…ÙŠÙ„ Ù„Ø¹Ø¨ Ù…Ù† Ù‚Ø¨Ù„
  private hasPlayedWheelBefore(): boolean {
    try {
      if (typeof document === 'undefined') {
        return false;
      }
      
      // Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„ÙƒÙˆÙƒÙŠ
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === this.wheelPlayedCookieKey && value === '1') {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('âŒ Error checking cookie:', error);
      return false;
    }
  }

  /**
   * Ø¹Ø±Ø¶ Ø±Ø³Ø§Ù„Ø© "Ø¬Ø±Ø¨Øª Ù‚Ø¨Ù„ ÙƒØ¯Ù‡" Ø¹Ù†Ø¯ Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ù„Ù„Ø¹Ø¨ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰
   */
  private showPlayedMessage(): void {
    // ÙŠÙ…ÙƒÙ† Ø§Ø³ØªØ¨Ø¯Ø§Ù„ alert Ø¨Ù€ Toast/Snackbar Ø­Ø³Ø¨ Ø§Ù„ØªØµÙ…ÙŠÙ…
    alert('âš ï¸ Ø£Ù†Øª Ø¨Ø§Ù„ÙØ¹Ù„ Ø´Ø§Ø±ÙƒØª Ù‚Ø¨Ù„ ÙƒØ¯Ù‡. Ù„Ùˆ Ù…Ø­ØªØ§Ø¬ Ù…Ø³Ø§Ø¹Ø¯Ø© ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§.');
    
    // Ø¥Ø®ÙØ§Ø¡ Ø§Ù„ÙÙˆØ±Ù… Ø¥Ø°Ø§ ÙƒØ§Ù† Ø¸Ø§Ù‡Ø±Ø§Ù‹
    this.formVisible = false;
    this.updateBodyScrollLock();
  }

  ngAfterViewInit() {
    // âœ… Ø±Ø³Ù… Ø§Ù„Ø¹Ø¬Ù„Ø© ÙÙ‚Ø· Ø¥Ø°Ø§ Ù„Ù… ÙŠÙ„Ø¹Ø¨ Ù…Ù† Ù‚Ø¨Ù„
    if (!this.hasPlayedBefore) {
      setTimeout(() => {
        this.checkAndDrawWheel();
      }, 100);
    }
  }

  checkAndDrawWheel() {
    if (this.wheelCanvas) {
      requestAnimationFrame(() => {
        if (this.wheelCanvas && this.wheelCanvas.nativeElement) {
          const canvas = this.wheelCanvas.nativeElement;
          if (!this.ctx) {
            this.ctx = canvas.getContext('2d', { 
              alpha: true,
              desynchronized: true
            });
          }
          if (this.ctx) {
            this.drawWheel();
            this.cdr.markForCheck();
          }
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    this.formVisible = false;
    this.updateBodyScrollLock();
  }

  drawWheel(rotation: number = 0) {
    if (!this.wheelCanvas) return;
    
    const canvas = this.wheelCanvas.nativeElement;
    if (!this.ctx) {
      this.ctx = canvas.getContext('2d', { 
        alpha: true,
        desynchronized: true,
        willReadFrequently: false
      });
      if (!this.ctx) return;
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    this.segments.forEach((segment, index) => {
      const startAngle = index * this.segmentAngle - Math.PI / 2 + rotation;
      const endAngle = (index + 1) * this.segmentAngle - Math.PI / 2 + rotation;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(this.wheelCenterX, this.wheelCenterY);
      ctx.arc(this.wheelCenterX, this.wheelCenterY, this.wheelRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text
      const textAngle = startAngle + this.segmentAngle / 2;
      const textX = this.wheelCenterX + Math.cos(textAngle) * (this.wheelRadius * 0.7);
      const textY = this.wheelCenterY + Math.sin(textAngle) * (this.wheelRadius * 0.7);

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = segment.textColor;
      
      const fontSize = segment.text.includes('\n') ? 16 : 20;
      ctx.font = `bold ${fontSize}px Arial`;
      
      const lines = segment.text.split('\n');
      if (lines.length > 1) {
        const lineHeight = fontSize + 4;
        lines.forEach((line, lineIndex) => {
          ctx.fillText(line, 0, (lineIndex - (lines.length - 1) / 2) * lineHeight);
        });
      } else {
        ctx.fillText(segment.text, 0, 0);
      }
      
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(this.wheelCenterX, this.wheelCenterY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#c5a059';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pointer
    this.drawPointer();
  }

  drawPointer() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    
    ctx.beginPath();
    ctx.moveTo(this.wheelCenterX, 20);
    ctx.lineTo(this.wheelCenterX - 20, 50);
    ctx.lineTo(this.wheelCenterX + 20, 50);
    ctx.closePath();
    ctx.fillStyle = '#c5a059';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  startSpin() {
    if (this.isSpinning) return;
    
    // âœ… Ø­Ø¸Ø± Ø§Ù„Ù„Ù Ù„Ùˆ Ø³Ø¨Ù‚ ÙˆØ³ÙØ¬Ù‘Ù„ Ù„Ø¹Ø¨
    const state = this.wheelState.get();
    if (state.stage === 'submitted' || state.stage === 'form') {
      this.showPlayedMessage();
      return;
    }
    
    if (!this.ctx || !this.wheelCanvas) {
      if (this.wheelCanvas && this.wheelCanvas.nativeElement) {
        const canvas = this.wheelCanvas.nativeElement;
        this.ctx = canvas.getContext('2d');
        if (!this.ctx) return;
        this.drawWheel();
      } else {
        return;
      }
    }

    this.location.replaceState('/offers_wheel/spin');
    this.isSpinning = true;

    const randomIndex = Math.floor(Math.random() * this.segments.length);
    const fullRotations = 5 + Math.random() * 2;
    const baseRotations = fullRotations * 2 * Math.PI;
    const segmentRotation = (2 * Math.PI) - (randomIndex * this.segmentAngle);
    const finalRotation = baseRotations + segmentRotation;

    this.animateSpin(finalRotation, randomIndex);
  }

  animateSpin(targetRotation: number, targetSegmentIndex: number) {
    const duration = 3000;
    const startTime = Date.now();
    const startRotation = 0;
    let rotationDiff = targetRotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      this.currentRotation = startRotation + rotationDiff * easeOut;

      if (this.ctx && this.wheelCanvas) {
        this.drawWheel(this.currentRotation);
      }

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.currentRotation = startRotation + rotationDiff;
        if (this.ctx && this.wheelCanvas) {
          this.drawWheel(this.currentRotation);
        }
        
        const actualSegmentIndex = this.getSegmentAtPointer(this.currentRotation);
        this.selectedSegmentIndex = actualSegmentIndex;
        const selectedSegment = this.segments[actualSegmentIndex];
        this.selectedSegmentText = selectedSegment.text;
        const discountValue = selectedSegment.discount;
        this.selectedDiscount = typeof discountValue === 'number' ? discountValue : 0;
        
        setTimeout(() => {
          this.onSpinComplete();
        }, 50);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  getSegmentAtPointer(rotation: number): number {
    let normalizedRotation = rotation % (2 * Math.PI);
    if (normalizedRotation < 0) {
      normalizedRotation += 2 * Math.PI;
    }
    
    const totalAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);
    let segmentIndex = Math.floor(totalAngle / this.segmentAngle);
    segmentIndex = segmentIndex % this.segments.length;
    
    return segmentIndex;
  }

  onSpinComplete() {
    this.isSpinning = false;
    
    // âœ… Ø­ÙØ¸ Ø§Ù„Ø­Ø§Ù„Ø© Ø¨Ø¹Ø¯ Ø§Ù†ØªÙ‡Ø§Ø¡ Ø§Ù„Ù„ÙØ© â†’ ÙŠØ±ÙˆØ­ Ø¹Ù„Ù‰ Ø§Ù„ÙÙˆØ±Ù… Ù„Ùˆ Ø¹Ù…Ù„ Refresh
    const selectedSegment = this.segments[this.selectedSegmentIndex];
    const discountValue = selectedSegment.discount;
    const discountText = selectedSegment.text;
    
    this.wheelState.set({
      stage: 'form',
      discount: discountValue,
      discountText: discountText,
      isGift: selectedSegment.isGift || false,
      ts: Date.now()
    });
    
    this.currentRotation = 0;
    
    setTimeout(() => {
      this.formVisible = true;
      this.updateBodyScrollLock();
      this.location.replaceState('/offers_wheel/form');
      this.cdr.markForCheck();
    }, 300);
  }

  submitForm() {
    if (!this.formData.name || !this.formData.phone || !this.formData.carType) {
      alert('â›” ÙŠØ±Ø¬Ù‰ Ù…Ù„Ø¡ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ„');
      return;
    }

    this.location.replaceState('/offers_wheel/submitting');
    this.isLoading = true;
    this.cdr.markForCheck();

    const selectedSegment = this.segments[this.selectedSegmentIndex];
    const isGift = selectedSegment?.isGift || false;
    const discountText = isGift 
      ? `Ù‡Ø¯ÙŠØ© White Friday: ${selectedSegment.discount}` 
      : `Ø®ØµÙ… White Friday: ${this.selectedDiscount}%`;
    
    const payload: any = {
      full_name: this.formData.name,
      mobile: this.formData.phone,
      client_16945026668577: this.formData.carType,
      notes: discountText,
      form_source: 'white_friday_wheel',
      utm_campaign: 'White Friday 2025'
    };

    const discountCode = this.generateDiscountCode();
    const discountValue = isGift ? 0 : (this.selectedDiscount || 20);

    localStorage.setItem('whiteFridayDiscount', discountValue.toString());
    localStorage.setItem('whiteFridayDiscountName', this.formData.name);
    localStorage.setItem('whiteFridayDiscountCode', discountCode);

    this.apiService.submitContactForm(payload).subscribe({
      next: async (response: any) => {
        if (response.success) {
          console.log('âœ… Form saved in Dashboard');
        }

        this.apiService.submit8xLead({
          full_name: this.formData.name,
          mobile: this.formData.phone,
          notes: `${discountText} - ÙƒÙˆØ¯: ${discountCode}`
        }).subscribe({
          next: (res) => console.log('âœ… 8xCRM Response:', res),
          error: (err) => console.error('âŒ 8xCRM Error:', err)
        });

        const customerName = this.formData.name;
        
        // âœ… Ù†Ø¬Ø§Ø­ â†’ Ø«Ø¨Ù‘Øª Ø§Ù„Ø­Ø§Ù„Ø© submitted Ù„Ù…Ù†Ø¹ Ø§Ù„Ù„Ø¹Ø¨ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰
        const selectedSegment = this.segments[this.selectedSegmentIndex];
        this.wheelState.set({
          stage: 'submitted',
          discount: selectedSegment.discount,
          discountText: selectedSegment.text,
          isGift: selectedSegment.isGift || false,
          ts: Date.now()
        });
        
        this.isLoading = false;
        this.cdr.markForCheck();
        this.formVisible = false;
        this.resetForm();
        this.updateBodyScrollLock();
        this.location.replaceState('/offers_wheel/success');

        setTimeout(() => {
          this.router.navigate(['/thank-you'], {
            queryParams: {
              name: customerName,
              type: 'white_friday_wheel',
              discount: discountValue,
              code: discountCode,
              discountText: selectedSegment?.text || this.selectedSegmentText,
              isGift: isGift ? 'true' : 'false'
            }
          });
        }, 300);
      },
      error: (error) => {
        console.error('âŒ Backend error:', error);
        this.isLoading = false;
        this.cdr.markForCheck();
        this.location.replaceState('/offers_wheel/form');
        alert('âŒ Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰');
      }
    });
  }

  generateDiscountCode(): string {
    const prefix = 'ROYAL';
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${randomPart}`;
  }

  resetForm() {
    this.formData = {
      name: '',
      phone: '',
      carType: ''
    };
  }

  hideForm() {
    this.formVisible = false;
    this.updateBodyScrollLock();
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  private updateBodyScrollLock() {
    if (typeof document === 'undefined') {
      return;
    }

    if (this.formVisible) {
      document.body.classList.add(this.bodyScrollClass);
    } else {
      document.body.classList.remove(this.bodyScrollClass);
    }
  }
}


import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { WheelStateService } from '../../shared/services/wheel-state.service';
import { WhiteFridaySessionService } from '../../shared/services/white-friday-session.service';

interface WheelSegment {
  text: string;
  discount: number | string; // ÙŠÙ…ÙƒÙ† Ø£Ù† ÙŠÙƒÙˆÙ† Ø±Ù‚Ù… (Ù†Ø³Ø¨Ø© Ù…Ø¦ÙˆÙŠØ©) Ø£Ùˆ Ù†Øµ (Ù‡Ø¯ÙŠØ©)
  color: string;
  textColor: string;
  isGift?: boolean; // ØªØ­Ø¯ÙŠØ¯ Ø¥Ø°Ø§ ÙƒØ§Ù† Ù‡Ø¯ÙŠØ©
}

@Component({
  selector: 'app-white-friday-wheel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './white-friday-wheel.component.html',
  styleUrl: './white-friday-wheel.component.scss'
})
export class WhiteFridayWheelComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('wheelCanvas', { static: false }) wheelCanvas!: ElementRef<HTMLCanvasElement>;

  // ============================================
  // Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø¹Ø¬Ù„Ø© - ÙŠÙ…ÙƒÙ† ØªÙØ¹ÙŠÙ„/ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ø¹Ø¬Ù„Ø© Ù…Ù† Ù‡Ù†Ø§
  // ============================================
  // Ù„ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„Ø¹Ø¬Ù„Ø©: Ø¶Ø¹ isWheelEnabled = true
  // Ù„Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ø¹Ø¬Ù„Ø© Ù…Ø¤Ù‚ØªØ§Ù‹: Ø¶Ø¹ isWheelEnabled = false
  private isWheelEnabled: boolean = true; // âœ… Ø§Ù„Ø¹Ø¬Ù„Ø© Ù…ÙØ¹Ù„Ø© - ØªØºÙŠÙŠØ± Ø¥Ù„Ù‰ false Ù„ØªØ¹Ø·ÙŠÙ„Ù‡Ø§
  
  showModal = false;
  formVisible = false;
  isSpinning = false;
  isLoading = false; // âœ… Ø­Ø§Ù„Ø© Ø§Ù„ØªØ­Ù…ÙŠÙ„ Ù„Ù„ÙÙˆØ±Ù…
  selectedDiscount: number | null = null;
  selectedSegmentIndex: number = -1; // Ù„Ø­ÙØ¸ Ø§Ù„Ù€ index Ø§Ù„Ù…Ø®ØªØ§Ø±
  selectedSegmentText: string = ''; // âœ… Ù†Øµ Ø§Ù„Ù‚Ø·Ø¹Ø© Ø§Ù„Ù…Ø®ØªØ§Ø±Ø© (Ù„Ù„Ù‡Ø¯Ø§ÙŠØ§)
  rotationAngle = 0;
  currentRotation = 0; // ÙŠØ¨Ø¯Ø£ Ù…Ù† 0 Ø¯Ø§Ø¦Ù…Ø§Ù‹
  private readonly bodyScrollClass = 'wheel-modal-open';
  private animationId: number | null = null;
  private timeoutId: any;
  private readonly wheelShownStorageKey = 'whiteFridayWheel_shown_v2025';

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
    private wheelState: WheelStateService,
    private whiteFridaySession: WhiteFridaySessionService
  ) {
    this.segmentAngle = (2 * Math.PI) / this.segments.length;
  }

  async ngOnInit() {
    // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¹Ø¬Ù„Ø©
    if (!this.isWheelEnabled) {
      return;
    }

    // âœ… ðŸ” Ø§Ø³ØªØ±Ø¬Ø§Ø¹ Ø­Ø§Ù„Ø© Ø§Ù„Ø¹Ø¬Ù„Ø© Ù…Ù† Firebase (Ø§Ù„Ù…ØµØ¯Ø± Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ)
    try {
      const session = await this.whiteFridaySession.getSessionData();

      // âœ… Ø¥Ø°Ø§ ÙƒØ§Ù† Ù‚Ø¯ Ù„Ø¹Ø¨ Ø¨Ø§Ù„ÙØ¹Ù„ (submitted) â†’ Ø±Ø³Ø§Ù„Ø© ÙˆÙ‚ÙÙ„
      if (session?.stage === 'submitted') {
        this.showPlayedMessage();
        return;
      }

      // âœ… Ø¥Ø°Ø§ ÙƒØ§Ù† ÙÙŠ Ù…Ø±Ø­Ù„Ø© Ø§Ù„ÙÙˆØ±Ù… (Ù„Ù ÙˆØ®ØµÙ…Ù‡ Ù…Ø­ÙÙˆØ¸) â†’ Ø¹Ø±Ø¶ Ø§Ù„ÙÙˆØ±Ù… Ù…Ø¨Ø§Ø´Ø±Ø©
      if (session?.stage === 'form' && (session.discount !== undefined || session.discountText)) {
        this.selectedDiscount = typeof session.discount === 'number' ? session.discount : null;
        this.selectedSegmentText = session.discountText || (typeof session.discount === 'string' ? session.discount : '');
        
        // Ø§Ø³ØªØ±Ø¬Ø§Ø¹ index Ø§Ù„Ù‚Ø·Ø¹Ø© Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©
        if (session.isGift) {
          const giftSegment = this.segments.find(s => s.isGift && s.discount === session.discount);
          if (giftSegment) {
            this.selectedSegmentIndex = this.segments.indexOf(giftSegment);
          }
        } else if (typeof session.discount === 'number') {
          const discountSegment = this.segments.find(s => !s.isGift && s.discount === session.discount);
          if (discountSegment) {
            this.selectedSegmentIndex = this.segments.indexOf(discountSegment);
          }
        }
        
        this.formVisible = true;
        this.location.replaceState('/white-friday/form');
        this.cdr.markForCheck();
        return;
      }
    } catch (error) {
      console.error('âŒ Error loading session from Firebase:', error);
      // ÙÙŠ Ø­Ø§Ù„Ø© Ø§Ù„Ø®Ø·Ø£ØŒ Ù†Ø³Ù…Ø­ Ø¨Ø§Ù„Ù„Ø¹Ø¨ (fallback)
    }

    // âœ… Ø£ÙˆÙ„ Ù…Ø±Ø©: Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„Ù…ÙˆØ¯Ø§Ù„ Ø¨Ø¹Ø¯ 10 Ø«ÙˆØ§Ù†ÙŠ
    this.timeoutId = setTimeout(() => {
      this.scrollToMiddleAndShow();
    }, 10000);
  }

  scrollToMiddleAndShow() {
    // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ù†ØªØµÙ Ø§Ù„Ù…Ø±Ø¦ÙŠ Ù„Ù„ØµÙØ­Ø© - Ù†ÙØ³ Ø§Ù„Ø³Ù„ÙˆÙƒ Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© (Ù…ÙˆØ¨Ø§ÙŠÙ„ ØµØºÙŠØ±ØŒ Ù…ÙˆØ¨Ø§ÙŠÙ„ ÙƒØ¨ÙŠØ±ØŒ Ø¯ÙŠØ³ÙƒØªÙˆØ¨)
    const getDocumentHeight = () => {
      return Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
    };

    const getViewportHeight = () => {
      return window.innerHeight || document.documentElement.clientHeight || window.screen.height;
    };

    // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ù†ØªØµÙ Ø¨Ø´ÙƒÙ„ Ø¯Ù‚ÙŠÙ‚
    const documentHeight = getDocumentHeight();
    const viewportHeight = getViewportHeight();
    
    // Ø§Ù„Ù…Ù†ØªØµÙ = (Ø§Ø±ØªÙØ§Ø¹ Ø§Ù„ØµÙØ­Ø© - Ø§Ø±ØªÙØ§Ø¹ viewport) / 2
    // Ù†ÙØ³ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø¨Ø¯ÙˆÙ† Ø£ÙŠ Ø§Ø®ØªÙ„Ø§ÙØ§Øª
    const offset = 100;
    const middlePosition = Math.max(0, (documentHeight - viewportHeight) / 2 + offset);
    
    // ÙØ­Øµ Ù…ÙˆØ¶Ø¹ scroll Ø§Ù„Ø­Ø§Ù„ÙŠ
    const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const middleThreshold = 200; // Ù†ÙØ³ Ø§Ù„Ù…Ø³Ø§ÙØ© Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¬Ù‡Ø²Ø©
    
    // Ø¥Ø°Ø§ Ù„Ù… ÙŠÙƒÙ† ÙÙŠ Ø§Ù„Ù…Ù†ØªØµÙ ØªÙ‚Ø±ÙŠØ¨Ø§Ù‹ØŒ Ù†Ø£Ø®Ø°Ù‡ Ù„Ù„Ù…Ù†ØªØµÙ
    if (Math.abs(scrollPosition - middlePosition) > middleThreshold) {
      // Ù†ÙØ³ Ø§Ù„Ø³Ù„ÙˆÙƒ Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© - scroll smooth Ø¯Ø§Ø¦Ù…Ø§Ù‹
      // Ù„Ø§ Ù†ØªØ­Ù‚Ù‚ Ù…Ù† Ù†ÙˆØ¹ Ø§Ù„Ø¬Ù‡Ø§Ø² - Ù†ÙØ³ Ø§Ù„Ø³Ù„ÙˆÙƒ Ù„Ù„Ø¬Ù…ÙŠØ¹ (Ù…ÙˆØ¨Ø§ÙŠÙ„ ØµØºÙŠØ±ØŒ Ù…ÙˆØ¨Ø§ÙŠÙ„ ÙƒØ¨ÙŠØ±ØŒ Ø¯ÙŠØ³ÙƒØªÙˆØ¨)
      
      // Ø§Ø³ØªØ®Ø¯Ø§Ù… smooth scroll Ù…Ø¹ fallback Ù„Ù„ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ø¹Ù…Ù„ Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…ØªØµÙØ­Ø§Øª
      try {
        window.scrollTo({ 
          top: middlePosition, 
          behavior: 'smooth' 
        });
      } catch (e) {
        // Fallback Ù„Ù„Ù…ØªØµÙØ­Ø§Øª Ø§Ù„Ù‚Ø¯ÙŠÙ…Ø©
        window.scrollTo(0, middlePosition);
      }
      
      // Ø§Ù†ØªØ¸Ø§Ø± Ø­ØªÙ‰ ÙŠÙƒØªÙ…Ù„ scroll Ù„Ù„Ù…Ù†ØªØµÙØŒ Ø«Ù… ÙØªØ­ Ø§Ù„Ù…ÙˆØ¯Ø§Ù„
      // Ù†ÙØ³ Ø§Ù„ØªÙˆÙ‚ÙŠØª Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© Ø¨Ø¯ÙˆÙ† Ø£ÙŠ Ø§Ø®ØªÙ„Ø§ÙØ§Øª
      setTimeout(() => {
        // Ø¹Ù„Ù‘Ù… Ø£Ù†Ù‡ ØªÙ… Ø¹Ø±Ø¶ Ø§Ù„Ø¹Ø¬Ù„Ø© Ù„Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø²
        this.markWheelAsShown();
        this.showModal = true;
        this.updateBodyScrollLock();
        this.cdr.markForCheck();
        setTimeout(() => {
          this.checkAndDrawWheel();
          this.scrollModalIntoView('.wheel-modal .modal-content');
        }, 200);
      }, 600);
    } else {
      // Ø§Ù„Ø¹Ù…ÙŠÙ„ ÙÙŠ Ø§Ù„Ù…Ù†ØªØµÙ ØªÙ‚Ø±ÙŠØ¨Ø§Ù‹ - Ù†ÙØªØ­ Ø§Ù„Ù…ÙˆØ¯Ø§Ù„ Ù…Ø¨Ø§Ø´Ø±Ø©
      // Ù†ÙØ³ Ø§Ù„Ø³Ù„ÙˆÙƒ Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¬Ù‡Ø²Ø©
      // Ø¹Ù„Ù‘Ù… Ø£Ù†Ù‡ ØªÙ… Ø¹Ø±Ø¶ Ø§Ù„Ø¹Ø¬Ù„Ø© Ù„Ù‡Ø°Ø§ Ø§Ù„Ø¬Ù‡Ø§Ø²
      this.markWheelAsShown();
      this.showModal = true;
      this.updateBodyScrollLock();
      this.cdr.markForCheck();
      setTimeout(() => {
        this.checkAndDrawWheel();
        this.scrollModalIntoView('.wheel-modal .modal-content');
      }, 100);
    }
  }

  ngAfterViewInit() {
    // Check if modal should be shown and draw wheel
    this.checkAndDrawWheel();
  }

  checkAndDrawWheel() {
    if (this.showModal && this.wheelCanvas) {
      // Ø§Ø³ØªØ®Ø¯Ø§Ù… requestAnimationFrame Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø£ÙØ¶Ù„ Ø£Ø¯Ø§Ø¡
      requestAnimationFrame(() => {
        if (this.wheelCanvas && this.wheelCanvas.nativeElement && this.showModal) {
          const canvas = this.wheelCanvas.nativeElement;
          if (!this.ctx) {
            this.ctx = canvas.getContext('2d', { 
              alpha: true,
              desynchronized: true // ØªØ­Ø³ÙŠÙ† Ø§Ù„Ø£Ø¯Ø§Ø¡
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
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    this.showModal = false;
    this.formVisible = false;
    this.updateBodyScrollLock();
  }

  drawWheel(rotation: number = 0) {
    if (!this.wheelCanvas) return;
    
    const canvas = this.wheelCanvas.nativeElement;
    if (!this.ctx) {
      this.ctx = canvas.getContext('2d', { 
        alpha: true,
        desynchronized: true, // ØªØ­Ø³ÙŠÙ† Ø§Ù„Ø£Ø¯Ø§Ø¡ Ø¹Ù„Ù‰ Ø§Ù„Ù…ÙˆØ¨Ø§ÙŠÙ„
        willReadFrequently: false // ØªØ­Ø³ÙŠÙ† Ø§Ù„Ø£Ø¯Ø§Ø¡
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
      
      // âœ… ØªØ­Ø³ÙŠÙ† Ø§Ù„Ø®Ø· Ù„Ù„Ù‡Ø¯Ø§ÙŠØ§ (Ù†Øµ Ø¹Ù„Ù‰ Ø³Ø·Ø±ÙŠÙ†)
      const fontSize = segment.text.includes('\n') ? 16 : 20;
      ctx.font = `bold ${fontSize}px Arial`;
      
      // âœ… Ø±Ø³Ù… Ø§Ù„Ù†Øµ Ø¹Ù„Ù‰ Ø³Ø·Ø± ÙˆØ§Ø­Ø¯ Ø£Ùˆ Ø³Ø·Ø±ÙŠÙ†
      const lines = segment.text.split('\n');
      if (lines.length > 1) {
        // Ù†Øµ Ø¹Ù„Ù‰ Ø³Ø·Ø±ÙŠÙ†
        const lineHeight = fontSize + 4;
        lines.forEach((line, lineIndex) => {
          ctx.fillText(line, 0, (lineIndex - (lines.length - 1) / 2) * lineHeight);
        });
      } else {
        // Ù†Øµ Ø¹Ù„Ù‰ Ø³Ø·Ø± ÙˆØ§Ø­Ø¯
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
    
    // Pointer at top center
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

  async startSpin() {
    if (this.isSpinning) return;
    
    // âœ… ðŸ” Ø­Ø¸Ø± Ø§Ù„Ù„Ù Ù„Ùˆ Ø³Ø¨Ù‚ ÙˆØ³ÙØ¬Ù‘Ù„ Ù„Ø¹Ø¨ (Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Firebase)
    try {
      const hasPlayed = await this.whiteFridaySession.hasPlayed();
      const isInForm = await this.whiteFridaySession.isInFormStage();
      
      if (hasPlayed || isInForm) {
        this.showPlayedMessage();
        return;
      }
    } catch (error) {
      console.error('âŒ Error checking session:', error);
      // ÙÙŠ Ø­Ø§Ù„Ø© Ø§Ù„Ø®Ø·Ø£ØŒ Ù†Ù…Ù†Ø¹ Ø§Ù„Ù„Ø¹Ø¨ Ù„Ù„Ø³Ù„Ø§Ù…Ø©
      this.showPlayedMessage();
      return;
    }
    
    // Ensure canvas is ready
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

    // âœ… Silent URL Update: ØªØºÙŠÙŠØ± URL Ø¨Ø¯ÙˆÙ† Ø¥Ø¹Ø§Ø¯Ø© ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙØ­Ø©
    this.location.replaceState('/white-friday/spin');

    this.isSpinning = true;
    // Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø£ØµÙˆØ§Øª - Ù„Ø§ Ù†Ù„Ø¹Ø¨ Ø£ÙŠ ØµÙˆØª

    // Random selection - Ø§Ø®ØªÙŠØ§Ø± Ø¹Ø´ÙˆØ§Ø¦ÙŠ Ù„Ù„Ù‚Ø·Ø¹Ø©
    const randomIndex = Math.floor(Math.random() * this.segments.length);
    
    // Ù„Ø§ Ù†Ø­Ø¯Ø¯ selectedDiscount Ø§Ù„Ø¢Ù† - Ø³Ù†Ø­Ø¯Ø¯Ù‡ Ø¨Ø¹Ø¯ Ø§Ù†ØªÙ‡Ø§Ø¡ Ø§Ù„Ø¯ÙˆØ±Ø§Ù† Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ø§Ù„Ù‚Ø·Ø¹Ø© Ø§Ù„ÙØ¹Ù„ÙŠØ©

    // Calculate final rotation - Ù…Ù†Ø·Ù‚ ØµØ­ÙŠØ­ ÙˆÙ…Ø¨Ø³Ø·
    // Ø¹Ù†Ø¯ rotation = 0: Ø§Ù„Ù‚Ø·Ø¹Ø© 0 ÙÙŠ Ø§Ù„Ø£Ø¹Ù„Ù‰ (ØªØ­Øª Ø§Ù„Ø³Ù‡Ù… Ø¹Ù†Ø¯ -Math.PI/2)
    // Ù†Ø±ÙŠØ¯ Ø£Ù† Ø§Ù„Ù‚Ø·Ø¹Ø© randomIndex ØªÙƒÙˆÙ† ÙÙŠ Ø§Ù„Ø£Ø¹Ù„Ù‰ Ø¨Ø¹Ø¯ Ø§Ù„Ø¯ÙˆØ±Ø§Ù†
    
    // Ø¹Ø¯Ø¯ Ù„ÙØ§Øª ÙƒØ§Ù…Ù„Ø© (5-7 Ù„ÙØ§Øª Ù„Ø­Ø±ÙƒØ© ÙˆØ§Ù‚Ø¹ÙŠØ©)
    const fullRotations = 5 + Math.random() * 2; // 5-7 full rotations
    
    // Ø­Ø³Ø§Ø¨ Ø§Ù„Ø¯ÙˆØ±Ø§Ù† Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ Ø¨Ø¯Ù‚Ø©:
    // Ø§Ù„Ù‚Ø·Ø¹Ø© randomIndex ØªØ¨Ø¯Ø£ Ù…Ù†: randomIndex * segmentAngle - Math.PI/2 (Ø¹Ù†Ø¯ rotation = 0)
    // Ù†Ø±ÙŠØ¯ Ø£Ù† ØªÙƒÙˆÙ† ÙÙŠ -Math.PI/2 (Ø§Ù„Ø£Ø¹Ù„Ù‰ ØªØ­Øª Ø§Ù„Ø³Ù‡Ù…)
    // Ù†Ø­ØªØ§Ø¬: randomIndex * segmentAngle - Math.PI/2 + rotation = -Math.PI/2 (mod 2Ï€)
    // Ø£ÙŠ: randomIndex * segmentAngle + rotation = 0 (mod 2Ï€)
    // Ø£ÙŠ: rotation = -randomIndex * segmentAngle (mod 2Ï€)
    // Ù„Ù„Ø¯ÙˆØ±Ø§Ù† clockwise (Ù…ÙˆØ¬Ø¨): rotation = 2Ï€ - randomIndex * segmentAngle
    
    // Ù†Ø¶ÙŠÙ Ù„ÙØ§Øª ÙƒØ§Ù…Ù„Ø©:
    const baseRotations = fullRotations * 2 * Math.PI; // 5-7 Ù„ÙØ§Øª ÙƒØ§Ù…Ù„Ø©
    const segmentRotation = (2 * Math.PI) - (randomIndex * this.segmentAngle); // Ø¯ÙˆØ±Ø§Ù† Ù„Ù„Ù‚Ø·Ø¹Ø©
    
    // Ø§Ù„Ø¯ÙˆØ±Ø§Ù† Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ = Ù„ÙØ§Øª ÙƒØ§Ù…Ù„Ø© + Ø¯ÙˆØ±Ø§Ù† Ù„Ù„Ù‚Ø·Ø¹Ø©
    const finalRotation = baseRotations + segmentRotation;

    // Animate - Ù†Ù…Ø±Ø± randomIndex Ù„Ù„ØªØ­Ù‚Ù‚ Ù„Ø§Ø­Ù‚Ø§Ù‹
    this.animateSpin(finalRotation, randomIndex);
  }

  animateSpin(targetRotation: number, targetSegmentIndex: number) {
    const duration = 3000; // 3 seconds (Ø³Ø±ÙŠØ¹ ÙˆÙˆØ§Ù‚Ø¹ÙŠ)
    const startTime = Date.now();
    const startRotation = 0; // Ù†Ø¨Ø¯Ø£ Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ù…Ù† 0
    
    // targetRotation ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ù„ÙØ§Øª Ø§Ù„ÙƒØ§Ù…Ù„Ø© + Ø§Ù„Ø¯ÙˆØ±Ø§Ù† Ù„Ù„Ù‚Ø·Ø¹Ø©
    // Ù†Ø±ÙŠØ¯ Ø£Ù† Ù†Ø¯ÙˆØ± Ù…Ù† 0 Ø¥Ù„Ù‰ targetRotation Ù…Ø¨Ø§Ø´Ø±Ø©
    let rotationDiff = targetRotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic) - Ø­Ø±ÙƒØ© Ø³Ù„Ø³Ø©
      const easeOut = 1 - Math.pow(1 - progress, 3);
      this.currentRotation = startRotation + rotationDiff * easeOut;

      if (this.ctx && this.wheelCanvas) {
        this.drawWheel(this.currentRotation);
      }

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        // Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ø¯ÙˆØ±Ø§Ù† Ø§Ù„ØµØ­ÙŠØ­ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ
        this.currentRotation = startRotation + rotationDiff;
        if (this.ctx && this.wheelCanvas) {
          this.drawWheel(this.currentRotation);
        }
        
        // Ø­Ø³Ø§Ø¨ Ø§Ù„Ù‚Ø·Ø¹Ø© Ø§Ù„ÙØ¹Ù„ÙŠØ© Ø§Ù„ØªÙŠ ØªÙˆÙ‚ÙØª Ø¹Ù„ÙŠÙ‡Ø§ Ø§Ù„Ø¹Ø¬Ù„Ø© Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ Ø§Ù„Ø¯ÙˆØ±Ø§Ù† Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ
        const actualSegmentIndex = this.getSegmentAtPointer(this.currentRotation);
        
        // Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù‚Ø·Ø¹Ø© Ø§Ù„ÙØ¹Ù„ÙŠØ© Ù„ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø®ØµÙ… (ÙˆÙ„ÙŠØ³ Ø§Ù„Ù‚Ø·Ø¹Ø© Ø§Ù„Ù…ØªÙˆÙ‚Ø¹Ø©)
        // Ù‡Ø°Ø§ ÙŠØ¶Ù…Ù† Ø£Ù† Ø§Ù„Ø®ØµÙ… ÙÙŠ Ø§Ù„ÙÙˆØ±Ù… ÙŠØ·Ø§Ø¨Ù‚ Ø§Ù„Ù‚Ø·Ø¹Ø© Ø§Ù„ØªÙŠ ØªÙˆÙ‚ÙØª Ø¹Ù„ÙŠÙ‡Ø§ Ø§Ù„Ø¹Ø¬Ù„Ø© ÙØ¹Ù„ÙŠØ§Ù‹
        this.selectedSegmentIndex = actualSegmentIndex;
        const selectedSegment = this.segments[actualSegmentIndex];
        // âœ… Ø­ÙØ¸ Ø§Ù„Ù†Øµ ÙˆØ§Ù„Ø®ØµÙ…
        this.selectedSegmentText = selectedSegment.text;
        // âœ… Ø­ÙØ¸ Ø§Ù„Ù‚ÙŠÙ…Ø© (Ø±Ù‚Ù… Ù„Ù„Ø®ØµÙ…ØŒ Ù†Øµ Ù„Ù„Ù‡Ø¯ÙŠØ©)
        const discountValue = selectedSegment.discount;
        // âœ… Ù„Ù„Ø®ØµÙˆÙ…Ø§Øª: Ø­ÙØ¸ Ø§Ù„Ù‚ÙŠÙ…Ø© ÙƒØ±Ù‚Ù…ØŒ Ù„Ù„Ù‡Ø¯Ø§ÙŠØ§: Ø­ÙØ¸ 0
        this.selectedDiscount = typeof discountValue === 'number' ? discountValue : 0;
        
        // Debug: Ù„Ù„ØªØ£ÙƒØ¯ Ù…Ù† Ø£Ù† Ø§Ù„Ø­Ø³Ø§Ø¨ ØµØ­ÙŠØ­
        console.log('Wheel stopped:', {
          targetSegment: targetSegmentIndex,
          actualSegment: actualSegmentIndex,
          targetDiscount: this.segments[targetSegmentIndex]?.discount,
          actualDiscount: discountValue,
          isGift: selectedSegment.isGift,
          rotation: this.currentRotation
        });
        
        // Ø§Ø³ØªØ®Ø¯Ø§Ù… setTimeout ØµØºÙŠØ± Ù„Ø¶Ù…Ø§Ù† Ø§ÙƒØªÙ…Ø§Ù„ Ø§Ù„Ø±Ø³Ù…
        setTimeout(() => {
          this.onSpinComplete();
        }, 50);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  // Ø¯Ø§Ù„Ø© Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ù‚Ø·Ø¹Ø© Ø§Ù„ØªÙŠ ÙÙŠ Ø§Ù„Ø£Ø¹Ù„Ù‰ (ØªØ­Øª Ø§Ù„Ø³Ù‡Ù…) Ø¨Ù†Ø§Ø¡Ù‹ Ø¹Ù„Ù‰ rotation
  getSegmentAtPointer(rotation: number): number {
    // Normalize rotation Ø¥Ù„Ù‰ 0-2Ï€
    let normalizedRotation = rotation % (2 * Math.PI);
    if (normalizedRotation < 0) {
      normalizedRotation += 2 * Math.PI;
    }
    
    // Ø§Ù„Ù…Ù†Ø·Ù‚ Ø§Ù„ØµØ­ÙŠØ­:
    // Ø§Ù„Ø³Ù‡Ù… Ø«Ø§Ø¨Øª ÙÙŠ Ø§Ù„Ø£Ø¹Ù„Ù‰ Ø¹Ù†Ø¯ -90Â° (Ø£Ùˆ -Math.PI/2)
    // Ø¹Ù†Ø¯ rotation = 0: Ø§Ù„Ù‚Ø·Ø¹Ø© 0 ØªØ¨Ø¯Ø£ Ù…Ù† -90Â° (ÙÙŠ Ø§Ù„Ø£Ø¹Ù„Ù‰)
    // Ø§Ù„Ù‚Ø·Ø¹Ø© index ØªØ¨Ø¯Ø£ Ù…Ù†: index * segmentAngle - Math.PI/2
    // Ø¨Ø¹Ø¯ Ø¯ÙˆØ±Ø§Ù† Ø¨Ù…Ù‚Ø¯Ø§Ø± rotation: index * segmentAngle - Math.PI/2 + rotation
    
    // Ù†Ø±ÙŠØ¯ Ø£Ù† Ù†Ø¹Ø±Ù Ø£ÙŠ Ù‚Ø·Ø¹Ø© Ø§Ù„Ø¢Ù† ÙÙŠ Ø§Ù„Ø£Ø¹Ù„Ù‰ (ØªØ¨Ø¯Ø£ Ù…Ù† -Math.PI/2)
    // Ø£ÙŠ: index * segmentAngle - Math.PI/2 + rotation = -Math.PI/2 (mod 2Ï€)
    // Ø£ÙŠ: index * segmentAngle + rotation = 0 (mod 2Ï€)
    // Ø£ÙŠ: index * segmentAngle = -rotation (mod 2Ï€)
    
    // Ø­Ø³Ø§Ø¨ index Ø¨Ø´ÙƒÙ„ Ù…Ø¨Ø§Ø´Ø±
    // Ù†Ø¶ÙŠÙ 2Ï€ Ù„Ù„ØªØ£ÙƒØ¯ Ù…Ù† Ø£Ù† Ø§Ù„Ù†ØªÙŠØ¬Ø© Ù…ÙˆØ¬Ø¨Ø©
    const totalAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);
    
    // Ø­Ø³Ø§Ø¨ index Ø§Ù„Ù‚Ø·Ø¹Ø©
    let segmentIndex = Math.floor(totalAngle / this.segmentAngle);
    
    // Ù†Ø¶Ù…Ù† Ø£Ù† Ø§Ù„Ù†ØªÙŠØ¬Ø© ÙÙŠ Ø§Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„ØµØ­ÙŠØ­
    segmentIndex = segmentIndex % this.segments.length;
    
    return segmentIndex;
  }

  async onSpinComplete() {
    this.isSpinning = false;
    
    // âœ… ðŸ” Ø­ÙØ¸ Ø§Ù„Ø­Ø§Ù„Ø© ÙÙŠ Firebase Ø¨Ø¹Ø¯ Ø§Ù†ØªÙ‡Ø§Ø¡ Ø§Ù„Ù„ÙØ©
    const selectedSegment = this.segments[this.selectedSegmentIndex];
    const discountValue = selectedSegment.discount;
    const discountText = selectedSegment.text;
    
    try {
      // Ø­ÙØ¸ ÙÙŠ Firebase (Ø§Ù„Ù…ØµØ¯Ø± Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ)
      await this.whiteFridaySession.setFormStage({
        discount: discountValue,
        discountText: discountText,
        isGift: selectedSegment.isGift || false
      });
      
      // Ø­ÙØ¸ ÙÙŠ Cookie/localStorage ÙƒÙ€ Mirror (Ù„Ù„Ø£Ø¯Ø§Ø¡)
      this.wheelState.set({
        stage: 'form',
        discount: discountValue,
        discountText: discountText,
        isGift: selectedSegment.isGift || false,
        ts: Date.now()
      });
    } catch (error) {
      console.error('âŒ Error saving form stage:', error);
      // Ø­ØªÙ‰ Ù„Ùˆ ÙØ´Ù„ FirebaseØŒ Ù†ÙƒÙ…Ù„ Ø§Ù„Ø¹Ù…Ù„ÙŠØ©
    }
    
    // Reset rotation Ù„Ù„Ø¯ÙˆØ±Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©
    this.currentRotation = 0;
    
    setTimeout(() => {
      this.showModal = false;
      this.formVisible = true;
      this.updateBodyScrollLock();
      this.scrollModalIntoView('.form-modal .form-box');
      
      // âœ… Silent URL Update: ØªØºÙŠÙŠØ± URL Ø¹Ù†Ø¯ Ø¸Ù‡ÙˆØ± Ø§Ù„ÙÙˆØ±Ù…
      this.location.replaceState('/white-friday/form');
      
      this.cdr.markForCheck();
    }, 300); // ÙˆÙ‚Øª Ù‚ØµÙŠØ± Ø¨Ø¹Ø¯ Ø§Ù„Ø§Ù†ØªÙ‡Ø§Ø¡
  }

  // playSound method removed - no sound needed

  closeModal() {
    this.showModal = false;
    this.formVisible = false;
    this.updateBodyScrollLock();
    // Ù„Ø§ Ù†Ø­ÙØ¸ ÙÙŠ localStorage - ØªØ¸Ù‡Ø± ÙƒÙ„ Ù…Ø±Ø©
  }

  submitForm() {
    if (!this.formData.name || !this.formData.phone || !this.formData.carType) {
      alert('â›” ÙŠØ±Ø¬Ù‰ Ù…Ù„Ø¡ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ„');
      return;
    }

    // âœ… Silent URL Update: ØªØºÙŠÙŠØ± URL ÙÙˆØ±Ù‹Ø§ Ø¹Ù†Ø¯ Ø§Ù„Ø¶ØºØ· Ø¹Ù„Ù‰ "Ø¥Ø±Ø³Ø§Ù„" (Ù‚Ø¨Ù„ Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ø±Ø¯ Ù…Ù† Ø§Ù„Ø³ÙŠØ±ÙØ±)
    this.location.replaceState('/white-friday/submitting');

    // âœ… ØªÙØ¹ÙŠÙ„ Ø­Ø§Ù„Ø© Ø§Ù„ØªØ­Ù…ÙŠÙ„
    this.isLoading = true;
    this.cdr.markForCheck();

    // âœ… ØªØ­Ø¯ÙŠØ¯ Ù†ÙˆØ¹ Ø§Ù„Ø®ØµÙ… (Ù†Ø³Ø¨Ø© Ù…Ø¦ÙˆÙŠØ© Ø£Ùˆ Ù‡Ø¯ÙŠØ©)
    const selectedSegment = this.segments[this.selectedSegmentIndex];
    const isGift = selectedSegment?.isGift || false;
    const discountText = isGift 
      ? `Ù‡Ø¯ÙŠØ© White Friday: ${selectedSegment.discount}` 
      : `Ø®ØµÙ… White Friday: ${this.selectedDiscount}%`;
    
    const payload: any = {
      full_name: this.formData.name,
      mobile: this.formData.phone,
      client_16945026668577: this.formData.carType, // Car Type
      notes: discountText,
      form_source: 'white_friday_wheel',
      utm_campaign: 'White Friday 2025'
    };

    // âœ… ØªÙˆÙ„ÙŠØ¯ ÙƒÙˆØ¯ Ø§Ù„Ø®ØµÙ…
    const discountCode = this.generateDiscountCode();
    // âœ… Ù„Ù„Ù‡Ø¯Ø§ÙŠØ§ Ù†Ø³ØªØ®Ø¯Ù… 0ØŒ Ù„Ù„Ø®ØµÙˆÙ…Ø§Øª Ù†Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„ÙØ¹Ù„ÙŠØ©
    const discountValue = isGift ? 0 : (this.selectedDiscount || 20);

    // Store discount in localStorage
    localStorage.setItem('whiteFridayDiscount', discountValue.toString());
    localStorage.setItem('whiteFridayDiscountName', this.formData.name);
    localStorage.setItem('whiteFridayDiscountCode', discountCode);

    console.log('ðŸ“¤ Sending White Friday Wheel Form Data:', payload);

    // âœ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù„Ù„Ù€ API Ø§Ù„Ø¬Ø¯ÙŠØ¯ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… ApiService (Ù†ÙØ³ Ø§Ù„Ø¨Ø§Ùƒ Ø¥Ù†Ø¯)
    this.apiService.submitContactForm(payload).subscribe({
      next: async (response: any) => {
        console.log('âœ… Backend response received:', response);

        // âœ… Ø­Ø§Ù„Ø© Ø§Ù„Ù†Ø¬Ø§Ø­ Ø§Ù„Ø¹Ø§Ù…Ø©
        if (response.success) {
          console.log('âœ… Form saved in Dashboard (MongoDB)');
        }

        // âœ… 8xCRM Response (Ù…Ù† Ø§Ù„Ø¨Ø§Ùƒ Ø¥Ù†Ø¯)
        if (response.eightxResponse) {
          console.log('âœ… 8xCRM success:', response.eightxResponse);
        } else if (response.eightxError) {
          console.warn('âš ï¸ 8xCRM failed:', response.eightxError);
        } else {
          console.log('âš ï¸ 8xCRM skipped or no data from backend.');
        }

        // âœ… Ø¥Ø±Ø³Ø§Ù„ Ù…Ù†ÙØµÙ„ Ù„Ù„Ù€ 8xCRM API
        this.apiService.submit8xLead({
          full_name: this.formData.name,
          mobile: this.formData.phone,
          notes: `${discountText} - ÙƒÙˆØ¯: ${discountCode}`
        }).subscribe({
          next: (res) => {
            console.log('âœ… 8xCRM Response:', res);
          },
          error: (err) => {
            console.error('âŒ 8xCRM Error:', err);
          }
        });

        // âœ… Ø­ÙØ¸ Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù‚Ø¨Ù„ Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø§Ù„ÙÙˆØ±Ù…
        const customerName = this.formData.name;

        // âœ… ðŸ” Ù†Ø¬Ø§Ø­ â†’ Ø«Ø¨Ù‘Øª Ø§Ù„Ø­Ø§Ù„Ø© submitted ÙÙŠ Firebase Ù„Ù…Ù†Ø¹ Ø§Ù„Ù„Ø¹Ø¨ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰
        const selectedSegment = this.segments[this.selectedSegmentIndex];
        
        try {
          // Ø­ÙØ¸ ÙÙŠ Firebase (Ø§Ù„Ù…ØµØ¯Ø± Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ)
          await this.whiteFridaySession.markSubmitted();
          
          // Ø­ÙØ¸ ÙÙŠ Cookie/localStorage ÙƒÙ€ Mirror
          this.wheelState.set({
            stage: 'submitted',
            discount: selectedSegment.discount,
            discountText: selectedSegment.text,
            isGift: selectedSegment.isGift || false,
            ts: Date.now()
          });
        } catch (error) {
          console.error('âŒ Error marking as submitted:', error);
          // Ø­ØªÙ‰ Ù„Ùˆ ÙØ´Ù„ FirebaseØŒ Ù†ÙƒÙ…Ù„ Ø§Ù„Ø¹Ù…Ù„ÙŠØ©
        }

        // âœ… Ø¥Ø®ÙØ§Ø¡ Ø­Ø§Ù„Ø© Ø§Ù„ØªØ­Ù…ÙŠÙ„ Ø¨Ø¹Ø¯ Ù†Ø¬Ø§Ø­ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„
        this.isLoading = false;
        this.cdr.markForCheck();

        // âœ… Ø¥Ø®ÙØ§Ø¡ Ø§Ù„ÙÙˆØ±Ù…
        this.formVisible = false;
        this.resetForm();
        this.updateBodyScrollLock();

        // âœ… Silent URL Update: ØªØºÙŠÙŠØ± URL Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ù†Ø¬Ø§Ø­ Ù‚Ø¨Ù„ Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„
        this.location.replaceState('/white-friday/success');

        // âœ… Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„Ù‰ ØµÙØ­Ø© Ø§Ù„Ø´ÙƒØ± Ø¨Ø¹Ø¯ Ù†Ø¬Ø§Ø­ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ Ù…Ø¹ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø®ØµÙ…
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
        // âœ… Ø¥ÙŠÙ‚Ø§Ù Ø­Ø§Ù„Ø© Ø§Ù„ØªØ­Ù…ÙŠÙ„ Ø¹Ù†Ø¯ Ø§Ù„Ø®Ø·Ø£
        this.isLoading = false;
        this.cdr.markForCheck();
        
        // âœ… Silent URL Update: Ø±Ø¬ÙˆØ¹ URL Ù„Ù„ÙÙˆØ±Ù… Ø¹Ù†Ø¯ Ø§Ù„ÙØ´Ù„
        this.location.replaceState('/white-friday/form');
        
        alert('âŒ Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰');
      }
    });
  }

  // âœ… Ø¯Ø§Ù„Ø© Ù„ØªÙˆÙ„ÙŠØ¯ ÙƒÙˆØ¯ Ø§Ù„Ø®ØµÙ… Ø§Ù„Ø¹Ø´ÙˆØ§Ø¦ÙŠ
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

  private scrollModalIntoView(selector: string) {
    if (typeof document === 'undefined') {
      return;
    }

    setTimeout(() => {
      const target = document.querySelector(selector);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  }

  private updateBodyScrollLock() {
    if (typeof document === 'undefined') {
      return;
    }

    if (this.showModal || this.formVisible) {
      document.body.classList.add(this.bodyScrollClass);
    } else {
      document.body.classList.remove(this.bodyScrollClass);
    }
  }

  private hasUserSeenWheel(): boolean {
    try {
      if (typeof window === 'undefined' || !('localStorage' in window)) return false;
      return window.localStorage.getItem(this.wheelShownStorageKey) === '1';
    } catch {
      return false;
    }
  }

  /**
   * Ø¹Ø±Ø¶ Ø±Ø³Ø§Ù„Ø© "Ø¬Ø±Ø¨Øª Ù‚Ø¨Ù„ ÙƒØ¯Ù‡" Ø¹Ù†Ø¯ Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ù„Ù„Ø¹Ø¨ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰
   */
  private showPlayedMessage(): void {
    // ÙŠÙ…ÙƒÙ† Ø§Ø³ØªØ¨Ø¯Ø§Ù„ alert Ø¨Ù€ Toast/Snackbar Ø­Ø³Ø¨ Ø§Ù„ØªØµÙ…ÙŠÙ…
    alert('âš ï¸ Ø£Ù†Øª Ø¨Ø§Ù„ÙØ¹Ù„ Ø´Ø§Ø±ÙƒØª Ù‚Ø¨Ù„ ÙƒØ¯Ù‡. Ù„Ùˆ Ù…Ø­ØªØ§Ø¬ Ù…Ø³Ø§Ø¹Ø¯Ø© ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§.');
    
    // Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ù…ÙˆØ¯Ø§Ù„ Ø¥Ø°Ø§ ÙƒØ§Ù† Ø¸Ø§Ù‡Ø±Ø§Ù‹
    this.showModal = false;
    this.updateBodyScrollLock();
  }

  private markWheelAsShown(): void {
    try {
      if (typeof window === 'undefined' || !('localStorage' in window)) return;
      // Ù†Ø³ØªØ®Ø¯Ù… Ù‚ÙŠÙ…Ø© Ø¨Ø³ÙŠØ·Ø© '1' Ù„Ø¶Ù…Ø§Ù† Ø§Ù„ØªÙˆØ§ÙÙ‚ ÙˆØ¹Ø¯Ù… Ø§Ù„Ø­Ø§Ø¬Ø© Ù„Ø§Ù†ØªÙ‡Ø§Ø¡ ØµÙ„Ø§Ø­ÙŠØ©
      window.localStorage.setItem(this.wheelShownStorageKey, '1');
    } catch {
      // ØªØ¬Ø§Ù‡Ù„ Ø£ÙŠ Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØ®Ø²ÙŠÙ† (ÙˆØ¶Ø¹ Ø®Ø§Øµ Ø£Ùˆ Ù…Ø³Ø§Ø­Ø© Ù…Ù…ØªÙ„Ø¦Ø©)
    }
  }
}

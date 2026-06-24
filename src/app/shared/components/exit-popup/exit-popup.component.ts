import { Component, HostListener, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exit-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exit-popup.component.html',
  styleUrls: ['./exit-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExitPopupComponent implements OnInit, OnDestroy {
  showPopup = false;
  hasShown = false;
  private mouseLeaveTimer: any = null;
  private touchStartY = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    // Check if popup was already shown in this session
    this.hasShown = this.getSessionStorage('exitPopupShown') === 'true';
  }

  ngOnInit(): void {
    // Monitor page visibility changes (for mobile)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Monitor touch events for mobile exit detection
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    document.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    
    if (this.mouseLeaveTimer) {
      clearTimeout(this.mouseLeaveTimer);
    }
  }

  // Desktop: Detect mouse movement to top of page
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (this.hasShown || this.showPopup) return;

    // Check if mouse is moving towards top of page (more sensitive)
    if (e.clientY < 100) {
      this.mouseLeaveTimer = setTimeout(() => {
        this.showPopupOnce();
      }, 50); // Faster response
    } else {
      if (this.mouseLeaveTimer) {
        clearTimeout(this.mouseLeaveTimer);
        this.mouseLeaveTimer = null;
      }
    }
  }

  // Desktop: Detect when user tries to leave the page
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent): void {
    if (!this.hasShown && !this.showPopup) {
      this.showPopupOnce();
      event.preventDefault();
      event.returnValue = ''; // Chrome requires this
    }
  }

  // Desktop: Detect Escape key press
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && !this.hasShown && !this.showPopup) {
      this.showPopupOnce();
    }
  }

  // Mobile: Handle visibility change (when user switches tabs)
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden' && !this.hasShown && !this.showPopup) {
      this.showPopupOnce();
    }
  }

  // Mobile: Handle touch start
  private handleTouchStart(e: TouchEvent): void {
    this.touchStartY = e.touches[0].clientY;
  }

  // Mobile: Handle touch move (detect upward swipe)
  private handleTouchMove(e: TouchEvent): void {
    if (this.hasShown || this.showPopup) return;

    const currentY = e.touches[0].clientY;
    const deltaY = this.touchStartY - currentY;
    
    // Detect upward swipe (exit intent)
    if (deltaY > 100 && currentY < 50) {
      this.showPopupOnce();
    }
  }

  // Show popup only once per session
  private showPopupOnce(): void {
    if (this.hasShown || this.showPopup) return;

    console.log('🎯 Showing exit popup!');
    this.showPopup = true;
    this.hasShown = true;
    this.setSessionStorage('exitPopupShown', 'true');
    this.cdr.markForCheck();

    // Track analytics event
    this.trackExitIntent();
  }

  // Close popup
  closePopup(): void {
    console.log('❌ Closing popup');
    this.showPopup = false;
    this.cdr.markForCheck();
  }

  // Claim offer action
  claimOffer(): void {
    console.log('✅ Claiming offer');
    this.showPopup = false;
    this.cdr.markForCheck();
    
    // Track successful conversion
    this.trackOfferClaimed();
    
    // Navigate to contact page or show success message
    this.router.navigate(['/contact']);
    
    // Show success message
    setTimeout(() => {
      alert('🎉 تم تطبيق خصم 30% على طلبك! سيتم التواصل معك قريباً.');
    }, 500);
  }

  // Analytics tracking
  private trackExitIntent(): void {
    console.log('📊 Exit intent tracked');
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exit_intent_detected', {
        event_category: 'engagement',
        event_label: 'popup_shown'
      });
    }
  }

  private trackOfferClaimed(): void {
    console.log('📊 Offer claimed tracked');
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'offer_claimed', {
        event_category: 'conversion',
        event_label: '30_percent_discount'
      });
    }
  }

  // Session storage helpers
  private getSessionStorage(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  private setSessionStorage(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.warn('SessionStorage not available');
    }
  }
}

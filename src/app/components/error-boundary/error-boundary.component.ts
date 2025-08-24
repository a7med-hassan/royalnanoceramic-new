import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="hasError" class="error-boundary">
      <div class="error-content">
        <h2>عذراً، حدث خطأ ما</h2>
        <p>نعتذر عن هذا الخطأ. يرجى تحديث الصفحة أو المحاولة مرة أخرى.</p>
        <button (click)="reloadPage()" class="reload-btn">تحديث الصفحة</button>
        <button (click)="goHome()" class="home-btn">العودة للرئيسية</button>
      </div>
    </div>
    <ng-content *ngIf="!hasError"></ng-content>
  `,
  styles: [
    `
      .error-boundary {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .error-content {
        text-align: center;
        color: #fff;
        max-width: 500px;
        padding: 2rem;
      }

      h2 {
        color: #ffd700;
        margin-bottom: 1rem;
        font-size: 2rem;
      }

      p {
        margin-bottom: 2rem;
        font-size: 1.1rem;
        line-height: 1.6;
      }

      button {
        background: #ffd700;
        color: #1a1a1a;
        border: none;
        padding: 0.8rem 1.5rem;
        margin: 0 0.5rem;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      button:hover {
        background: #b8860b;
        transform: translateY(-2px);
      }

      .reload-btn {
        background: #ffd700;
      }

      .home-btn {
        background: transparent;
        color: #ffd700;
        border: 2px solid #ffd700;
      }

      .home-btn:hover {
        background: #ffd700;
        color: #1a1a1a;
      }

      @media (max-width: 768px) {
        .error-content {
          padding: 1rem;
        }

        h2 {
          font-size: 1.5rem;
        }

        p {
          font-size: 1rem;
        }

        button {
          display: block;
          width: 100%;
          margin: 0.5rem 0;
        }
      }
    `,
  ],
})
export class ErrorBoundaryComponent {
  hasError = false;
  errorMessage = '';

  constructor() {
    // Listen for global errors
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener(
      'unhandledrejection',
      this.handlePromiseRejection.bind(this)
    );
  }

  private handleError(event: ErrorEvent): void {
    this.hasError = true;
    this.errorMessage = event.error?.message || 'حدث خطأ غير متوقع';
    console.error('Error caught by boundary:', event.error);
  }

  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    this.hasError = true;
    this.errorMessage = event.reason?.message || 'حدث خطأ في العملية';
    console.error('Promise rejection caught by boundary:', event.reason);
  }

  reloadPage(): void {
    window.location.reload();
  }

  goHome(): void {
    window.location.href = '/home';
  }
}

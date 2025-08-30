import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ErrorHandlerService,
  ErrorInfo,
  NetworkStatus,
} from '../../shared/services/error-handler.service';

@Component({
  selector: 'app-error-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Network Status Banner -->
    <div class="network-banner" *ngIf="!networkStatus.isOnline" [@slideDown]>
      <div class="network-content">
        <i class="fas fa-wifi network-icon"></i>
        <span class="network-message">
          لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك.
        </span>
        <button class="retry-btn" (click)="retryConnection()">
          <i class="fas fa-redo"></i>
          إعادة المحاولة
        </button>
      </div>
    </div>

    <!-- Error Notification -->
    <div class="error-notification" *ngIf="currentError" [@slideDown]>
      <div class="error-content" [class]="'severity-' + currentError.severity">
        <div class="error-header">
          <i
            class="error-icon"
            [class]="getErrorIcon(currentError.severity)"
          ></i>
          <span class="error-title">{{
            getErrorTitle(currentError.severity)
          }}</span>
          <button class="close-btn" (click)="dismissError()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="error-message">{{ currentError.message }}</div>
        <div
          class="error-actions"
          *ngIf="
            currentError.severity === 'high' ||
            currentError.severity === 'critical'
          "
        >
          <button class="retry-btn" (click)="retryAction()">
            <i class="fas fa-redo"></i>
            إعادة المحاولة
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./error-notification.component.scss'],
})
export class ErrorNotificationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentError: ErrorInfo | null = null;
  networkStatus: NetworkStatus = { isOnline: true, lastChecked: new Date() };

  constructor(private errorHandler: ErrorHandlerService) {}

  ngOnInit(): void {
    // Subscribe to error updates
    this.errorHandler.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        this.currentError = error;

        // Auto-dismiss low severity errors after 5 seconds
        if (
          error &&
          (error.severity === 'low' || error.severity === 'medium')
        ) {
          setTimeout(() => {
            this.dismissError();
          }, 5000);
        }
      });

    // Subscribe to network status updates
    this.errorHandler.networkStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        this.networkStatus = status;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismissError(): void {
    this.errorHandler.clearError();
  }

  retryConnection(): void {
    // Force network check
    if (navigator.onLine) {
      this.errorHandler.clearError();
    } else {
      // Show offline message
      this.errorHandler.handleNetworkError({ message: 'Still offline' });
    }
  }

  retryAction(): void {
    // This would be implemented based on the specific error context
    // For now, just dismiss the error
    this.dismissError();
  }

  getErrorIcon(severity: string): string {
    const icons = {
      low: 'fas fa-info-circle',
      medium: 'fas fa-exclamation-triangle',
      high: 'fas fa-exclamation-circle',
      critical: 'fas fa-times-circle',
    };
    return icons[severity as keyof typeof icons] || 'fas fa-exclamation-circle';
  }

  getErrorTitle(severity: string): string {
    const titles = {
      low: 'تنبيه',
      medium: 'تحذير',
      high: 'خطأ',
      critical: 'خطأ حرج',
    };
    return titles[severity as keyof typeof titles] || 'خطأ';
  }
}

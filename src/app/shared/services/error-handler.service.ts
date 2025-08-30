import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface NetworkStatus {
  isOnline: boolean;
  lastChecked: Date;
  connectionType?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private errorSubject = new BehaviorSubject<ErrorInfo | null>(null);
  private networkStatusSubject = new BehaviorSubject<NetworkStatus>({
    isOnline: navigator.onLine,
    lastChecked: new Date(),
  });

  public error$ = this.errorSubject.asObservable();
  public networkStatus$ = this.networkStatusSubject.asObservable();

  constructor() {
    this.setupNetworkMonitoring();
  }

  /**
   * Handle different types of errors
   */
  handleError(error: any, context?: string): void {
    console.error('Error occurred:', error);

    const errorInfo: ErrorInfo = {
      code: this.getErrorCode(error),
      message: this.getErrorMessage(error),
      details: error,
      timestamp: new Date(),
      severity: this.getErrorSeverity(error),
    };

    this.errorSubject.next(errorInfo);

    // Log to console in development
    if (!environment.production) {
      console.error('Error Details:', errorInfo);
    }
  }

  /**
   * Handle network errors specifically
   */
  handleNetworkError(error: any): void {
    const networkError: ErrorInfo = {
      code: 'NETWORK_ERROR',
      message:
        'مشكلة في الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',
      details: error,
      timestamp: new Date(),
      severity: 'high',
    };

    this.errorSubject.next(networkError);
  }

  /**
   * Handle API errors
   */
  handleApiError(error: any, endpoint?: string): void {
    let message = 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.';

    if (error.status === 401) {
      message = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
    } else if (error.status === 403) {
      message = 'ليس لديك صلاحية للوصول إلى هذا المورد.';
    } else if (error.status === 404) {
      message = 'المورد المطلوب غير موجود.';
    } else if (error.status === 500) {
      message = 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
    } else if (error.status === 0) {
      message = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
    }

    const apiError: ErrorInfo = {
      code: `API_ERROR_${error.status || 'UNKNOWN'}`,
      message,
      details: { error, endpoint },
      timestamp: new Date(),
      severity: error.status >= 500 ? 'high' : 'medium',
    };

    this.errorSubject.next(apiError);
  }

  /**
   * Clear current error
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Get current error
   */
  getCurrentError(): ErrorInfo | null {
    return this.errorSubject.value;
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.networkStatusSubject.value.isOnline;
  }

  /**
   * Get network status
   */
  getNetworkStatus(): NetworkStatus {
    return this.networkStatusSubject.value;
  }

  /**
   * Setup network monitoring
   */
  private setupNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this.updateNetworkStatus(true);
    });

    window.addEventListener('offline', () => {
      this.updateNetworkStatus(false);
    });

    // Check network status periodically
    setInterval(() => {
      this.checkNetworkStatus();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Update network status
   */
  private updateNetworkStatus(isOnline: boolean): void {
    const status: NetworkStatus = {
      isOnline,
      lastChecked: new Date(),
      connectionType: this.getConnectionType(),
    };

    this.networkStatusSubject.next(status);

    if (!isOnline) {
      this.handleNetworkError({ message: 'Connection lost' });
    }
  }

  /**
   * Check network status
   */
  private checkNetworkStatus(): void {
    const isOnline = navigator.onLine;
    const currentStatus = this.networkStatusSubject.value;

    if (currentStatus.isOnline !== isOnline) {
      this.updateNetworkStatus(isOnline);
    }
  }

  /**
   * Get connection type if available
   */
  private getConnectionType(): string | undefined {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    return connection?.effectiveType || 'unknown';
  }

  /**
   * Get error code from error object
   */
  private getErrorCode(error: any): string {
    if (error.code) return error.code;
    if (error.status) return `HTTP_${error.status}`;
    if (error.name) return error.name;
    return 'UNKNOWN_ERROR';
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (error.message) {
      // Check if it's already in Arabic
      if (/[\u0600-\u06FF]/.test(error.message)) {
        return error.message;
      }
    }

    // Default Arabic messages
    const errorMessages: { [key: string]: string } = {
      NETWORK_ERROR: 'مشكلة في الاتصال بالإنترنت',
      TIMEOUT: 'انتهت مهلة الاتصال',
      UNAUTHORIZED: 'غير مصرح لك بالوصول',
      FORBIDDEN: 'ممنوع الوصول',
      NOT_FOUND: 'المورد غير موجود',
      SERVER_ERROR: 'خطأ في الخادم',
      UNKNOWN_ERROR: 'حدث خطأ غير متوقع',
    };

    const code = this.getErrorCode(error);
    return errorMessages[code] || 'حدث خطأ غير متوقع';
  }

  /**
   * Get error severity
   */
  private getErrorSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    if (error.status >= 500) return 'high';
    if (error.status >= 400) return 'medium';
    if (error.status >= 300) return 'low';
    return 'medium';
  }
}

// Import environment
import { environment } from '../../../environments/environment';

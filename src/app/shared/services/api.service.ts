import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ContactFormData {
  full_name: string;
  mobile: string;
  client_16492512972331: string; // ماركة العربية
  client_16849336084508: string; // الموديل
  client_17293620987926: string; // نوع الخدمة
  client_16492513797105: string; // الملاحظات
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface JoinFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  jobPosition: string; // Changed from 'position' to match API
  experience: string;
  additionalMessage: string; // Changed from 'message' to match API
  cvFileName?: string; // Added to match API
  cvPath?: string; // Added to match API
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private BASE_URL = 'https://royal-nano-backend.vercel.app/api/';
  
  // Specific endpoint URLs - only existing ones
  private CONTACT_URL = `${this.BASE_URL}contact`;
  private JOIN_URL = `${this.BASE_URL}join`;
  private HEALTH_URL = `${this.BASE_URL}health`;
  
  // Admin endpoints for retrieving messages
  private ADMIN_CONTACT_URL = `${this.BASE_URL}contact`; // GET request to retrieve all contact messages
  private ADMIN_JOIN_URL = `${this.BASE_URL}join`; // GET request to retrieve all join messages
  
  // Upload endpoint for CV files
  private UPLOAD_URL = `${this.BASE_URL}upload`; // POST request to upload CV files

  constructor(private http: HttpClient) {
    // Test HttpClient immediately
    this.testHttpClient();
  }

  /**
   * Test HttpClient immediately after initialization
   */
  private testHttpClient(): void {
    try {
      // Test with a simple GET request
      this.http.get('https://jsonplaceholder.typicode.com/posts/1').subscribe({
        next: (response) => {
          // HttpClient test successful
        },
        error: (error) => {
          console.error('❌ HttpClient test failed:', error);
        },
      });
    } catch (error) {
      console.error('❌ HttpClient test error:', error);
    }
  }

  /**
   * Submit contact form
   */
  submitContactForm(data: ContactFormData, source: string = 'contact'): Observable<ApiResponse> {
    // Submit to backend API (backend will handle EngazCRM integration)
    return this.http.post<ApiResponse>(`${this.CONTACT_URL}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap((response) => {
        // Contact form submitted successfully
      }),
      catchError((error) => {
        console.error('❌ Backend submission error:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Submit join form
   */
  submitJoinForm(data: JoinFormData): Observable<ApiResponse> {
    // Send as JSON instead of FormData since CV upload is disabled
    const jsonData = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      jobPosition: data.jobPosition,
      experience: data.experience,
      additionalMessage: data.additionalMessage,
      cvFileName: data.cvFileName || '',
      cvPath: data.cvPath || ''
    };

    return this.http.post<ApiResponse>(`${this.JOIN_URL}`, jsonData, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap((response) => {
        // Join form submitted successfully
      }),
      catchError((error) => {
        console.error('❌ Join form submission error:', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Health check endpoint
   */
  healthCheck(): Observable<any> {
    return this.http.get(`${this.HEALTH_URL}`).pipe(
      tap((response) => {
        // Health check successful
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Test connection with different methods
   */
  testConnection(): Observable<any> {
    // Test with different HTTP methods
    return this.http
      .get(`${this.HEALTH_URL}`, {
        observe: 'response',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        tap((response) => {
          // HttpClient test successful
        }),
        catchError((error) => {
          console.error('❌ HttpClient test failed:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Test backend connectivity specifically
   */
  testBackendConnectivity(): Observable<any> {
    // Test health endpoint first
    return this.http.get(`${this.HEALTH_URL}`).pipe(
      tap((response) => {
        // Backend health check successful
      }),
      catchError((error) => {
        console.error('❌ Backend health check failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Test contact form submission with sample data
   */
  testContactFormSubmission(): Observable<any> {
    const testData: ContactFormData = {
      full_name: 'اختبار الاتصال',
      mobile: '01234567890',
      client_16492512972331: 'تويوتا',
      client_16849336084508: '2024',
      client_17293620987926: 'ceramic_coating',
      client_16492513797105: 'هذا اختبار للاتصال بالـ backend',
    };

    return this.http.post<any>(`${this.CONTACT_URL}`, testData).pipe(
      tap((response) => {
        // Test contact form submission successful
      }),
      catchError((error) => {
        console.error('❌ Test contact form submission failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get contact messages (for admin) with fallback endpoints
   */
  getContactMessages(): Observable<any[]> {
    return this.http.get<any>(this.ADMIN_CONTACT_URL).pipe(
      map((response) => {
        // Handle different response formats
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        } else {
          return [];
        }
      }),
      catchError((error) => {
        console.error('❌ Error fetching contact messages:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get join messages (for admin) with fallback endpoints
   */
  getJoinMessages(): Observable<any[]> {
    return this.http.get<any>(this.ADMIN_JOIN_URL).pipe(
      map((response) => {
        // Handle different response formats
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        } else {
          return [];
        }
      }),
      catchError((error) => {
        console.error('❌ Error fetching join messages:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload CV file to server
   * @param file The CV file to upload
   * @returns Observable of upload response with file URL
   */
  uploadCVFile(file: File): Observable<{ fileUrl: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{ fileUrl: string; fileName: string }>(this.UPLOAD_URL, formData).pipe(
      tap((response) => {
        // CV file uploaded successfully
      }),
      catchError((error) => {
        console.error('❌ CV file upload failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete multiple messages by IDs
   * @param type Message type ('contact' or 'join')
   * @param messageIds Array of message IDs to delete
   * @returns Observable of deletion response
   */
  deleteMessages(
    type: 'contact' | 'join',
    messageIds: string[]
  ): Observable<ApiResponse> {
    const endpoint = type === 'contact' ? this.CONTACT_URL : this.JOIN_URL;
    const deleteUrl = `${endpoint}/delete`;

    return this.http.post<ApiResponse>(deleteUrl, { messageIds }).pipe(
      tap((response) => {
        // Successfully deleted messages
      }),
      catchError((error) => {
        console.error(`❌ Error deleting ${type} messages:`, error);
        return this.handleError(error);
      })
    );
  }

  private tryEndpoints(
    endpoints: string[],
    messageType: string
  ): Observable<any[]> {
    let currentObservable: Observable<any> = throwError(
      () => new Error('No endpoints to try')
    );

    endpoints.forEach((endpoint, index) => {
      const nextObservable = this.http.get<any>(endpoint).pipe(
        map((response) => {
          const parsedResponse = this.parseMessagesResponse(response);
          return parsedResponse;
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );

      if (index === 0) {
        currentObservable = nextObservable;
      } else {
        currentObservable = currentObservable.pipe(
          catchError(() => nextObservable)
        );
      }
    });

    return currentObservable.pipe(
      catchError((finalError) => {
        return of([]); // Return empty array if all fail
      })
    );
  }

  /**
   * Parse different response formats
   */
  private parseMessagesResponse(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }

    if (response && response.messages && Array.isArray(response.messages)) {
      return response.messages;
    }

    if (response && response.result && Array.isArray(response.result)) {
      return response.result;
    }

    if (response && response.contacts && Array.isArray(response.contacts)) {
      return response.contacts;
    }

    if (response && response.joins && Array.isArray(response.joins)) {
      return response.joins;
    }

    return [];
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'حدث خطأ غير متوقع';

    console.error('🚨 API Error occurred:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      url: error.url,
      name: error.name,
      error: error.error,
      type: error.type,
      ok: error.ok,
    });

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `خطأ في العميل: ${error.error.message}`;
      console.error('🚨 Client-side error:', error.error);
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage =
            'لا يمكن الاتصال بالخادم - تحقق من الاتصال بالإنترنت أو أن الباك إند يعمل';
          console.error('🚨 Network error - no connection to server');
          console.error('🚨 This usually means:');
          console.error('   - Backend server is down');
          console.error('   - CORS issue');
          console.error('   - Network connectivity problem');
          console.error('   - Wrong URL');
          break;
        case 400:
          errorMessage = 'بيانات غير صحيحة';
          break;
        case 401:
          errorMessage = 'غير مصرح لك بالوصول';
          break;
        case 403:
          errorMessage = 'ممنوع الوصول';
          break;
        case 404:
          errorMessage = 'المورد غير موجود';
          break;
        case 500:
          errorMessage = 'خطأ في الخادم';
          break;
        case 503:
          errorMessage = 'الخدمة غير متاحة حالياً';
          break;
        default:
          errorMessage = `خطأ في الخادم: ${error.status}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ContactFormData {
  fullName: string;
  phoneNumber: string;
  carType: string;
  carModel: string;
  notes: string;
}

export interface JoinFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  position: string;
  jobPosition?: string; // Additional field for backend validation
  experience: string;
  message: string;
  cvFile?: File | null;
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

  constructor(private http: HttpClient) {
    console.log('🚀 ApiService initialized with BASE_URL:', this.BASE_URL);
    console.log('🔧 Contact URL:', this.CONTACT_URL);
    console.log('🔧 Join URL:', this.JOIN_URL);
    console.log('🔧 Health URL:', this.HEALTH_URL);
    console.log('🔧 HttpClient instance:', this.http);
    console.log('🔧 HttpClient type:', typeof this.http);
    console.log('🔧 HttpClient constructor:', this.http.constructor.name);

    // Test HttpClient immediately
    this.testHttpClient();
  }

  /**
   * Test HttpClient immediately after initialization
   */
  private testHttpClient(): void {
    console.log('🧪 Testing HttpClient immediately...');

    try {
      // Test with a simple GET request
      this.http.get('https://jsonplaceholder.typicode.com/posts/1').subscribe({
        next: (response) => {
          console.log('✅ HttpClient test successful:', response);
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
  submitContactForm(data: ContactFormData): Observable<ApiResponse> {
    console.log('📤 Submitting contact form to:', `${this.CONTACT_URL}`);
    console.log('📤 Contact form data:', data);
    console.log('🔧 HttpClient instance:', this.http);
    console.log('🔧 BASE_URL:', this.BASE_URL);
    console.log('🔧 Full URL:', `${this.CONTACT_URL}`);

    return this.http.post<ApiResponse>(`${this.CONTACT_URL}`, data).pipe(
      tap((response) =>
        console.log('✅ Contact form submitted successfully:', response)
      ),
      catchError((error) => {
        console.error('❌ Contact form submission error:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          name: error.name,
          type: error.type,
          ok: error.ok,
        });
        return this.handleError(error);
      })
    );
  }

  /**
   * Submit join form
   */
  submitJoinForm(data: JoinFormData): Observable<ApiResponse> {
    console.log('📤 Submitting join form to:', `${this.JOIN_URL}`);
    console.log('📤 Join form data:', data);
    console.log('🔧 HttpClient instance:', this.http);
    console.log('🔧 BASE_URL:', this.BASE_URL);
    console.log('🔧 Full URL:', `${this.JOIN_URL}`);

    // Create FormData for file upload
    const formData = new FormData();

    // Add text fields
    formData.append('fullName', data.fullName);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('email', data.email);
    formData.append('position', data.position);
    formData.append('jobPosition', data.jobPosition || data.position);
    formData.append('experience', data.experience);
    formData.append('message', data.message);

    // Add CV file if exists
    if (data.cvFile) {
      formData.append('cv', data.cvFile);
      console.log(
        '📎 CV file attached:',
        data.cvFile.name,
        'Size:',
        data.cvFile.size
      );
    }

    console.log(
      '📤 FormData created with',
      formData.getAll('fullName').length,
      'fields'
    );

    return this.http.post<ApiResponse>(`${this.JOIN_URL}`, formData).pipe(
      tap((response) =>
        console.log('✅ Join form submitted successfully:', response)
      ),
      catchError((error) => {
        console.error('❌ Join form submission error:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          name: error.name,
          type: error.type,
          ok: error.ok,
        });
        return this.handleError(error);
      })
    );
  }

  /**
   * Health check endpoint
   */
  healthCheck(): Observable<any> {
    console.log('🏥 Health check to:', `${this.HEALTH_URL}`);

    return this.http.get(`${this.HEALTH_URL}`).pipe(
      tap((response) => console.log('✅ Health check successful:', response)),
      catchError(this.handleError)
    );
  }

  /**
   * Test connection with different methods
   */
  testConnection(): Observable<any> {
    console.log('🧪 Testing connection with HttpClient...');
    console.log('🔗 Base URL:', this.BASE_URL);
    console.log('🔗 Contact URL:', this.CONTACT_URL);
    console.log('🔗 Join URL:', this.JOIN_URL);
    console.log('🔗 Health URL:', this.HEALTH_URL);

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
          console.log('✅ HttpClient test successful:', response);
          console.log('📊 Response status:', response.status);
          console.log('📊 Response headers:', response.headers);
        }),
        catchError((error) => {
          console.error('❌ HttpClient test failed:', error);
          console.error('❌ Error type:', typeof error);
          console.error('❌ Error constructor:', error.constructor.name);
          return this.handleError(error);
        })
      );
  }

  /**
   * Test backend connectivity specifically
   */
  testBackendConnectivity(): Observable<any> {
    console.log('🔗 Testing backend connectivity...');

    // Test health endpoint first
    return this.http.get(`${this.HEALTH_URL}`).pipe(
      tap((response) => {
        console.log('✅ Backend health check successful:', response);
      }),
      catchError((error) => {
        console.error('❌ Backend health check failed:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Test contact form submission with sample data
   */
  testContactFormSubmission(): Observable<any> {
    console.log('🧪 Testing contact form submission...');

    const testData: ContactFormData = {
      fullName: 'اختبار الاتصال',
      phoneNumber: '01234567890',
      carType: 'سيدان',
      carModel: '2024',
      notes: 'هذا اختبار للاتصال بالـ backend',
    };

    console.log('📤 Test data:', testData);
    console.log('🔗 Sending to:', this.CONTACT_URL);

    return this.http.post<any>(`${this.CONTACT_URL}`, testData).pipe(
      tap((response) => {
        console.log('✅ Test contact form submission successful:', response);
      }),
      catchError((error) => {
        console.error('❌ Test contact form submission failed:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Get contact messages (for admin) with fallback endpoints
   */
  getContactMessages(): Observable<any[]> {
    console.log('📥 Fetching contact messages...');
    const endpoints = [`${this.CONTACT_URL}`];
    return this.tryEndpoints(endpoints, 'contact messages');
  }

  /**
   * Get join messages (for admin) with fallback endpoints
   */
  getJoinMessages(): Observable<any[]> {
    console.log('📥 Fetching join messages...');
    const endpoints = [`${this.JOIN_URL}`];
    return this.tryEndpoints(endpoints, 'join messages');
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
    console.log(`🗑️ Deleting ${messageIds.length} ${type} messages...`);
    console.log(`🗑️ Message IDs:`, messageIds);

    const endpoint = type === 'contact' ? this.CONTACT_URL : this.JOIN_URL;
    const deleteUrl = `${endpoint}/delete`;

    console.log(`🗑️ Delete URL:`, deleteUrl);

    return this.http.post<ApiResponse>(deleteUrl, { messageIds }).pipe(
      tap((response) =>
        console.log(`✅ Successfully deleted ${type} messages:`, response)
      ),
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
    console.log(
      `🔄 Trying ${endpoints.length} endpoints for ${messageType}:`,
      endpoints
    );

    let currentObservable: Observable<any> = throwError(
      () => new Error('No endpoints to try')
    );

    endpoints.forEach((endpoint, index) => {
      console.log(
        `🔄 Trying endpoint ${index + 1}/${endpoints.length}: ${endpoint}`
      );

      const nextObservable = this.http.get<any>(endpoint).pipe(
        map((response) => {
          console.log(`✅ Endpoint ${endpoint} succeeded:`, response);
          const parsedResponse = this.parseMessagesResponse(response);
          console.log(`📊 Parsed ${messageType}:`, parsedResponse);
          return parsedResponse;
        }),
        catchError((error) => {
          console.warn(`❌ Endpoint ${endpoint} failed:`, error);
          console.warn(`❌ Error details:`, {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: error.url,
            name: error.name,
          });
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
        console.error(
          `❌ All API endpoints failed for ${messageType}:`,
          finalError
        );
        console.error(`❌ Final error details:`, {
          status: finalError.status,
          statusText: finalError.statusText,
          message: finalError.message,
          url: finalError.url,
          name: finalError.name,
        });
        return of([]); // Return empty array if all fail
      })
    );
  }

  /**
   * Parse different response formats
   */
  private parseMessagesResponse(response: any): any[] {
    console.log('🔍 Parsing response:', response);
    console.log('🔍 Response type:', typeof response);
    console.log('🔍 Is array:', Array.isArray(response));
    console.log(
      '🔍 Response keys:',
      response ? Object.keys(response) : 'null/undefined'
    );

    if (Array.isArray(response)) {
      console.log('✅ Response is array, length:', response.length);
      return response;
    }

    if (response && response.data && Array.isArray(response.data)) {
      console.log('✅ Response has data array, length:', response.data.length);
      return response.data;
    }

    if (response && response.messages && Array.isArray(response.messages)) {
      console.log(
        '✅ Response has messages array, length:',
        response.messages.length
      );
      return response.messages;
    }

    if (response && response.result && Array.isArray(response.result)) {
      console.log(
        '✅ Response has result array, length:',
        response.result.length
      );
      return response.result;
    }

    if (response && response.contacts && Array.isArray(response.contacts)) {
      console.log(
        '✅ Response has contacts array, length:',
        response.contacts.length
      );
      return response.contacts;
    }

    if (response && response.joins && Array.isArray(response.joins)) {
      console.log(
        '✅ Response has joins array, length:',
        response.joins.length
      );
      return response.joins;
    }

    console.log('❌ Could not parse response, returning empty array');
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

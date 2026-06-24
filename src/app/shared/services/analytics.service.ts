import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface PageViewData {
  site: string;
  page: string;
  uid?: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: any;
}

export interface FormSubmitData {
  site: string;
  formType: 'contact' | 'discount' | 'join' | 'landing_page';
  payload?: any;
  uid?: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly SITE_NAME = 'royal_nano';

  constructor(private firestore: Firestore) {}

  /**
   * تسجيل زيارة صفحة
   */
  async logPageView(page: string, extra: any = {}): Promise<void> {
    try {
      const colRef = collection(this.firestore, 'analytics_visits');
      const data: PageViewData = {
        site: this.SITE_NAME,
        page,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        ...extra,
        createdAt: serverTimestamp()
      };
      
      await addDoc(colRef, data);
      console.log('✅ Page view logged:', page);
    } catch (error) {
      console.error('❌ Error logging page view:', error);
    }
  }

  /**
   * تسجيل إرسال نموذج
   */
  async logFormSubmit(formType: 'contact' | 'discount' | 'join' | 'landing_page', payload: any = {}): Promise<void> {
    try {
      const colRef = collection(this.firestore, 'analytics_forms');
      const data: FormSubmitData = {
        site: this.SITE_NAME,
        formType,
        payload: this.sanitizePayload(payload),
        createdAt: serverTimestamp()
      };
      
      await addDoc(colRef, data);
      console.log('✅ Form submit logged:', formType);
    } catch (error) {
      console.error('❌ Error logging form submit:', error);
    }
  }

  /**
   * تسجيل حدث مخصص
   */
  async logCustomEvent(eventName: string, data: any = {}): Promise<void> {
    try {
      const colRef = collection(this.firestore, 'analytics_events');
      await addDoc(colRef, {
        site: this.SITE_NAME,
        eventName,
        data,
        createdAt: serverTimestamp()
      });
      console.log('✅ Custom event logged:', eventName);
    } catch (error) {
      console.error('❌ Error logging custom event:', error);
    }
  }

  /**
   * تسجيل تحويل (conversion)
   */
  async logConversion(conversionType: string, value?: number, data: any = {}): Promise<void> {
    try {
      const colRef = collection(this.firestore, 'analytics_conversions');
      await addDoc(colRef, {
        site: this.SITE_NAME,
        conversionType,
        value: value || 0,
        data,
        createdAt: serverTimestamp()
      });
      console.log('✅ Conversion logged:', conversionType);
    } catch (error) {
      console.error('❌ Error logging conversion:', error);
    }
  }

  /**
   * تنظيف البيانات الحساسة
   */
  private sanitizePayload(payload: any): any {
    const sanitized = { ...payload };
    
    // إزالة البيانات الحساسة
    delete sanitized.password;
    delete sanitized.confirmPassword;
    
    // الاحتفاظ بالبيانات المهمة فقط
    const allowedFields = ['name', 'email', 'phone', 'serviceType', 'carType', 'carModel', 'message'];
    const filtered: any = {};
    
    Object.keys(sanitized).forEach(key => {
      if (allowedFields.includes(key) || key.startsWith('utm_')) {
        filtered[key] = sanitized[key];
      }
    });
    
    return filtered;
  }

  /**
   * تسجيل خطأ
   */
  async logError(error: Error, context: string = ''): Promise<void> {
    try {
      const colRef = collection(this.firestore, 'analytics_errors');
      await addDoc(colRef, {
        site: this.SITE_NAME,
        error: error.message,
        stack: error.stack,
        context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        createdAt: serverTimestamp()
      });
      console.log('✅ Error logged:', error.message);
    } catch (logError) {
      console.error('❌ Error logging error:', logError);
    }
  }
}

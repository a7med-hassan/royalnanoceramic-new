import { Injectable } from '@angular/core';

type WheelStage = 'intro' | 'form' | 'submitted';

export interface WheelState {
  stage: WheelStage;
  discount?: number | string; // يمكن أن يكون رقم (نسبة مئوية) أو نص (هدية)
  discountText?: string; // نص الخصم/الهدية
  isGift?: boolean; // تحديد إذا كان هدية
  ts?: number; // timestamp
}

@Injectable({
  providedIn: 'root'
})
export class WheelStateService {
  private readonly COOKIE = 'rn_wheel';
  private readonly MAX_DAYS = 7;

  /**
   * استرجاع حالة العجلة من Cookie أو localStorage
   */
  get(): WheelState {
    // محاولة قراءة من Cookie أولاً
    let raw = this.getCookie(this.COOKIE);
    
    // إذا لم يوجد في Cookie، جرب localStorage
    if (!raw) {
      raw = localStorage.getItem(this.COOKIE);
    }
    
    if (!raw) {
      return { stage: 'intro' };
    }
    
    try {
      // ✅ فك التشفير Base64 مع دعم Unicode
      const json = this.base64Decode(raw);
      const state = JSON.parse(json) as WheelState;
      
      // التحقق من صحة الحالة
      if (state.stage && ['intro', 'form', 'submitted'].includes(state.stage)) {
        return state;
      }
      
      return { stage: 'intro' };
    } catch (error) {
      console.error('❌ Error parsing wheel state:', error);
      return { stage: 'intro' };
    }
  }

  /**
   * حفظ حالة العجلة في Cookie و localStorage
   */
  set(state: WheelState): void {
    try {
      // إضافة timestamp
      const stateWithTs = {
        ...state,
        ts: Date.now()
      };
      
      // ✅ تشفير Base64 مع دعم Unicode (للأحرف العربية)
      const raw = this.base64Encode(JSON.stringify(stateWithTs));
      
      // حفظ في Cookie (7 أيام)
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + this.MAX_DAYS * 24 * 60 * 60 * 1000);
      document.cookie = `${this.COOKIE}=${raw}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
      
      // مرآة في localStorage
      localStorage.setItem(this.COOKIE, raw);
      
      console.log('✅ Wheel state saved:', state.stage);
    } catch (error) {
      console.error('❌ Error saving wheel state:', error);
    }
  }

  /**
   * مسح حالة العجلة (Cookie + localStorage)
   */
  clear(): void {
    // مسح Cookie
    document.cookie = `${this.COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    
    // مسح localStorage
    localStorage.removeItem(this.COOKIE);
    
    console.log('✅ Wheel state cleared');
  }

  /**
   * قراءة Cookie
   */
  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length, cookie.length);
      }
    }
    
    return null;
  }

  /**
   * التحقق من وجود حالة محفوظة
   */
  hasState(): boolean {
    const state = this.get();
    return state.stage !== 'intro';
  }

  /**
   * التحقق من أن المستخدم قد لعب بالفعل
   */
  hasPlayed(): boolean {
    const state = this.get();
    return state.stage === 'submitted';
  }

  /**
   * التحقق من أن المستخدم في مرحلة الفورم
   */
  isInFormStage(): boolean {
    const state = this.get();
    return state.stage === 'form';
  }

  /**
   * ✅ تشفير Base64 مع دعم Unicode (للأحرف العربية)
   * طريقة آمنة تدعم جميع الأحرف بما فيها العربية
   */
  private base64Encode(str: string): string {
    try {
      // ✅ الطريقة الأفضل: استخدام unescape + encodeURIComponent + btoa
      // هذه الطريقة تدعم Unicode بشكل كامل
      return btoa(unescape(encodeURIComponent(str)));
    } catch (error) {
      // Fallback: استخدام TextEncoder إذا كان متاحاً (المتصفحات الحديثة)
      if (typeof TextEncoder !== 'undefined') {
        try {
          const encoder = new TextEncoder();
          const bytes = encoder.encode(str);
          // تحويل bytes إلى string ثم btoa
          const binaryString = String.fromCharCode(...bytes);
          return btoa(binaryString);
        } catch (fallbackError) {
          console.warn('⚠️ TextEncoder fallback failed:', fallbackError);
        }
      }
      // آخر fallback: استخدام JSON مباشرة (بدون Base64)
      console.warn('⚠️ Base64 encoding failed, using plain JSON');
      return str;
    }
  }

  /**
   * ✅ فك تشفير Base64 مع دعم Unicode (للأحرف العربية)
   * طريقة آمنة تدعم جميع الأحرف بما فيها العربية
   */
  private base64Decode(str: string): string {
    try {
      // ✅ الطريقة الأفضل: استخدام atob + escape + decodeURIComponent
      // هذه الطريقة تدعم Unicode بشكل كامل
      return decodeURIComponent(escape(atob(str)));
    } catch (error) {
      // Fallback: استخدام TextDecoder إذا كان متاحاً (المتصفحات الحديثة)
      if (typeof TextDecoder !== 'undefined') {
        try {
          const decoded = atob(str);
          const bytes = new Uint8Array(decoded.length);
          for (let i = 0; i < decoded.length; i++) {
            bytes[i] = decoded.charCodeAt(i);
          }
          const decoder = new TextDecoder('utf-8');
          return decoder.decode(bytes);
        } catch (fallbackError) {
          console.warn('⚠️ TextDecoder fallback failed:', fallbackError);
        }
      }
      // آخر fallback: محاولة استخدام النص مباشرة
      console.warn('⚠️ Base64 decoding failed, trying plain string');
      return str;
    }
  }
}


import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from '@angular/fire/firestore';

export interface WhiteFridaySession {
  stage: 'intro' | 'form' | 'submitted';
  discount?: number | string;
  discountText?: string;
  isGift?: boolean;
  createdAt?: any;
  updatedAt?: any;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhiteFridaySessionService {
  private readonly COOKIE = 'rn_wheel_session';
  private readonly COLLECTION = 'whiteFridaySessions';
  private sessionId: string | null = null;

  constructor(private firestore: Firestore) {}

  /**
   * توليد Session ID فريد
   */
  private generateSessionId(): string {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 12);
  }

  /**
   * الحصول على Session ID (من localStorage أو توليد جديد)
   */
  getSessionId(): string {
    if (this.sessionId) {
      return this.sessionId;
    }

    // محاولة قراءة من localStorage
    let id = localStorage.getItem(this.COOKIE);
    
    if (!id) {
      // توليد Session ID جديد
      id = this.generateSessionId();
      localStorage.setItem(this.COOKIE, id);
      
      // حفظ في Cookie أيضاً (7 أيام)
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      document.cookie = `${this.COOKIE}=${id}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    }
    
    this.sessionId = id;
    return id;
  }

  /**
   * قراءة حالة الجلسة من Firestore
   */
  async getSessionData(): Promise<WhiteFridaySession | null> {
    try {
      const sessionId = this.getSessionId();
      const docRef = doc(this.firestore, this.COLLECTION, sessionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as WhiteFridaySession;
        console.log('✅ Session data retrieved from Firestore:', data);
        return data;
      }
      
      console.log('ℹ️ No session data found in Firestore');
      return null;
    } catch (error) {
      console.error('❌ Error getting session data from Firestore:', error);
      // في حالة الخطأ، نرجع null للسماح باللعب (fallback)
      return null;
    }
  }

  /**
   * حفظ حالة الفورم في Firestore (بعد اللفة)
   */
  async setFormStage(data: {
    discount: number | string;
    discountText: string;
    isGift: boolean;
  }): Promise<void> {
    try {
      const sessionId = this.getSessionId();
      const docRef = doc(this.firestore, this.COLLECTION, sessionId);
      
      const sessionData: WhiteFridaySession = {
        stage: 'form',
        discount: data.discount,
        discountText: data.discountText,
        isGift: data.isGift,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userAgent: navigator.userAgent
      };
      
      await setDoc(docRef, sessionData, { merge: true });
      console.log('✅ Form stage saved to Firestore:', sessionData);
    } catch (error) {
      console.error('❌ Error saving form stage to Firestore:', error);
      throw error;
    }
  }

  /**
   * تحديث الحالة إلى submitted (بعد إرسال الفورم)
   */
  async markSubmitted(): Promise<void> {
    try {
      const sessionId = this.getSessionId();
      const docRef = doc(this.firestore, this.COLLECTION, sessionId);
      
      await updateDoc(docRef, {
        stage: 'submitted',
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Session marked as submitted in Firestore');
    } catch (error) {
      console.error('❌ Error marking session as submitted:', error);
      throw error;
    }
  }

  /**
   * التحقق من أن المستخدم قد لعب بالفعل
   */
  async hasPlayed(): Promise<boolean> {
    const session = await this.getSessionData();
    return session?.stage === 'submitted';
  }

  /**
   * التحقق من أن المستخدم في مرحلة الفورم
   */
  async isInFormStage(): Promise<boolean> {
    const session = await this.getSessionData();
    return session?.stage === 'form';
  }

  /**
   * مسح Session ID (للتطوير/الاختبار فقط)
   */
  clearSession(): void {
    this.sessionId = null;
    localStorage.removeItem(this.COOKIE);
    document.cookie = `${this.COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    console.log('✅ Session cleared (for testing only)');
  }
}


import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy, getDocs } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export interface LandingPage {
  id?: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  original_price?: number;
  discount_price?: number;
  discount_percent?: number;
  video_url?: string;
  expires_at?: string;
  whatsapp_number?: string;
  features?: string[];
  active: boolean;
  created_at?: any;
  updated_at?: any;
  
  // Section Visibility Controls
  show_pricing?: boolean;
  show_features?: boolean;
  show_contact?: boolean;
  show_cta_buttons?: boolean;
  show_image?: boolean;
  show_video?: boolean;
  
  // Contact Form Settings
  contact_form?: {
    enabled: boolean;
    fields: {
      full_name: boolean;
      mobile: boolean;
      service_type: boolean;
      car_type: boolean;
      car_model: boolean;
      notes: boolean;
    };
    submit_button_text: string;
    success_message: string;
  };
  
  // Custom Styling
  styling?: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_gradient: string;
    font_family: string;
    button_style: 'rounded' | 'square' | 'pill';
    layout_style: 'modern' | 'classic' | 'minimal';
  };
  
  // Booking Information
  booking?: {
    total_slots: number;
    booked_slots: number;
    show_booking_count: boolean;
    booking_message: string;
  };
  
  // Mobile Optimization Settings
  mobile_optimized?: boolean;
  fullscreen_mobile?: boolean;
  responsive_design?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LandingPageService {

  constructor(private firestore: Firestore) { }

  // جلب صفحة landing page واحدة حسب slug
  getLandingPage(slug: string): Observable<LandingPage | undefined> {
    const pagesRef = collection(this.firestore, 'landing_pages');
    const q = query(pagesRef, where('slug', '==', slug), where('active', '==', true));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(pages => pages[0] as LandingPage | undefined)
    );
  }

  // جلب جميع landing pages
  getAllLandingPages(): Observable<LandingPage[]> {
    const pagesRef = collection(this.firestore, 'landing_pages');
    const q = query(pagesRef, orderBy('created_at', 'desc'));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(pages => pages as LandingPage[])
    );
  }

  // إضافة صفحة جديدة
  addLandingPage(page: LandingPage): Observable<any> {
    const timestamp = new Date();
    const pageData = {
      ...page,
      created_at: timestamp,
      updated_at: timestamp,
      active: true
    };
    const pagesRef = collection(this.firestore, 'landing_pages');
    return from(addDoc(pagesRef, pageData));
  }

  // تحديث صفحة موجودة
  updateLandingPage(id: string, page: Partial<LandingPage>): Observable<void> {
    const updateData = {
      ...page,
      updated_at: new Date()
    };
    const pageRef = doc(this.firestore, 'landing_pages', id);
    return from(updateDoc(pageRef, updateData));
  }

  // حذف صفحة
  deleteLandingPage(id: string): Observable<void> {
    const pageRef = doc(this.firestore, 'landing_pages', id);
    return from(deleteDoc(pageRef));
  }

  // تفعيل/إيقاف صفحة
  togglePageStatus(id: string, active: boolean): Observable<void> {
    const pageRef = doc(this.firestore, 'landing_pages', id);
    return from(updateDoc(pageRef, {
      active,
      updated_at: new Date()
    }));
  }

  // التحقق من وجود slug
  checkSlugExists(slug: string, excludeId?: string): Observable<boolean> {
    const pagesRef = collection(this.firestore, 'landing_pages');
    const q = query(pagesRef, where('slug', '==', slug));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(pages => {
        if (excludeId) {
          return pages.some(page => (page as any).id !== excludeId);
        }
        return pages.length > 0;
      })
    );
  }
}

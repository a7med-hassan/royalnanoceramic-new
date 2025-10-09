import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, limit } from '@angular/fire/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { Observable, from } from 'rxjs';

export interface Review {
  id: string;
  name: string;
  text: string;
  rating?: number;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: any;
}

export interface ReviewsPage {
  data: Review[];
  pagination: { page: number; limit: number; total: number; has_more: boolean };
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  constructor(private firestore: Firestore) {}

  // ✅ إضافة ريفيو (عميل)
  async addReview(name: string, text: string, rating: number) {
    return await addDoc(collection(this.firestore, 'reviews'), {
      name,
      text,
      rating,
      status: 'pending',
      created_at: serverTimestamp()
    });
  }

  // ✅ جلب الريفيوهات الموافقة فقط (للعامة)
  async getApprovedReviews() {
    try {
      // First try with orderBy
      const q = query(
        collection(this.firestore, 'reviews'),
        where('status', '==', 'approved'),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return reviews;
      
    } catch (error) {
      // Fallback without orderBy
      const q = query(
        collection(this.firestore, 'reviews'),
        where('status', '==', 'approved')
      );
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return reviews;
    }
  }

  // ✅ جلب كل الريفيوهات (للأدمن)
  async getAllReviews() {
    const snapshot = await getDocs(collection(this.firestore, 'reviews'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // ✅ تحديث حالة الريفيو (Approve / Reject)
  async updateReviewStatus(id: string, status: string) {
    const ref = doc(this.firestore, 'reviews', id);
    return await updateDoc(ref, { status });
  }

  // ✅ حذف ريفيو
  async deleteReview(id: string) {
    const ref = doc(this.firestore, 'reviews', id);
    return await deleteDoc(ref);
  }

  // ✅ إضافة ريفيو من الأدمن Approved مباشرة
  async addReviewAdmin(name: string, text: string, rating: number) {
    return await addDoc(collection(this.firestore, 'reviews'), {
      name,
      text,
      rating,
      status: 'approved',
      created_at: serverTimestamp()
    });
  }

  // Public endpoints with Observable support for compatibility
  getApproved(page = 1, limitCount = 12): Observable<ReviewsPage> {
    return from(this.getApprovedFirebase(page, limitCount));
  }

  // Simple method to get approved reviews without complex queries
  getApprovedReviewsSimple(): Observable<Review[]> {
    return from(this.getApprovedReviews()) as Observable<Review[]>;
  }

  create(data: { name: string; text: string; rating: number }): Observable<any> {
    return from(this.addReview(data.name, data.text, data.rating));
  }

  adminList(filters: { status?: string; page?: number; limit?: number; search?: string } = {}): Observable<any> {
    return from(this.adminListFirebase(filters));
  }

  adminUpdateStatus(id: string, status: 'approved' | 'rejected'): Observable<any> {
    return from(this.updateReviewStatus(id, status));
  }

  adminDelete(id: string): Observable<any> {
    return from(this.deleteReview(id));
  }

  // Firebase implementation methods
  private async getApprovedFirebase(page = 1, limitCount = 12): Promise<ReviewsPage> {
    try {
      const reviewsRef = collection(this.firestore, 'reviews');
      const q = query(
        reviewsRef,
        where('status', '==', 'approved'),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];

      return {
        data: reviews,
        pagination: {
          page,
          limit: limitCount,
          total: reviews.length,
          has_more: reviews.length === limitCount
        }
      };
    } catch (error) {
      console.error('Error fetching approved reviews:', error);
      return {
        data: [],
        pagination: { page, limit: limitCount, total: 0, has_more: false }
      };
    }
  }

  private async adminListFirebase(filters: { status?: string; page?: number; limit?: number; search?: string } = {}): Promise<any> {
    try {
      const reviewsRef = collection(this.firestore, 'reviews');
      let q = query(reviewsRef, orderBy('created_at', 'desc'));

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const snapshot = await getDocs(q);
      let reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];

      // Apply search filter if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        reviews = reviews.filter((review: any) =>
          review.name.toLowerCase().includes(searchTerm) ||
          review.text.toLowerCase().includes(searchTerm)
        );
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedReviews = reviews.slice(startIndex, endIndex);

      return {
        data: paginatedReviews,
        totalPages: Math.ceil(reviews.length / limit),
        currentPage: page,
        total: reviews.length
      };
    } catch (error) {
      console.error('Error fetching admin reviews:', error);
      return { data: [], totalPages: 0, currentPage: 1, total: 0 };
    }
  }
}
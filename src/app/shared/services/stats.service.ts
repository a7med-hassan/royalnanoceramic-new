import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getCountFromServer, 
  getDocs,
  orderBy,
  limit,
  Timestamp,
  startAfter,
  QueryDocumentSnapshot
} from '@angular/fire/firestore';

export interface DailyStats {
  date: string;
  visits: number;
  contactForms: number;
  discountForms: number;
  joinForms: number;
  landingPageForms: number;
  conversions: number;
}

export interface PageStats {
  page: string;
  visits: number;
  lastVisit?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private readonly SITE_NAME = 'royal_nano';

  constructor(private firestore: Firestore) {}

  /**
   * إجمالي الزيارات
   */
  async getTotalVisits(): Promise<number> {
    try {
      const col = collection(this.firestore, 'analytics_visits');
      const q = query(col, where('site', '==', this.SITE_NAME));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error getting total visits:', error);
      return 0;
    }
  }

  /**
   * زيارات اليوم
   */
  async getTodayVisits(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = Timestamp.fromDate(today);
      
      const col = collection(this.firestore, 'analytics_visits');
      const q = query(
        col, 
        where('site', '==', this.SITE_NAME), 
        where('createdAt', '>=', start)
      );
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error getting today visits:', error);
      return 0;
    }
  }

  /**
   * زيارات آخر 7 أيام
   */
  async getLast7DaysVisits(): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const start = Timestamp.fromDate(sevenDaysAgo);
      
      const col = collection(this.firestore, 'analytics_visits');
      const q = query(
        col, 
        where('site', '==', this.SITE_NAME), 
        where('createdAt', '>=', start)
      );
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error getting last 7 days visits:', error);
      return 0;
    }
  }

  /**
   * زيارات آخر 30 يوم
   */
  async getLast30DaysVisits(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      const start = Timestamp.fromDate(thirtyDaysAgo);
      
      const col = collection(this.firestore, 'analytics_visits');
      const q = query(
        col, 
        where('site', '==', this.SITE_NAME), 
        where('createdAt', '>=', start)
      );
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error getting last 30 days visits:', error);
      return 0;
    }
  }

  /**
   * عدد النماذج المرسلة
   */
  async getFormCounts(formType: 'contact' | 'discount' | 'join' | 'landing_page'): Promise<number> {
    try {
      const col = collection(this.firestore, 'analytics_forms');
      const q = query(
        col, 
        where('site', '==', this.SITE_NAME), 
        where('formType', '==', formType)
      );
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error(`Error getting ${formType} form count:`, error);
      return 0;
    }
  }

  /**
   * عدد النماذج اليوم
   */
  async getTodayFormCounts(formType: 'contact' | 'discount' | 'join' | 'landing_page'): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = Timestamp.fromDate(today);
      
      const col = collection(this.firestore, 'analytics_forms');
      const q = query(
        col, 
        where('site', '==', this.SITE_NAME), 
        where('formType', '==', formType),
        where('createdAt', '>=', start)
      );
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error(`Error getting today ${formType} form count:`, error);
      return 0;
    }
  }

  /**
   * إحصائيات شاملة
   */
  async getOverallStats(): Promise<{
    totalVisits: number;
    todayVisits: number;
    last7DaysVisits: number;
    last30DaysVisits: number;
    totalContactForms: number;
    totalDiscountForms: number;
    totalJoinForms: number;
    totalLandingPageForms: number;
    todayContactForms: number;
    todayDiscountForms: number;
    todayJoinForms: number;
    todayLandingPageForms: number;
  }> {
    try {
      const [
        totalVisits,
        todayVisits,
        last7DaysVisits,
        last30DaysVisits,
        totalContactForms,
        totalDiscountForms,
        totalJoinForms,
        totalLandingPageForms,
        todayContactForms,
        todayDiscountForms,
        todayJoinForms,
        todayLandingPageForms
      ] = await Promise.all([
        this.getTotalVisits(),
        this.getTodayVisits(),
        this.getLast7DaysVisits(),
        this.getLast30DaysVisits(),
        this.getFormCounts('contact'),
        this.getFormCounts('discount'),
        this.getFormCounts('join'),
        this.getFormCounts('landing_page'),
        this.getTodayFormCounts('contact'),
        this.getTodayFormCounts('discount'),
        this.getTodayFormCounts('join'),
        this.getTodayFormCounts('landing_page')
      ]);

      return {
        totalVisits,
        todayVisits,
        last7DaysVisits,
        last30DaysVisits,
        totalContactForms,
        totalDiscountForms,
        totalJoinForms,
        totalLandingPageForms,
        todayContactForms,
        todayDiscountForms,
        todayJoinForms,
        todayLandingPageForms
      };
    } catch (error) {
      console.error('Error getting overall stats:', error);
      return {
        totalVisits: 0,
        todayVisits: 0,
        last7DaysVisits: 0,
        last30DaysVisits: 0,
        totalContactForms: 0,
        totalDiscountForms: 0,
        totalJoinForms: 0,
        totalLandingPageForms: 0,
        todayContactForms: 0,
        todayDiscountForms: 0,
        todayJoinForms: 0,
        todayLandingPageForms: 0
      };
    }
  }

  /**
   * أكثر الصفحات زيارة
   */
  async getTopPages(limitCount: number = 10): Promise<PageStats[]> {
    try {
      const col = collection(this.firestore, 'analytics_visits');
      const q = query(
        col,
        where('site', '==', this.SITE_NAME),
        orderBy('createdAt', 'desc'),
        limit(1000) // Get recent visits to analyze
      );
      
      const snapshot = await getDocs(q);
      const pageCounts: { [key: string]: { count: number; lastVisit: Date } } = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const page = data['page'];
        const createdAt = data['createdAt']?.toDate() || new Date();
        
        if (!pageCounts[page]) {
          pageCounts[page] = { count: 0, lastVisit: createdAt };
        }
        pageCounts[page].count++;
        if (createdAt > pageCounts[page].lastVisit) {
          pageCounts[page].lastVisit = createdAt;
        }
      });
      
      return Object.entries(pageCounts)
        .map(([page, stats]) => ({
          page,
          visits: stats.count,
          lastVisit: stats.lastVisit
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error getting top pages:', error);
      return [];
    }
  }

  /**
   * إحصائيات يومية للآخر 30 يوم
   */
  async getDailyStats(lastDays: number = 30): Promise<DailyStats[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - lastDays);
      startDate.setHours(0, 0, 0, 0);
      
      const start = Timestamp.fromDate(startDate);
      const end = Timestamp.fromDate(endDate);
      
      const col = collection(this.firestore, 'analytics_visits');
      const q = query(
        col,
        where('site', '==', this.SITE_NAME),
        where('createdAt', '>=', start),
        where('createdAt', '<=', end),
        orderBy('createdAt', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const dailyData: { [key: string]: DailyStats } = {};
      
      // Initialize all days
      for (let i = 0; i < lastDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyData[dateStr] = {
          date: dateStr,
          visits: 0,
          contactForms: 0,
          discountForms: 0,
          joinForms: 0,
          landingPageForms: 0,
          conversions: 0
        };
      }
      
      // Count visits
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const createdAt = data['createdAt']?.toDate() || new Date();
        const dateStr = createdAt.toISOString().split('T')[0];
        
        if (dailyData[dateStr]) {
          dailyData[dateStr].visits++;
        }
      });
      
      // Get form data for each day (flat collection)
      const formsCol = collection(this.firestore, 'analytics_forms');
      const formsQ = query(
        formsCol,
        where('site', '==', this.SITE_NAME),
        where('createdAt', '>=', start),
        where('createdAt', '<=', end),
        orderBy('createdAt', 'asc')
      );
      
      const formsSnapshot = await getDocs(formsQ);
      formsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const createdAt = data['createdAt']?.toDate() || new Date();
        const dateStr = createdAt.toISOString().split('T')[0];
        const formType = data['formType'];
        
        if (dailyData[dateStr]) {
          switch (formType) {
            case 'contact':
              dailyData[dateStr].contactForms++;
              break;
            case 'discount':
              dailyData[dateStr].discountForms++;
              break;
            case 'join':
              dailyData[dateStr].joinForms++;
              break;
            case 'landing_page':
              dailyData[dateStr].landingPageForms++;
              break;
          }
        }
      });
      
      return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error getting daily stats:', error);
      return [];
    }
  }
}

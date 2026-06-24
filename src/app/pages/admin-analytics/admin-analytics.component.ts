import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, DailyStats, PageStats } from '../../shared/services/stats.service';
import { AnalyticsService } from '../../shared/services/analytics.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ChartComponent } from '../../shared/components/chart/chart.component';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.scss']
})
export class AdminAnalyticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Loading states
  loading = true;
  refreshing = false;
  
  // Stats data
  overallStats: any = {};
  topPages: PageStats[] = [];
  dailyStats: DailyStats[] = [];
  
  // Chart data
  chartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'الزيارات',
        data: [],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'نماذج التواصل',
        data: [],
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'نماذج الخصومات',
        data: [],
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };
  
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'التاريخ'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'العدد'
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  chartType: ChartType = 'line';
  
  // Stat cards
  statCards: StatCard[] = [];

  constructor(
    private statsService: StatsService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadAnalytics(): Promise<void> {
    try {
      this.loading = true;
      
      // Load all data in parallel
      const [overallStats, topPages, dailyStats] = await Promise.all([
        this.statsService.getOverallStats(),
        this.statsService.getTopPages(10),
        this.statsService.getDailyStats(30)
      ]);
      
      this.overallStats = overallStats;
      this.topPages = topPages;
      this.dailyStats = dailyStats;
      
      this.updateStatCards();
      this.updateChartData();
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      await this.analyticsService.logError(error as Error, 'AdminAnalytics.loadAnalytics');
    } finally {
      this.loading = false;
    }
  }

  async refreshData(): Promise<void> {
    try {
      this.refreshing = true;
      await this.loadAnalytics();
    } finally {
      this.refreshing = false;
    }
  }

  private updateStatCards(): void {
    this.statCards = [
      {
        title: 'إجمالي الزيارات',
        value: this.overallStats.totalVisits || 0,
        icon: 'fas fa-eye',
        color: '#667eea',
        change: this.calculateChange(this.overallStats.last30DaysVisits, this.overallStats.last7DaysVisits),
        changeType: this.getChangeType(this.overallStats.last30DaysVisits, this.overallStats.last7DaysVisits)
      },
      {
        title: 'زيارات اليوم',
        value: this.overallStats.todayVisits || 0,
        icon: 'fas fa-calendar-day',
        color: '#4caf50',
        change: this.calculateChange(this.overallStats.last7DaysVisits / 7, this.overallStats.todayVisits),
        changeType: this.getChangeType(this.overallStats.last7DaysVisits / 7, this.overallStats.todayVisits)
      },
      {
        title: 'نماذج التواصل',
        value: this.overallStats.totalContactForms || 0,
        icon: 'fas fa-envelope',
        color: '#ff9800',
        change: this.calculateChange(this.overallStats.totalContactForms - this.overallStats.todayContactForms, this.overallStats.todayContactForms),
        changeType: this.getChangeType(this.overallStats.totalContactForms - this.overallStats.todayContactForms, this.overallStats.todayContactForms)
      },
      {
        title: 'نماذج الخصومات',
        value: this.overallStats.totalDiscountForms || 0,
        icon: 'fas fa-percentage',
        color: '#e91e63',
        change: this.calculateChange(this.overallStats.totalDiscountForms - this.overallStats.todayDiscountForms, this.overallStats.todayDiscountForms),
        changeType: this.getChangeType(this.overallStats.totalDiscountForms - this.overallStats.todayDiscountForms, this.overallStats.todayDiscountForms)
      },
      {
        title: 'نماذج الانضمام',
        value: this.overallStats.totalJoinForms || 0,
        icon: 'fas fa-user-plus',
        color: '#9c27b0',
        change: this.calculateChange(this.overallStats.totalJoinForms - this.overallStats.todayJoinForms, this.overallStats.todayJoinForms),
        changeType: this.getChangeType(this.overallStats.totalJoinForms - this.overallStats.todayJoinForms, this.overallStats.todayJoinForms)
      },
      {
        title: 'صفحات الهبوط',
        value: this.overallStats.totalLandingPageForms || 0,
        icon: 'fas fa-landing',
        color: '#00bcd4',
        change: this.calculateChange(this.overallStats.totalLandingPageForms - this.overallStats.todayLandingPageForms, this.overallStats.todayLandingPageForms),
        changeType: this.getChangeType(this.overallStats.totalLandingPageForms - this.overallStats.todayLandingPageForms, this.overallStats.todayLandingPageForms)
      }
    ];
  }

  private updateChartData(): void {
    const labels = this.dailyStats.map(stat => {
      const date = new Date(stat.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    
    const visitsData = this.dailyStats.map(stat => stat.visits);
    const contactData = this.dailyStats.map(stat => stat.contactForms);
    const discountData = this.dailyStats.map(stat => stat.discountForms);
    
    this.chartData = {
      labels,
      datasets: [
        {
          label: 'الزيارات',
          data: visitsData,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'نماذج التواصل',
          data: contactData,
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'نماذج الخصومات',
          data: discountData,
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }

  private calculateChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return 0;
    return Math.round(((newValue - oldValue) / oldValue) * 100);
  }

  private getChangeType(oldValue: number, newValue: number): 'increase' | 'decrease' | 'neutral' {
    const change = this.calculateChange(oldValue, newValue);
    if (change > 0) return 'increase';
    if (change < 0) return 'decrease';
    return 'neutral';
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getChangeIcon(changeType: 'increase' | 'decrease' | 'neutral'): string {
    switch (changeType) {
      case 'increase': return 'fas fa-arrow-up';
      case 'decrease': return 'fas fa-arrow-down';
      default: return 'fas fa-minus';
    }
  }

  getChangeColor(changeType: 'increase' | 'decrease' | 'neutral'): string {
    switch (changeType) {
      case 'increase': return '#4caf50';
      case 'decrease': return '#f44336';
      default: return '#9e9e9e';
    }
  }
}

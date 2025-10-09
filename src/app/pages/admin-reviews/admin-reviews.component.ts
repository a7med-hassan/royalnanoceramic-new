import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReviewsService, Review } from '../../shared/services/reviews.service';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reviews.component.html',
  styleUrls: ['./admin-reviews.component.scss']
})
export class AdminReviewsComponent implements OnInit, OnDestroy {
  loading = false;
  error = '';
  reviews: Review[] = [];
  filterStatus: 'pending' | 'approved' | 'rejected' | '' = '';
  searchTerm = '';
  currentPage = 1;
  totalPages = 1;
  limit = 20;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(private reviewsService: ReviewsService) {}

  ngOnInit(): void {
    this.loadReviews();
    
    // Setup search debouncing
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadReviews();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReviews(): void {
    this.loading = true;
    this.error = '';
    
    const filters: any = {
      page: this.currentPage,
      limit: this.limit
    };

    if (this.filterStatus) {
      filters.status = this.filterStatus;
    }

    if (this.searchTerm.trim()) {
      filters.search = this.searchTerm.trim();
    }

    this.reviewsService.adminList(filters).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.reviews = Array.isArray(response.data) ? response.data : [];
          this.totalPages = response.totalPages || 1;
          this.currentPage = response.currentPage || 1;
        } else {
          this.reviews = [];
          this.totalPages = 1;
        }
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.error = 'Failed to load reviews. Please try again.';
        this.reviews = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onFilterChange(event: any): void {
    this.filterStatus = event.target.value as 'pending' | 'approved' | 'rejected' | '';
    this.currentPage = 1;
    this.loadReviews();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadReviews();
    }
  }

  updateStatus(reviewId: string, status: 'approved' | 'rejected'): void {
    this.reviewsService.adminUpdateStatus(reviewId, status).subscribe({
      next: () => {
        this.loadReviews();
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.error = 'Failed to update review status. Please try again.';
      }
    });
  }

  deleteReview(reviewId: string): void {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    this.reviewsService.adminDelete(reviewId).subscribe({
      next: () => {
        this.loadReviews();
      },
      error: (err) => {
        console.error('Error deleting review:', err);
        this.error = 'Failed to delete review. Please try again.';
      }
    });
  }

  // Legacy methods for backward compatibility
  get items(): Review[] {
    return this.reviews;
  }

  set items(value: Review[]) {
    this.reviews = value;
  }

  get page(): number {
    return this.currentPage;
  }

  set page(value: number) {
    this.currentPage = value;
  }

  get status(): 'pending' | 'approved' | 'rejected' | '' {
    return this.filterStatus;
  }

  set status(value: 'pending' | 'approved' | 'rejected' | '') {
    this.filterStatus = value;
  }

  setStatusFilter(value: 'pending' | 'approved' | 'rejected' | ''): void {
    this.filterStatus = value;
    this.currentPage = 1;
    this.loadReviews();
  }

  approve(id: string): void {
    this.updateStatus(id, 'approved');
  }

  reject(id: string): void {
    this.updateStatus(id, 'rejected');
  }

  remove(id: string): void {
    this.deleteReview(id);
  }

  load(): void {
    this.loadReviews();
  }

  getPendingCount(): number {
    return this.reviews ? this.reviews.filter(r => r.status === 'pending').length : 0;
  }

  getApprovedCount(): number {
    return this.reviews ? this.reviews.filter(r => r.status === 'approved').length : 0;
  }
}



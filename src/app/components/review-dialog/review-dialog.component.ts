import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReviewsService } from '../../shared/services/reviews.service';

export interface ReviewDialogData {
  name: string;
  text: string;
  rating: number;
}

export interface ReviewDialogResult {
  name: string;
  text: string;
  rating: number;
}

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './review-dialog.component.html',
  styleUrls: ['./review-dialog.component.scss']
})
export class ReviewDialogComponent {
  newReview: ReviewDialogData = {
    name: '',
    text: '',
    rating: 5
  };
  
  submitLoading = false;
  submitSuccess = '';
  submitError = '';
  isRtl = false;

  constructor(
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewDialogData,
    private reviewsService: ReviewsService
  ) {
    // Initialize with existing data if provided
    if (data) {
      this.newReview = { ...data };
    }
    
    // Check if RTL (you can inject TranslationService if needed)
    this.isRtl = document.dir === 'rtl' || document.documentElement.lang === 'ar';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.newReview.name || !this.newReview.text) {
      this.submitError = this.isRtl ? 'الاسم والنص مطلوبان' : 'Name and text are required';
      return;
    }

    this.submitLoading = true;
    this.submitError = '';
    this.submitSuccess = '';

    // Submit review using the service
    this.reviewsService.create({
      name: this.newReview.name.trim(),
      text: this.newReview.text.trim(),
      rating: this.newReview.rating,
    }).subscribe({
      next: (result) => {
        this.submitLoading = false;
        this.submitSuccess = this.isRtl ? 'تم إرسال تقييمك! سيتم ظهوره بعد الموافقة.' : 'Review submitted! It will appear after approval.';
        
        // Close dialog after success
        setTimeout(() => {
          this.dialogRef.close(this.newReview);
        }, 2000);
      },
      error: (error) => {
        this.submitLoading = false;
        this.submitError = this.isRtl ? 'حدث خطأ أثناء الإرسال. حاول مرة أخرى.' : 'Submission failed. Please try again.';
        console.error('Failed to submit review:', error);
      }
    });
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < rating ? 1 : 0));
  }

  setRating(rating: number): void {
    this.newReview.rating = rating;
  }
}

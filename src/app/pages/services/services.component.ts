import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentLang = 'ar';
  isRtl = true;

  constructor(
    private router: Router,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Get initial language and RTL settings
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}

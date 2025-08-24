// header.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isMenuOpen = false;
  isScrolled = false;
  currentLang = 'ar';
  isRtl = true;
  isHomePage = true;

  menuItems = [
    { key: 'home', route: 'home', label: 'header.home' },
    { key: 'about', route: 'about', label: 'header.about' },
    { key: 'services', route: 'services', label: 'header.services' },
    { key: 'blog', route: 'blog', label: 'header.blog' },
    { key: 'gallery', route: 'gallery', label: 'header.gallery' },
    { key: 'join-us', route: 'join-us', label: 'header.join-us' },
    { key: 'contact', route: 'contact', label: 'header.contact' },
  ];

  constructor(
    private router: Router,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.checkCurrentRoute();
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkCurrentRoute();
    });

    // Get initial language and RTL settings
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;

    // Language initialized
  }

  private checkCurrentRoute(): void {
    const currentRoute = this.router.url;
    // Always apply home page styling to all pages for consistent design
    this.isHomePage = true;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
    this.closeMenu();
  }

  toggleLanguage(): void {
    this.translationService.switchLanguage();
  }
}

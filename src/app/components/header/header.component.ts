// header.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService } from '../../shared/services/translation.service';
import { ScrollToTopService } from '../../shared/services/scroll-to-top.service';

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
    { 
      key: 'services', 
      route: 'services', 
      label: 'header.services',
      hasDropdown: true,
      dropdownItems: [
        { key: 'nano-graphene', route: 'services', label: 'nano-graphene', section: 'nano-graphene-section' },
        { key: 'nano-ceramic', route: 'services', label: 'nano-ceramic', section: 'nano-ceramic-section' },
        { key: 'protection-film', route: 'services', label: 'protection-film', section: 'ppf-products-section' },
        { key: 'thermal-insulation', route: 'services', label: 'thermal-insulation', section: 'thermal-insulation-section' }
      ]
    },
    { key: 'blog', route: 'blog', label: 'header.blog' },
    { key: 'gallery', route: 'gallery', label: 'header.gallery' },
    { key: 'join-us', route: 'join-us', label: 'header.join-us' },
    { key: 'contact', route: 'contact', label: 'header.contact' },
  ];

  isServicesDropdownOpen = false;

  constructor(
    private router: Router,
    public translationService: TranslationService,
    private scrollToTopService: ScrollToTopService
  ) {}

  ngOnInit(): void {
    this.checkCurrentRoute();
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkCurrentRoute();
    });

    // Get initial language and RTL settings
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;

    // Subscribe to language changes
    this.translationService.languageChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentLang = this.translationService.getCurrentLanguage();
        this.isRtl = this.translationService.isRtl$;
      });
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
    this.isScrolled = window.scrollY > 10;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]).then(() => {
      this.scrollToTopService.scrollToTop();
    });
    this.closeMenu();
  }

  toggleLanguage(): void {
    this.translationService.switchLanguage();
  }

  toggleServicesDropdown(): void {
    this.isServicesDropdownOpen = !this.isServicesDropdownOpen;
  }

  openServicesDropdown(): void {
    this.isServicesDropdownOpen = true;
  }

  closeServicesDropdown(): void {
    this.isServicesDropdownOpen = false;
  }

  navigateToService(route: string, section?: string): void {
    this.router.navigate([`/${route}`]).then(() => {
      if (section) {
        // Wait for the page to load, then scroll to the specific section
        setTimeout(() => {
          this.scrollToSection(section);
        }, 100);
      } else {
        this.scrollToTopService.scrollToTop();
      }
    });
    this.closeServicesDropdown();
    this.closeMenu();
  }

  private scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }
}

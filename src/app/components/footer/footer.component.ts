// footer.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentLang = 'ar';
  isRtl = true;
  currentYear = new Date().getFullYear();
  showAllBranchesFlag = false;

  quickLinks = [
    { key: 'home', route: 'home', label: 'footer.home' },
    { key: 'about', route: 'about', label: 'footer.about' },
    { key: 'services', route: 'services', label: 'footer.services' },
    { key: 'contact', route: 'contact', label: 'footer.contact' },
  ];

  services = [
    'service.ceramic_coating.title',
    'service.paint_protection.title',
    'service.interior_protection.title',
    'service.detailing.title',
  ];

  allBranches = [
    '6 October',
    'Nasr City',
    'Mohandessin',
    'Sheikh Zayed',
    'Alexandria',
    'Sohag',
    'Hurghada',
    'Tanta',
    'Mansoura',
    'Zagazig',
    'Ismailia',
    'Port Said',
    'Suez',
    'Minya',
    'Assiut',
  ];

  socialLinks = [
    {
      name: 'facebook',
      url: 'https://facebook.com/royalnanoceramic',
      icon: 'fab fa-facebook-f',
    },
    {
      name: 'instagram',
      url: 'https://instagram.com/royalnanoceramic',
      icon: 'fab fa-instagram',
    },
    {
      name: 'linkedin',
      url: 'https://www.linkedin.com/company/royal-nano-ceramic/',
      icon: 'fab fa-linkedin',
    },
    {
      name: 'youtube',
      url: 'https://www.youtube.com/@RoyalNanoCeramic',
      icon: 'fab fa-youtube',
    },
  ];

  constructor(
    private router: Router,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Get initial language and RTL settings
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;

    // Language initialized
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  toggleBranches(): void {
    this.showAllBranchesFlag = !this.showAllBranchesFlag;
  }

  getQuickLinkName(key: string): string {
    return this.translationService.getTranslation(key);
  }

  getServiceName(service: string): string {
    return this.translationService.getTranslation(service);
  }
}

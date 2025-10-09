import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../shared/services/translation.service';
import { ScrollToTopService } from '../../shared/services/scroll-to-top.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent implements OnInit, OnDestroy {
  currentLang = 'ar';
  isRtl = true;

  constructor(
    private router: Router,
    private meta: Meta,
    private title: Title,
    public translationService: TranslationService,
    private scrollToTopService: ScrollToTopService
  ) {}

  ngOnInit(): void {
    // Use the global translation service language
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;
    this.scrollToTopService.scrollToTop();
    this.setMetaTags();
    this.injectJsonLd();
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions if needed
  }

  setMetaTags(): void {
    if (this.currentLang === 'ar') {
      this.title.setTitle('سياسة الخصوصية وشروط الاستخدام - Royal Nano Ceramic');
      this.meta.updateTag({ name: 'description', content: 'سياسة الخصوصية وشروط الاستخدام لشركة Royal Nano Ceramic. نحمي خصوصيتك ونقدم أفضل خدمات حماية السيارات في مصر.' });
      this.meta.updateTag({ name: 'keywords', content: 'سياسة الخصوصية, شروط الاستخدام, Royal Nano Ceramic, حماية السيارات, النانو سيراميك' });
    } else {
      this.title.setTitle('Privacy & Usage Policy - Royal Nano Ceramic');
      this.meta.updateTag({ name: 'description', content: 'Privacy & Usage Policy for Royal Nano Ceramic. We protect your privacy and provide the best car protection services in Egypt.' });
      this.meta.updateTag({ name: 'keywords', content: 'privacy policy, usage policy, Royal Nano Ceramic, car protection, nano ceramic' });
    }

    // Canonical URL
    this.meta.updateTag({ rel: 'canonical', href: 'https://royalnanoceramic.com/privacy-policy' });
    
    // Open Graph tags
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: this.title.getTitle() });
    this.meta.updateTag({ property: 'og:description', content: this.meta.getTag('name=description')?.content || '' });
    this.meta.updateTag({ property: 'og:url', content: 'https://royalnanoceramic.com/privacy-policy' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Royal Nano Ceramic' });
    
    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: this.title.getTitle() });
    this.meta.updateTag({ name: 'twitter:description', content: this.meta.getTag('name=description')?.content || '' });
  }

  injectJsonLd(): void {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Royal Nano Ceramic',
      'alternateName': 'رويال نانو سيراميك',
      'description': this.currentLang === 'ar' 
        ? 'أفضل خدمات حماية السيارات في مصر باستخدام تكنولوجيا النانو سيراميك المتطورة'
        : 'Best car protection services in Egypt using advanced nano ceramic technology',
      'url': 'https://royalnanoceramic.com',
      'logo': 'https://royalnanoceramic.com/assets/images/logo.png',
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+20-103-2222-542',
        'contactType': 'customer service',
        'email': 'contact@royalnanoceramic.com',
        'availableLanguage': ['Arabic', 'English']
      },
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': '6 October',
        'addressRegion': 'Giza',
        'addressCountry': 'EG'
      },
      'sameAs': [
        'https://facebook.com/royalnanoceramic',
        'https://instagram.com/royalnanoceramic',
        'https://www.tiktok.com/@royalnanoceramic',
        'https://www.linkedin.com/company/royal-nano-ceramic/',
        'https://www.youtube.com/@RoyalNanoCeramic'
      ]
    };

    // Remove existing JSON-LD if any
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Inject new JSON-LD
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }

  toggleLanguage(): void {
    // Use the global translation service to switch language
    this.translationService.switchLanguage();
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;
    this.setMetaTags();
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    }
  }

  printPage(): void {
    window.print();
  }
}

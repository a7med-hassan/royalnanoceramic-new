import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
})
export class LanguageSwitcherComponent implements OnInit, OnDestroy {
  currentLang = 'ar';
  isRtl = true;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;

    // Language initialized
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  switchLanguage(): void {
    this.translationService.switchLanguage();
  }

  // Translation method
  getTranslation(key: string): string {
    return this.translationService.getTranslation(key);
  }
}

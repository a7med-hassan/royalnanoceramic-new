import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UTMLink {
  url: string;
  createdAt: Date;
}

@Component({
  selector: 'app-utm-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utm-builder.component.html',
  styleUrls: ['./utm-builder.component.scss']
})
export class UtmBuilderComponent {
  showPopup = false;
  
  // Base URL options
  baseUrl = 'https://royalnanoceramic.com/contact';
  customUrl = '';
  useCustomUrl = false;
  baseUrlOptions = [
    { value: 'https://royalnanoceramic.com/contact', label: 'صفحة التواصل' },
    { value: 'https://royalnanoceramic.com/services', label: 'صفحة الخدمات' },
    { value: 'https://royalnanoceramic.com/discount', label: 'صفحة الخصومات' },
    { value: 'https://royalnanoceramic.com', label: 'الصفحة الرئيسية' },
    { value: 'custom', label: '🔗 رابط مخصص' }
  ];
  
  // UTM Parameters
  utmSource = '';
  utmMedium = '';
  utmCampaign = '';
  utmContent = '';
  utmTerm = '';
  discount = '';
  
  // Generated link
  generatedLink = '';
  
  // Copy feedback
  showCopySuccess = false;
  
  // Recent links history
  recentLinks: UTMLink[] = [];

  openPopup(): void {
    this.showPopup = true;
    this.loadRecentLinks();
  }

  closePopup(): void {
    this.showPopup = false;
    this.resetForm();
  }

  onBaseUrlChange(): void {
    this.useCustomUrl = this.baseUrl === 'custom';
    if (!this.useCustomUrl) {
      this.customUrl = '';
    }
  }

  generateLink(): void {
    if (!this.utmSource || !this.utmMedium || !this.utmCampaign) {
      alert('يرجى ملء جميع الحقول المطلوبة (مصدر الحملة، وسيلة الحملة، اسم الحملة)');
      return;
    }

    // Determine the final URL
    let finalUrl = this.baseUrl;
    if (this.useCustomUrl) {
      if (!this.customUrl) {
        alert('يرجى إدخال الرابط المخصص');
        return;
      }
      finalUrl = this.customUrl;
      
      // Remove trailing slash if exists
      if (finalUrl.endsWith('/')) {
        finalUrl = finalUrl.slice(0, -1);
      }
      
      // Validate URL
      try {
        new URL(finalUrl);
      } catch (e) {
        alert('الرابط المخصص غير صحيح. يرجى إدخال رابط صحيح يبدأ بـ http:// أو https://');
        return;
      }
    }

    const params = new URLSearchParams();
    
    // Required UTM parameters
    params.append('utm_source', this.utmSource);
    params.append('utm_medium', this.utmMedium);
    params.append('utm_campaign', this.utmCampaign);
    
    // Optional UTM parameters
    if (this.utmContent) {
      params.append('utm_content', this.utmContent);
    }
    
    if (this.utmTerm) {
      params.append('utm_term', this.utmTerm);
    }
    
    // Custom discount parameter
    if (this.discount) {
      params.append('discount', this.discount);
    }
    
    // Check if URL already has query parameters
    const separator = finalUrl.includes('?') ? '&' : '?';
    this.generatedLink = `${finalUrl}${separator}${params.toString()}`;
    
    // Save to recent links
    this.saveToRecentLinks(this.generatedLink);
  }

  copyToClipboard(): void {
    if (!this.generatedLink) {
      return;
    }

    navigator.clipboard.writeText(this.generatedLink).then(() => {
      this.showCopySuccess = true;
      setTimeout(() => {
        this.showCopySuccess = false;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('فشل نسخ الرابط');
    });
  }

  resetForm(): void {
    this.baseUrl = 'https://royalnanoceramic.com/contact';
    this.customUrl = '';
    this.useCustomUrl = false;
    this.utmSource = '';
    this.utmMedium = '';
    this.utmCampaign = '';
    this.utmContent = '';
    this.utmTerm = '';
    this.discount = '';
    this.generatedLink = '';
    this.showCopySuccess = false;
  }

  saveToRecentLinks(url: string): void {
    const link: UTMLink = {
      url,
      createdAt: new Date()
    };
    
    this.recentLinks.unshift(link);
    
    // Keep only last 5 links
    if (this.recentLinks.length > 5) {
      this.recentLinks = this.recentLinks.slice(0, 5);
    }
    
    // Save to localStorage
    localStorage.setItem('utm_recent_links', JSON.stringify(this.recentLinks));
  }

  loadRecentLinks(): void {
    const saved = localStorage.getItem('utm_recent_links');
    if (saved) {
      try {
        this.recentLinks = JSON.parse(saved);
      } catch (e) {
        this.recentLinks = [];
      }
    }
  }

  copyRecentLink(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.showCopySuccess = true;
      setTimeout(() => {
        this.showCopySuccess = false;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  deleteRecentLink(index: number): void {
    this.recentLinks.splice(index, 1);
    localStorage.setItem('utm_recent_links', JSON.stringify(this.recentLinks));
  }

  clearAllLinks(): void {
    if (confirm('هل أنت متأكد من حذف جميع الروابط السابقة؟')) {
      this.recentLinks = [];
      localStorage.removeItem('utm_recent_links');
    }
  }

  // Quick fill presets
  fillGoogleAds(): void {
    this.utmSource = 'google';
    this.utmMedium = 'cpc';
    this.utmCampaign = '';
  }

  fillFacebookAds(): void {
    this.utmSource = 'facebook';
    this.utmMedium = 'social';
    this.utmCampaign = '';
  }

  fillInstagramAds(): void {
    this.utmSource = 'instagram';
    this.utmMedium = 'social';
    this.utmCampaign = '';
  }

  fillEmailCampaign(): void {
    this.utmSource = 'email';
    this.utmMedium = 'email';
    this.utmCampaign = '';
  }
}


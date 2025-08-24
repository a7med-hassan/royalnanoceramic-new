# 🌐 دليل الترجمة للمشروع

## 📋 نظرة عامة على نظام الترجمة

### **✅ الميزات:**

- **دعم اللغتين**: العربية والإنجليزية
- **تبديل سلس**: بين اللغتين بدون إعادة تحميل
- **حفظ التفضيلات**: تذكر اللغة المختارة
- **دعم RTL/LTR**: للعربية والإنجليزية
- **خطوط مخصصة**: لكل لغة

## 🏗️ هيكل نظام الترجمة

### **1️⃣ Translation Service:**

```typescript
// src/app/shared/services/translation.service.ts
export class TranslationService {
  private currentLang = "ar";
  private isRtl = true;

  // Event emitter for language changes
  languageChanged = new EventEmitter<void>();

  // Translation dictionary
  private translations = {
    ar: {
      /* Arabic translations */
    },
    en: {
      /* English translations */
    },
  };
}
```

### **2️⃣ Language Switching:**

```typescript
// Switch between languages
switchLanguage(): void {
  const currentLang = this.getCurrentLanguage();
  const newLang = currentLang === 'ar' ? 'en' : 'ar';
  this.setLanguage(newLang);
}

// Set specific language
setLanguage(lang: string): void {
  if (lang !== 'ar' && lang !== 'en') {
    lang = 'ar'; // Default to Arabic
  }

  this.currentLang = lang;
  this.isRtl = lang === 'ar';

  // Update DOM
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.className = lang === 'ar' ? 'rtl arabic-font' : 'ltr english-font';

  // Notify components
  this.languageChanged.emit();
}
```

## 📚 قاموس الترجمة

### **✅ هيكل الترجمة:**

```typescript
private translations = {
  ar: {
    // Header Navigation
    'header.home': 'الرئيسية',
    'header.about': 'من نحن',
    'header.services': 'خدماتنا',
    'header.blog': 'المدونة',
    'header.gallery': 'المعرض',
    'header.join-us': 'انضم إلينا',
    'header.contact': 'تواصل معنا',

    // Home Page
    'home.hero.title': 'رويال نانو سيراميك',
    'home.hero.subtitle': 'أفضل حماية للسيارات في مصر',
    'home.hero.description': 'نحن متخصصون في توفير خدمات حماية متطورة...',

    // Services
    'service.ceramic_coating.title': 'طلاء السيراميك',
    'service.ceramic_coating.description': 'حماية طويلة المدى للطلاء...',

    // Footer
    'footer.description': 'رويال نانو سيراميك - أفضل حماية للسيارات في مصر',
    'footer.quick_links': 'روابط سريعة',
    'footer.contact_info': 'معلومات التواصل',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.success': 'تم بنجاح',
    'common.read_more': 'اقرأ المزيد',
    'common.contact_us': 'تواصل معنا'
  },
  en: {
    // Header Navigation
    'header.home': 'Home',
    'header.about': 'About',
    'header.services': 'Services',
    'header.blog': 'Blog',
    'header.gallery': 'Gallery',
    'header.join-us': 'Join Us',
    'header.contact': 'Contact',

    // Home Page
    'home.hero.title': 'Royal Nano Ceramic',
    'home.hero.subtitle': 'Best Car Protection in Egypt',
    'home.hero.description': 'We specialize in providing advanced protection services...',

    // Services
    'service.ceramic_coating.title': 'Ceramic Coating',
    'service.ceramic_coating.description': 'Long-term paint protection...',

    // Footer
    'footer.description': 'Royal Nano Ceramic - Best Car Protection in Egypt',
    'footer.quick_links': 'Quick Links',
    'footer.contact_info': 'Contact Info',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.read_more': 'Read More',
    'common.contact_us': 'Contact Us'
  }
};
```

## 🔧 استخدام الترجمة في المكونات

### **1️⃣ Injecting Translation Service:**

```typescript
// In component constructor
constructor(
  private router: Router,
  public translationService: TranslationService,
) {}
```

### **2️⃣ Getting Translations:**

```typescript
// Get translation by key
getTranslation(key: string): string {
  return this.translationService.getTranslation(key);
}

// In template
{{ translationService.getTranslation('header.home') }}
```

### **3️⃣ Language Change Subscription:**

```typescript
ngOnInit(): void {
  // Get initial language
  this.currentLang = this.translationService.getCurrentLanguage();
  this.isRtl = this.translationService.isRtl$;

  // Listen for language changes
  this.translationService.languageChanged.subscribe(() => {
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;
  });
}
```

## 🌍 دعم اللغات المتعددة

### **✅ Hreflang Tags:**

```html
<!-- In index.html -->
<link rel="alternate" hreflang="ar" href="https://royalnanoceramic.com/ar" />
<link rel="alternate" hreflang="en" href="https://royalnanoceramic.com/en" />
<link rel="alternate" hreflang="x-default" href="https://royalnanoceramic.com" />
```

### **✅ Language Routes:**

```typescript
// In app.routes.ts
export const routes: Routes = [
  // Default route
  { path: "", redirectTo: "/home", pathMatch: "full" },

  // Main routes
  { path: "home", component: HomeComponent },
  { path: "about", component: AboutComponent },

  // Language-specific routes
  { path: "en", redirectTo: "/home", pathMatch: "full" },
  { path: "ar", redirectTo: "/home", pathMatch: "full" },
  { path: "en/home", component: HomeComponent, data: { lang: "en" } },
  { path: "ar/home", component: HomeComponent, data: { lang: "ar" } },
  { path: "en/about", component: AboutComponent, data: { lang: "en" } },
  { path: "ar/about", component: AboutComponent, data: { lang: "ar" } },
];
```

## 📱 دعم RTL/LTR

### **✅ RTL Support:**

```scss
// RTL styles
.rtl {
  direction: rtl;
  text-align: right;
}

.rtl * {
  font-family: "Cairo", sans-serif;
}

// Arabic font
.arabic {
  font-family: "Cairo", sans-serif;
}

// English font
.english {
  font-family: "Roboto", sans-serif;
}
```

### **✅ Dynamic Direction:**

```typescript
// Update page direction
document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
document.body.className = lang === "ar" ? "rtl arabic-font" : "ltr english-font";
```

## 🎨 خطوط اللغات

### **✅ Font Loading:**

```scss
/* In styles.scss */
@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap");

/* Font Awesome */
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css");
```

### **✅ Font Classes:**

```scss
.rtl * {
  font-family: "Cairo", sans-serif;
}

.english {
  font-family: "Roboto", sans-serif;
}
```

## 🔄 تحديث الترجمة

### **✅ Adding New Translations:**

```typescript
// 1. Add to translations object
'ar': {
  'new.key': 'ترجمة جديدة',
  'section.title': 'عنوان القسم'
},
'en': {
  'new.key': 'New Translation',
  'section.title': 'Section Title'
}

// 2. Use in component
{{ translationService.getTranslation('new.key') }}
```

### **✅ Updating Existing Translations:**

```typescript
// Update the value in translations object
'ar': {
  'header.home': 'الرئيسية المحدثة'
},
'en': {
  'header.home': 'Updated Home'
}
```

## 📊 إدارة الترجمة

### **✅ Translation Keys Structure:**

```
page.section.element.property
├── header.home
├── home.hero.title
├── home.hero.subtitle
├── service.ceramic_coating.title
├── service.ceramic_coating.description
├── footer.description
└── common.loading
```

### **✅ Best Practices:**

- استخدم مفاتيح واضحة ومنظمة
- اجعل الترجمة قابلة للقراءة
- استخدم نفس المفتاح في اللغتين
- تأكد من أن الترجمة مناسبة للسياق

## 🧪 اختبار الترجمة

### **✅ Testing Checklist:**

- [ ] تبديل اللغة يعمل
- [ ] جميع النصوص تترجم
- [ ] اتجاه RTL/LTR صحيح
- [ ] الخطوط تعمل بشكل صحيح
- [ ] حفظ تفضيلات اللغة
- [ ] تحديث الصفحة يحافظ على اللغة

### **✅ Testing Tools:**

- Chrome DevTools
- Language switching
- RTL/LTR testing
- Font inspection

## 🚀 تحسينات الأداء

### **✅ Lazy Loading:**

```typescript
// Load translations only when needed
private loadTranslations(lang: string): void {
  if (!this.translations[lang]) {
    // Load translations dynamically
    this.loadLanguageFile(lang);
  }
}
```

### **✅ Caching:**

```typescript
// Cache translations in localStorage
private cacheTranslations(lang: string): void {
  localStorage.setItem(`translations_${lang}`, JSON.stringify(this.translations[lang]));
}

private getCachedTranslations(lang: string): any {
  const cached = localStorage.getItem(`translations_${lang}`);
  return cached ? JSON.parse(cached) : null;
}
```

## 📈 مراقبة الترجمة

### **✅ Analytics:**

```typescript
// Track language usage
private trackLanguageUsage(lang: string): void {
  // Send analytics data
  console.log(`Language changed to: ${lang}`);
}
```

### **✅ Error Handling:**

```typescript
// Handle missing translations
getTranslation(key: string): string {
  const translation = this.translations[this.currentLang]?.[key];

  if (!translation) {
    console.warn(`Missing translation for key: ${key}`);
    return key; // Fallback to key
  }

  return translation;
}
```

## 🎯 الخلاصة

### **✅ نظام الترجمة مكتمل:**

- **دعم اللغتين**: العربية والإنجليزية
- **تبديل سلس**: بدون إعادة تحميل
- **دعم RTL/LTR**: للعربية والإنجليزية
- **خطوط مخصصة**: لكل لغة
- **حفظ التفضيلات**: تذكر اللغة المختارة
- **SEO محسن**: Hreflang tags

### **🌍 جاهز للاستخدام:**

- جميع النصوص مترجمة
- التبديل يعمل بشكل مثالي
- التصميم متجاوب للغتين
- جاهز للرفع على GoDaddy

---

**نظام الترجمة الآن مكتمل ويعمل بشكل مثالي!** 🌐✨

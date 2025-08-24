# 🚀 دليل رفع المشروع على GoDaddy

## 📋 المتطلبات الأساسية

### **✅ قبل الرفع:**

- حساب GoDaddy نشط
- نطاق مخصص (مثل: royalnanoceramic.com)
- خطة استضافة تدعم PHP و Apache
- SSL Certificate (HTTPS)

## 🔧 خطوات البناء

### **1️⃣ بناء المشروع:**

```bash
# تشغيل ملف البناء
build-production.bat

# أو يدوياً:
ng build --configuration production
```

### **2️⃣ ملفات البناء:**

```
dist/royal-nano-ceramic/
├── main-*.js
├── styles-*.css
├── polyfills-*.js
├── .htaccess
├── robots.txt
├── sitemap.xml
├── manifest.json
└── favicon.ico
```

## 📤 خطوات الرفع على GoDaddy

### **1️⃣ الدخول إلى لوحة التحكم:**

- ادخل إلى [GoDaddy.com](https://godaddy.com)
- سجل دخولك
- اذهب إلى "My Products" > "Web Hosting"

### **2️⃣ الوصول إلى File Manager:**

- اختر موقعك
- اضغط على "Manage"
- اذهب إلى "Files" > "File Manager"

### **3️⃣ رفع الملفات:**

- اذهب إلى مجلد `public_html`
- احذف جميع الملفات الموجودة (احتفظ بنسخة احتياطية)
- ارفع جميع محتويات `dist/royal-nano-ceramic/`

### **4️⃣ التأكد من الملفات المهمة:**

- ✅ `.htaccess` - للتنقل والتحسينات
- ✅ `robots.txt` - لتحسين SEO
- ✅ `sitemap.xml` - لخريطة الموقع
- ✅ `manifest.json` - لدعم PWA
- ✅ `favicon.ico` - لأيقونة الموقع

## ⚙️ إعدادات GoDaddy

### **1️⃣ إعدادات PHP:**

- PHP Version: 8.0 أو أحدث
- Memory Limit: 256M أو أكثر
- Max Execution Time: 300 ثانية

### **2️⃣ إعدادات Apache:**

- Mod Rewrite: مفعل
- Gzip Compression: مفعل
- Browser Caching: مفعل

### **3️⃣ إعدادات SSL:**

- SSL Certificate: مفعل
- Force HTTPS: مفعل
- HTTP/2: مفعل (إن أمكن)

## 🔍 اختبار الموقع

### **1️⃣ اختبار الصفحات:**

- ✅ الصفحة الرئيسية
- ✅ صفحة من نحن
- ✅ صفحة الخدمات
- ✅ صفحة المدونة
- ✅ صفحة المعرض
- ✅ صفحة تواصل معنا
- ✅ صفحة انضم إلينا

### **2️⃣ اختبار الوظائف:**

- ✅ التنقل بين الصفحات
- ✅ تغيير اللغة (عربي/إنجليزي)
- ✅ التصميم المتجاوب
- ✅ أزرار التواصل الاجتماعي
- ✅ نموذج الاتصال

### **3️⃣ اختبار SEO:**

- ✅ Meta Tags
- ✅ Structured Data
- ✅ Sitemap
- ✅ Robots.txt
- ✅ Page Speed

## 🚨 حل المشاكل الشائعة

### **1️⃣ مشكلة التنقل:**

```apache
# تأكد من وجود .htaccess
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

### **2️⃣ مشكلة الصفحة البيضاء:**

- تأكد من رفع جميع الملفات
- تحقق من إعدادات PHP
- راجع سجلات الأخطاء

### **3️⃣ مشكلة التصميم:**

- تأكد من رفع ملفات CSS
- تحقق من مسارات الصور
- تأكد من رفع Font Awesome

## 📱 اختبار التصميم المتجاوب

### **✅ أحجام الشاشات:**

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1920px
- **Large Desktop**: 1920px+

### **✅ اختبار المتصفحات:**

- Chrome (أحدث إصدار)
- Firefox (أحدث إصدار)
- Safari (أحدث إصدار)
- Edge (أحدث إصدار)

## 🎯 نصائح للتحسين

### **1️⃣ تحسين السرعة:**

- ضغط الصور
- تفعيل Gzip
- تفعيل Browser Caching
- تحسين ملفات CSS/JS

### **2️⃣ تحسين SEO:**

- تحديث Meta Tags
- إضافة Structured Data
- تحسين Page Speed
- إضافة Schema Markup

### **3️⃣ تحسين الأمان:**

- تحديث SSL
- إضافة Security Headers
- حماية من XSS
- حماية من CSRF

## 📞 الدعم الفني

### **🔗 روابط مفيدة:**

- [GoDaddy Help Center](https://help.godaddy.com)
- [GoDaddy Community](https://community.godaddy.com)
- [GoDaddy Support](https://support.godaddy.com)

### **📧 معلومات الاتصال:**

- **Email**: info@royalnanoceramic.com
- **Phone**: +20 123 456 7890
- **Website**: https://royalnanoceramic.com

---

## 🎉 تهانينا!

**تم رفع المشروع بنجاح على GoDaddy!**

الموقع الآن متاح على الإنترنت وجاهز للاستخدام.

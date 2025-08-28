import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslationService } from '../../shared/services/translation.service';
import { Swiper } from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';

interface GalleryImage {
  src: string;
  alt: string;
  title: string;
  description: string;
  protectionInfo: string;
  protectionType: string;
  features: string[];
  category: string;
  serviceType?: string;
  serviceTypeAr?: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  currentLang = 'ar';
  isRtl = true;

  isLightboxOpen = false;
  currentImageIndex = 0;
  imageLoading = false;
  imageError = false;

  // New properties for the redesigned gallery
  filteredImages: GalleryImage[] = [];
  featuredImages: GalleryImage[] = [];
  private swiper: Swiper | null = null;

  galleryImages: GalleryImage[] = [
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-10-13.jpg',
      alt: 'حماية سيراميك للسيارة',
      title: 'حماية سيراميك شاملة',
      description: 'حماية متقدمة للسيارة باستخدام تقنية النانو سيراميك',
      protectionInfo:
        'حماية فائقة ضد الخدوش والعوامل الجوية مع لمعان يدوم لسنوات',
      protectionType: 'نانو سيراميك',
      features: [
        'حماية ضد الخدوش',
        'مقاومة للماء',
        'لمعان طويل المدى',
        'حماية من الأشعة فوق البنفسجية',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },

    {
      src: 'assets/images/gallery/photo_2025-08-14_11-10-20.jpg',
      alt: 'حماية داخلية للسيارة',
      title: 'حماية داخلية متكاملة',
      description: 'معالجة شاملة للمقاعد والخامات الداخلية للسيارة',
      protectionInfo: 'حماية فعالة للمقاعد والجلود من التلف والاتساخ',
      protectionType: 'حماية داخلية',
      features: [
        'حماية المقاعد',
        'حماية الجلود',
        'مقاومة للاتساخ',
        'رائحة منعشة',
      ],
      category: 'interior',
      serviceType: 'Paint Protection Film',
      serviceTypeAr: 'فيلم حماية الطلاء',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-10-28.jpg',
      alt: 'تفصيل احترافي للسيارة',
      title: 'تفصيل احترافي شامل',
      description: 'خدمة تنظيف وتجميل شاملة لاستعادة بريق السيارة',
      protectionInfo: 'تنظيف عميق وتلميع احترافي لجميع أجزاء السيارة',
      protectionType: 'تفصيل احترافي',
      features: [
        'تنظيف عميق',
        'تلميع احترافي',
        'معالجة الخدوش',
        'حماية إضافية',
      ],
      category: 'ceramic',
      serviceType: 'Graphene Coating',
      serviceTypeAr: 'حماية الجرافين',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-12-01.jpg',
      alt: 'حماية طلاء السيارة',
      title: 'حماية طلاء متقدمة',
      description: 'فيلم حماية شفاف يحافظ على طلاء السيارة الأصلي',
      protectionInfo: 'حماية فعالة للطلاء من الخدوش والحجارة والعوامل الجوية',
      protectionType: 'حماية طلاء',
      features: [
        'حماية من الخدوش',
        'شفافية عالية',
        'سهولة التركيب',
        'حماية طويلة المدى',
      ],
      category: 'protection',
      serviceType: 'Paint Protection Film',
      serviceTypeAr: 'فيلم حماية الطلاء',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-16-20.jpg',
      alt: 'معالجة سيراميك للزجاج',
      title: 'معالجة سيراميك للزجاج',
      description: 'حماية متقدمة لزجاج السيارة من الخدوش والاتساخ',
      protectionInfo: 'معالجة سيراميك خاصة للزجاج تمنع التصاق الماء والأوساخ',
      protectionType: 'حماية زجاج',
      features: [
        'حماية من الخدوش',
        'منع التصاق الماء',
        'رؤية أوضح',
        'سهولة التنظيف',
      ],
      category: 'protection',
      serviceType: 'Glass Ceramic Coating',
      serviceTypeAr: 'حماية زجاج سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-17-00.jpg',
      alt: 'حماية عجلات السيارة',
      title: 'حماية عجلات متطورة',
      description: 'معالجة سيراميك خاصة للعجلات لحمايتها من الأوساخ والصدأ',
      protectionInfo:
        'حماية فعالة للعجلات من الأوساخ والمواد الكيميائية والصدأ',
      protectionType: 'حماية عجلات',
      features: [
        'حماية من الصدأ',
        'سهولة التنظيف',
        'لمعان دائم',
        'حماية من المواد الكيميائية',
      ],
      category: 'wheels',
      serviceType: 'Wheel Ceramic Coating',
      serviceTypeAr: 'حماية عجلات سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-17-20.jpg',
      alt: 'معالجة سيراميك للمحرك',
      title: 'معالجة سيراميك للمحرك',
      description: 'حماية متقدمة لمحرك السيارة من الحرارة والأوساخ',
      protectionInfo:
        'معالجة سيراميك خاصة للمحرك تحميه من الحرارة العالية والأوساخ',
      protectionType: 'حماية محرك',
      features: [
        'حماية من الحرارة',
        'منع تراكم الأوساخ',
        'تبريد أفضل',
        'حماية من التآكل',
      ],
      category: 'protection',
      serviceType: 'Paint Protection Film',
      serviceTypeAr: 'فيلم حماية الطلاء',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-17-28.jpg',
      alt: 'حماية سيراميك للبلاستيك',
      title: 'حماية البلاستيك والكاوتش',
      description: 'معالجة شاملة للبلاستيك والكاوتش لحمايتها من التلف',
      protectionInfo: 'حماية فعالة للبلاستيك والكاوتش من التلف والجفاف والتشقق',
      protectionType: 'حماية بلاستيك',
      features: [
        'منع الجفاف',
        'حماية من التشقق',
        'لمعان طبيعي',
        'حماية من الأشعة',
      ],
      category: 'interior',
      serviceType: 'Paint Protection Film',
      serviceTypeAr: 'فيلم حماية الطلاء',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-18-21.jpg',
      alt: 'حماية سيراميك للجلد',
      title: 'حماية الجلود الطبيعية',
      description: 'معالجة متقدمة للجلود الطبيعية لحمايتها من التلف',
      protectionInfo: 'حماية فعالة للجلود من الجفاف والتشقق والاتساخ',
      protectionType: 'حماية جلد',
      features: [
        'منع الجفاف',
        'حماية من التشقق',
        'لمعان طبيعي',
        'مقاومة للاتساخ',
      ],
      category: 'interior',
      serviceType: 'Paint Protection Film',
      serviceTypeAr: 'فيلم حماية الطلاء',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-18-57.jpg',
      alt: 'معالجة سيراميك للخشب',
      title: 'حماية الخشب والمواد الطبيعية',
      description: 'معالجة شاملة للخشب والمواد الطبيعية في السيارة',
      protectionInfo: 'حماية فعالة للخشب والمواد الطبيعية من الرطوبة والتلف',
      protectionType: 'حماية خشب',
      features: [
        'حماية من الرطوبة',
        'منع التشقق',
        'لمعان طبيعي',
        'حماية طويلة المدى',
      ],
      category: 'interior',
      serviceType: 'Paint Protection Film',
      serviceTypeAr: 'فيلم حماية الطلاء',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-19-05.jpg',
      alt: 'حماية سيراميك شاملة',
      title: 'حماية سيراميك شاملة للسيارة',
      description: 'معالجة سيراميك شاملة لجميع أجزاء السيارة',
      protectionInfo:
        'حماية متكاملة لجميع أجزاء السيارة باستخدام تقنية النانو سيراميك',
      protectionType: 'حماية شاملة',
      features: ['حماية متكاملة', 'تقنية متطورة', 'نتائج مضمونة', 'ضمان شامل'],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-19-08.jpg',
      alt: 'معالجة سيراميك للطلاء',
      title: 'معالجة سيراميك للطلاء الأصلي',
      description: 'حماية متقدمة للطلاء الأصلي للسيارة',
      protectionInfo: 'حماية فعالة للطلاء الأصلي من الخدوش والعوامل الجوية',
      protectionType: 'حماية طلاء أصلي',
      features: [
        'حماية من الخدوش',
        'حماية من الأشعة',
        'لمعان طبيعي',
        'حماية طويلة المدى',
      ],
      category: 'protection',
      serviceType: 'Paint Protection Film',
      serviceTypeAr: 'فيلم حماية الطلاء',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-19-54.jpg',
      alt: 'حماية سيراميك للزجاج الأمامي',
      title: 'حماية زجاج أمامي متطورة',
      description: 'معالجة سيراميك خاصة للزجاج الأمامي',
      protectionInfo: 'حماية متقدمة للزجاج الأمامي من الخدوش والاتساخ',
      protectionType: 'حماية زجاج أمامي',
      features: [
        'رؤية أوضح',
        'منع التصاق الماء',
        'حماية من الخدوش',
        'سهولة التنظيف',
      ],
      category: 'protection',
      serviceType: 'Paint Protection Film',
      serviceTypeAr: 'فيلم حماية الطلاء',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-20-44.jpg',
      alt: 'معالجة سيراميك للعجلات',
      title: 'معالجة سيراميك للعجلات الرياضية',
      description: 'حماية متقدمة للعجلات الرياضية من الأوساخ والصدأ',
      protectionInfo:
        'معالجة سيراميك خاصة للعجلات الرياضية لحمايتها من الأوساخ والصدأ',
      protectionType: 'حماية عجلات رياضية',
      features: [
        'حماية من الصدأ',
        'لمعان دائم',
        'سهولة التنظيف',
        'حماية من المواد الكيميائية',
      ],
      category: 'wheels',
      serviceType: 'Wheel Ceramic Coating',
      serviceTypeAr: 'حماية عجلات سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-14_11-24-31.jpg',
      alt: 'حماية سيراميك نهائية',
      title: 'حماية سيراميك نهائية شاملة',
      description: 'المرحلة النهائية من معالجة السيراميك الشاملة',
      protectionInfo:
        'المرحلة النهائية من معالجة السيراميك لضمان الحماية الكاملة',
      protectionType: 'حماية نهائية',
      features: ['حماية كاملة', 'لمعان نهائي', 'ضمان شامل', 'نتائج مثالية'],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    // الصور الجديدة من 18 أغسطس
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-08-48.jpg',
      alt: 'معالجة سيراميك للسيارات الفاخرة',
      title: 'حماية سيراميك للسيارات الفاخرة',
      description: 'معالجة سيراميك متخصصة للسيارات الفاخرة والرياضية',
      protectionInfo:
        'حماية فائقة الجودة للسيارات الفاخرة مع ضمان الحماية الكاملة',
      protectionType: 'حماية فاخرة',
      features: [
        'جودة فائقة',
        'حماية شاملة',
        'لمعان استثنائي',
        'ضمان طويل المدى',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-08-50.jpg',
      alt: 'معالجة سيراميك للطلاء الأبيض',
      title: 'حماية خاصة للطلاء الأبيض',
      description: 'معالجة سيراميك متخصصة للطلاء الأبيض لحمايته من الاصفرار',
      protectionInfo: 'حماية فعالة للطلاء الأبيض من الاصفرار والعوامل الجوية',
      protectionType: 'حماية طلاء أبيض',
      features: [
        'منع الاصفرار',
        'حماية من الأشعة',
        'لمعان طبيعي',
        'حماية طويلة المدى',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-08-51.jpg',
      alt: 'معالجة سيراميك للطلاء الأسود',
      title: 'حماية خاصة للطلاء الأسود',
      description: 'معالجة سيراميك متخصصة للطلاء الأسود لحمايته من الخدوش',
      protectionInfo: 'حماية فعالة للطلاء الأسود من الخدوش والاتساخ',
      protectionType: 'حماية طلاء أسود',
      features: [
        'حماية من الخدوش',
        'لمعان عميق',
        'سهولة التنظيف',
        'حماية شاملة',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-08-52.jpg',
      alt: 'معالجة سيراميك للطلاء الأحمر',
      title: 'حماية خاصة للطلاء الأحمر',
      description: 'معالجة سيراميك متخصصة للطلاء الأحمر لحمايته من البهتان',
      protectionInfo: 'حماية فعالة للطلاء الأحمر من البهتان والعوامل الجوية',
      protectionType: 'حماية طلاء أحمر',
      features: [
        'منع البهتان',
        'حماية من الأشعة',
        'لمعان مشرق',
        'حماية طويلة المدى',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-08-54.jpg',
      alt: 'معالجة سيراميك للطلاء الأزرق',
      title: 'حماية خاصة للطلاء الأزرق',
      description: 'معالجة سيراميك متخصصة للطلاء الأزرق لحمايته من التلف',
      protectionInfo: 'حماية فعالة للطلاء الأزرق من التلف والعوامل الجوية',
      protectionType: 'حماية طلاء أزرق',
      features: ['حماية من التلف', 'لمعان طبيعي', 'حماية شاملة', 'ضمان شامل'],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-09-10.jpg',
      alt: 'معالجة سيراميك للطلاء الرمادي',
      title: 'حماية خاصة للطلاء الرمادي',
      description: 'معالجة سيراميك متخصصة للطلاء الرمادي لحمايته من الخدوش',
      protectionInfo: 'حماية فعالة للطلاء الرمادي من الخدوش والاتساخ',
      protectionType: 'حماية طلاء رمادي',
      features: [
        'حماية من الخدوش',
        'لمعان طبيعي',
        'سهولة التنظيف',
        'حماية شاملة',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-09-13.jpg',
      alt: 'معالجة سيراميك للطلاء الأخضر',
      title: 'حماية خاصة للطلاء الأخضر',
      description: 'معالجة سيراميك متخصصة للطلاء الأخضر لحمايته من البهتان',
      protectionInfo: 'حماية فعالة للطلاء الأخضر من البهتان والعوامل الجوية',
      protectionType: 'حماية طلاء أخضر',
      features: [
        'منع البهتان',
        'حماية من الأشعة',
        'لمعان طبيعي',
        'حماية طويلة المدى',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-09-16.jpg',
      alt: 'معالجة سيراميك للطلاء الأصفر',
      title: 'حماية خاصة للطلاء الأصفر',
      description: 'معالجة سيراميك متخصصة للطلاء الأصفر لحمايته من التلف',
      protectionInfo: 'حماية فعالة للطلاء الأصفر من التلف والعوامل الجوية',
      protectionType: 'حماية طلاء أصفر',
      features: ['حماية من التلف', 'لمعان مشرق', 'حماية شاملة', 'ضمان شامل'],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-09-22.jpg',
      alt: 'معالجة سيراميك للطلاء البرتقالي',
      title: 'حماية خاصة للطلاء البرتقالي',
      description: 'معالجة سيراميك متخصصة للطلاء البرتقالي لحمايته من البهتان',
      protectionInfo: 'حماية فعالة للطلاء البرتقالي من البهتان والعوامل الجوية',
      protectionType: 'حماية طلاء برتقالي',
      features: [
        'منع البهتان',
        'حماية من الأشعة',
        'لمعان مشرق',
        'حماية طويلة المدى',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-09-30.jpg',
      alt: 'معالجة سيراميك للطلاء البنفسجي',
      title: 'حماية خاصة للطلاء البنفسجي',
      description: 'معالجة سيراميك متخصصة للطلاء البنفسجي لحمايته من التلف',
      protectionInfo: 'حماية فعالة للطلاء البنفسجي من التلف والعوامل الجوية',
      protectionType: 'حماية طلاء بنفسجي',
      features: ['حماية من التلف', 'لمعان طبيعي', 'حماية شاملة', 'ضمان شامل'],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-09-32.jpg',
      alt: 'معالجة سيراميك للطلاء الوردي',
      title: 'حماية خاصة للطلاء الوردي',
      description: 'معالجة سيراميك متخصصة للطلاء الوردي لحمايته من البهتان',
      protectionInfo: 'حماية فعالة للطلاء الوردي من البهتان والعوامل الجوية',
      protectionType: 'حماية طلاء وردي',
      features: [
        'منع البهتان',
        'حماية من الأشعة',
        'لمعان طبيعي',
        'حماية طويلة المدى',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },

    {
      src: 'assets/images/gallery/photo_2025-08-18_11-10-58.jpg',
      alt: 'معالجة سيراميك للطلاء الذهبي',
      title: 'حماية خاصة للطلاء الذهبي',
      description: 'معالجة سيراميك متخصصة للطلاء الذهبي لحمايته من الخدوش',
      protectionInfo: 'حماية فعالة للطلاء الذهبي من الخدوش والاتساخ',
      protectionType: 'حماية طلاء ذهبي',
      features: [
        'حماية من الخدوش',
        'لمعان ذهبي',
        'سهولة التنظيف',
        'حماية شاملة',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-11-07.jpg',
      alt: 'معالجة سيراميك للطلاء النحاسي',
      title: 'حماية خاصة للطلاء النحاسي',
      description: 'معالجة سيراميك متخصصة للطلاء النحاسي لحمايته من التأكسد',
      protectionInfo: 'حماية فعالة للطلاء النحاسي من التأكسد والعوامل الجوية',
      protectionType: 'حماية طلاء نحاسي',
      features: ['منع التأكسد', 'لمعان نحاسي', 'حماية شاملة', 'ضمان شامل'],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },

    {
      src: 'assets/images/gallery/photo_2025-08-18_11-11-18.jpg',
      alt: 'معالجة سيراميك للطلاء البلاتيني',
      title: 'حماية خاصة للطلاء البلاتيني',
      description: 'معالجة سيراميك متخصصة للطلاء البلاتيني لحمايته من الخدوش',
      protectionInfo: 'حماية فعالة للطلاء البلاتيني من الخدوش والاتساخ',
      protectionType: 'حماية طلاء بلاتيني',
      features: [
        'حماية من الخدوش',
        'لمعان بلاتيني',
        'سهولة التنظيف',
        'حماية شاملة',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-11-25.jpg',
      alt: 'معالجة سيراميك للطلاء الكرومي',
      title: 'حماية خاصة للطلاء الكرومي',
      description: 'معالجة سيراميك متخصصة للطلاء الكرومي لحمايته من الصدأ',
      protectionInfo: 'حماية فعالة للطلاء الكرومي من الصدأ والتأكسد',
      protectionType: 'حماية طلاء كرومي',
      features: ['منع الصدأ', 'لمعان كرومي', 'حماية شاملة', 'ضمان شامل'],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-11-46.jpg',
      alt: 'معالجة سيراميك للطلاء الميتاليك',
      title: 'حماية خاصة للطلاء الميتاليك',
      description: 'معالجة سيراميك متخصصة للطلاء الميتاليك لحمايته من الخدوش',
      protectionInfo: 'حماية فعالة للطلاء الميتاليك من الخدوش والاتساخ',
      protectionType: 'حماية طلاء ميتاليك',
      features: [
        'حماية من الخدوش',
        'لمعان ميتاليك',
        'سهولة التنظيف',
        'حماية شاملة',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-12-10.jpg',
      alt: 'معالجة سيراميك للطلاء البيرل',
      title: 'حماية خاصة للطلاء البيرل',
      description: 'معالجة سيراميك متخصصة للطلاء البيرل لحمايته من الخدوش',
      protectionInfo: 'حماية فعالة للطلاء البيرل من الخدوش والاتساخ',
      protectionType: 'حماية طلاء بيرل',
      features: [
        'حماية من الخدوش',
        'لمعان بيرل',
        'سهولة التنظيف',
        'حماية شاملة',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-12-20.jpg',
      alt: 'معالجة سيراميك للطلاء المات',
      title: 'حماية خاصة للطلاء المات',
      description: 'معالجة سيراميك متخصصة للطلاء المات لحمايته من الخدوش',
      protectionInfo: 'حماية فعالة للطلاء المات من الخدوش والاتساخ',
      protectionType: 'حماية طلاء مات',
      features: [
        'حماية من الخدوش',
        'لمعان مات',
        'سهولة التنظيف',
        'حماية شاملة',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-12-41.jpg',
      alt: 'معالجة سيراميك للطلاء الجلوسي',
      title: 'حماية خاصة للطلاء الجلوسي',
      description: 'معالجة سيراميك متخصصة للطلاء الجلوسي لحمايته من الخدوش',
      protectionInfo: 'حماية فعالة للطلاء الجلوسي من الخدوش والاتساخ',
      protectionType: 'حماية طلاء جلوسي',
      features: [
        'حماية من الخدوش',
        'لمعان جلوسي',
        'سهولة التنظيف',
        'حماية شاملة',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-12-48.jpg',
      alt: 'معالجة سيراميك للطلاء الكريستالي',
      title: 'حماية خاصة للطلاء الكريستالي',
      description: 'معالجة سيراميك متخصصة للطلاء الكريستالي لحمايته من الخدوش',
      protectionInfo: 'حماية فعالة للطلاء الكريستالي من الخدوش والاتساخ',
      protectionType: 'حماية طلاء كريستالي',
      features: [
        'حماية من الخدوش',
        'لمعان كريستالي',
        'سهولة التنظيف',
        'حماية شاملة',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
    {
      src: 'assets/images/gallery/photo_2025-08-18_11-12-59.jpg',
      alt: 'معالجة سيراميك للطلاء المائي',
      title: 'حماية خاصة للطلاء المائي',
      description: 'معالجة سيراميك متخصصة للطلاء المائي لحمايته من الخدوش',
      protectionInfo: 'حماية فعالة للطلاء المائي من الخدوش والاتساخ',
      protectionType: 'حماية طلاء مائي',
      features: [
        'حماية من الخدوش',
        'لمعان مائي',
        'سهولة التنظيف',
        'حماية شاملة',
      ],
      category: 'ceramic',
      serviceType: 'Nano Ceramic Coating',
      serviceTypeAr: 'حماية نانو سيراميك',
    },
  ];

  get currentImage(): GalleryImage {
    return this.galleryImages[this.currentImageIndex];
  }

  constructor(public translationService: TranslationService) {}

  private loadGalleryImages(): void {
    const savedImages = localStorage.getItem('galleryImages');
    if (savedImages) {
      const parsedImages = JSON.parse(savedImages);
      // Filter only active images and add them to the existing gallery
      const adminImages = parsedImages.filter(
        (img: any) => img.isActive !== false
      );
      // Add admin images to the existing gallery images
      this.galleryImages = [...this.galleryImages, ...adminImages];
    }
    // If no saved images, use the default array that's already defined
  }

  ngOnInit(): void {
    // Get initial language and RTL settings
    this.currentLang = this.translationService.getCurrentLanguage();
    this.isRtl = this.translationService.isRtl$;

    // Load gallery images from localStorage
    this.loadGalleryImages();

    // Initialize gallery
    this.initializeGallery();
  }

  initializeGallery(): void {
    // Set featured images (first 8 images)
    this.featuredImages = this.galleryImages.slice(0, 8);

    // Initialize filtered images
    this.filteredImages = [...this.galleryImages];
  }

  ngAfterViewInit(): void {
    // Initialize Swiper after view is initialized
    this.initializeSwiper();
  }

  private initializeSwiper(): void {
    this.swiper = new Swiper('.featured-swiper', {
      modules: [Autoplay],
      slidesPerView: 1.2,
      centeredSlides: true,
      spaceBetween: 20,
      loop: true,
      speed: 2000,
      effect: 'slide',
      grabCursor: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 1.3,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 1.4,
          spaceBetween: 40,
        },
        1200: {
          slidesPerView: 1.5,
          spaceBetween: 50,
        },
      },
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    this.onKeyDown(event);
  }

  refreshGalleryImages(): void {
    // Re-initialize gallery images with new language
    this.galleryImages = [
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-10-13.jpg',
        alt: 'حماية سيراميك للسيارة',
        title: 'حماية سيراميك شاملة',
        description: 'حماية متقدمة للسيارة باستخدام تقنية النانو سيراميك',
        protectionInfo:
          'حماية فائقة ضد الخدوش والعوامل الجوية مع لمعان يدوم لسنوات',
        protectionType: 'نانو سيراميك',
        features: [
          'حماية ضد الخدوش',
          'مقاومة للماء',
          'لمعان طويل المدى',
          'حماية من الأشعة فوق البنفسجية',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-10-16.jpg',
        alt: 'طلاء سيراميك احترافي',
        title: 'طلاء سيراميك احترافي',
        description: 'خدمة طلاء سيراميك عالية الجودة لجميع أنواع السيارات',
        protectionInfo: 'حماية شاملة للطلاء مع ضمان الجودة والكفاءة',
        protectionType: 'سيراميك احترافي',
        features: ['حماية شاملة', 'جودة عالية', 'ضمان شامل', 'نتائج مضمونة'],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-10-20.jpg',
        alt: 'حماية داخلية للسيارة',
        title: 'حماية داخلية متكاملة',
        description: 'معالجة شاملة للمقاعد والخامات الداخلية للسيارة',
        protectionInfo: 'حماية فعالة للمقاعد والجلود من التلف والاتساخ',
        protectionType: 'حماية داخلية',
        features: [
          'حماية المقاعد',
          'حماية الجلود',
          'مقاومة للاتساخ',
          'رائحة منعشة',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-10-28.jpg',
        alt: 'تفصيل احترافي للسيارة',
        title: 'تفصيل احترافي شامل',
        description: 'خدمة تنظيف وتجميل شاملة لاستعادة بريق السيارة',
        protectionInfo: 'تنظيف عميق وتلميع احترافي لجميع أجزاء السيارة',
        protectionType: 'تفصيل احترافي',
        features: [
          'تنظيف عميق',
          'تلميع احترافي',
          'معالجة الخدوش',
          'حماية إضافية',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-12-01.jpg',
        alt: 'حماية طلاء السيارة',
        title: 'حماية طلاء متقدمة',
        description: 'فيلم حماية شفاف يحافظ على طلاء السيارة الأصلي',
        protectionInfo: 'حماية فعالة للطلاء من الخدوش والحجارة والعوامل الجوية',
        protectionType: 'حماية طلاء',
        features: [
          'حماية من الخدوش',
          'شفافية عالية',
          'سهولة التركيب',
          'حماية طويلة المدى',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-16-20.jpg',
        alt: 'معالجة سيراميك للزجاج',
        title: 'معالجة سيراميك للزجاج',
        description: 'حماية متقدمة لزجاج السيارة من الخدوش والاتساخ',
        protectionInfo: 'معالجة سيراميك خاصة للزجاج تمنع التصاق الماء والأوساخ',
        protectionType: 'حماية زجاج',
        features: [
          'حماية من الخدوش',
          'منع التصاق الماء',
          'رؤية أوضح',
          'سهولة التنظيف',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-17-00.jpg',
        alt: 'حماية عجلات السيارة',
        title: 'حماية عجلات متطورة',
        description: 'معالجة سيراميك خاصة للعجلات لحمايتها من الأوساخ والصدأ',
        protectionInfo:
          'حماية فعالة للعجلات من الأوساخ والمواد الكيميائية والصدأ',
        protectionType: 'حماية عجلات',
        features: [
          'حماية من الصدأ',
          'سهولة التنظيف',
          'لمعان دائم',
          'حماية من المواد الكيميائية',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-17-20.jpg',
        alt: 'معالجة سيراميك للمحرك',
        title: 'معالجة سيراميك للمحرك',
        description: 'حماية متقدمة لمحرك السيارة من الحرارة والأوساخ',
        protectionInfo:
          'معالجة سيراميك خاصة للمحرك تحميه من الحرارة العالية والأوساخ',
        protectionType: 'حماية محرك',
        features: [
          'حماية من الحرارة',
          'منع تراكم الأوساخ',
          'تبريد أفضل',
          'حماية من التآكل',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-17-28.jpg',
        alt: 'حماية سيراميك للبلاستيك',
        title: 'حماية البلاستيك والكاوتش',
        description: 'معالجة شاملة للبلاستيك والكاوتش لحمايتها من التلف',
        protectionInfo:
          'حماية فعالة للبلاستيك والكاوتش من التلف والجفاف والتشقق',
        protectionType: 'حماية بلاستيك',
        features: [
          'منع الجفاف',
          'حماية من التشقق',
          'لمعان طبيعي',
          'حماية من الأشعة',
        ],
        category: 'ceramic',
      },

      {
        src: 'assets/images/gallery/photo_2025-08-14_11-18-21.jpg',
        alt: 'حماية سيراميك للجلد',
        title: 'حماية الجلود الطبيعية',
        description: 'معالجة متقدمة للجلود الطبيعية لحمايتها من التلف',
        protectionInfo: 'حماية فعالة للجلود من الجفاف والتشقق والاتساخ',
        protectionType: 'حماية جلد',
        features: [
          'منع الجفاف',
          'حماية من التشقق',
          'لمعان طبيعي',
          'مقاومة للاتساخ',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-18-57.jpg',
        alt: 'معالجة سيراميك للخشب',
        title: 'حماية الخشب والمواد الطبيعية',
        description: 'معالجة شاملة للخشب والمواد الطبيعية في السيارة',
        protectionInfo: 'حماية فعالة للخشب والمواد الطبيعية من الرطوبة والتلف',
        protectionType: 'حماية خشب',
        features: [
          'حماية من الرطوبة',
          'منع التشقق',
          'لمعان طبيعي',
          'حماية طويلة المدى',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-19-05.jpg',
        alt: 'حماية سيراميك شاملة',
        title: 'حماية سيراميك شاملة للسيارة',
        description: 'معالجة سيراميك شاملة لجميع أجزاء السيارة',
        protectionInfo:
          'حماية متكاملة لجميع أجزاء السيارة باستخدام تقنية النانو سيراميك',
        protectionType: 'حماية شاملة',
        features: [
          'حماية متكاملة',
          'تقنية متطورة',
          'نتائج مضمونة',
          'ضمان شامل',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-19-08.jpg',
        alt: 'معالجة سيراميك للطلاء',
        title: 'معالجة سيراميك للطلاء الأصلي',
        description: 'حماية متقدمة للطلاء الأصلي للسيارة',
        protectionInfo: 'حماية فعالة للطلاء الأصلي من الخدوش والعوامل الجوية',
        protectionType: 'حماية طلاء أصلي',
        features: [
          'حماية من الخدوش',
          'حماية من الأشعة',
          'لمعان طبيعي',
          'حماية طويلة المدى',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-19-54.jpg',
        alt: 'حماية سيراميك للزجاج الأمامي',
        title: 'حماية زجاج أمامي متطورة',
        description: 'معالجة سيراميك خاصة للزجاج الأمامي',
        protectionInfo: 'حماية متقدمة للزجاج الأمامي من الخدوش والاتساخ',
        protectionType: 'حماية زجاج أمامي',
        features: [
          'رؤية أوضح',
          'منع التصاق الماء',
          'حماية من الخدوش',
          'سهولة التنظيف',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-20-44.jpg',
        alt: 'معالجة سيراميك للعجلات',
        title: 'معالجة سيراميك للعجلات الرياضية',
        description: 'حماية متقدمة للعجلات الرياضية من الأوساخ والصدأ',
        protectionInfo:
          'معالجة سيراميك خاصة للعجلات الرياضية لحمايتها من الأوساخ والصدأ',
        protectionType: 'حماية عجلات رياضية',
        features: [
          'حماية من الصدأ',
          'لمعان دائم',
          'سهولة التنظيف',
          'حماية من المواد الكيميائية',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-14_11-24-31.jpg',
        alt: 'حماية سيراميك نهائية',
        title: 'حماية سيراميك نهائية شاملة',
        description: 'المرحلة النهائية من معالجة السيراميك الشاملة',
        protectionInfo:
          'المرحلة النهائية من معالجة السيراميك لضمان الحماية الكاملة',
        protectionType: 'حماية نهائية',
        features: ['حماية كاملة', 'لمعان نهائي', 'ضمان شامل', 'نتائج مثالية'],
        category: 'ceramic',
      },
      // الصور الجديدة من 18 أغسطس
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-08-48.jpg',
        alt: 'معالجة سيراميك للسيارات الفاخرة',
        title: 'حماية سيراميك للسيارات الفاخرة',
        description: 'معالجة سيراميك متخصصة للسيارات الفاخرة والرياضية',
        protectionInfo:
          'حماية فائقة الجودة للسيارات الفاخرة مع ضمان الحماية الكاملة',
        protectionType: 'حماية فاخرة',
        features: [
          'جودة فائقة',
          'حماية شاملة',
          'لمعان استثنائي',
          'ضمان طويل المدى',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-08-50.jpg',
        alt: 'معالجة سيراميك للطلاء الأبيض',
        title: 'حماية خاصة للطلاء الأبيض',
        description: 'معالجة سيراميك متخصصة للطلاء الأبيض لحمايته من الاصفرار',
        protectionInfo: 'حماية فعالة للطلاء الأبيض من الاصفرار والعوامل الجوية',
        protectionType: 'حماية طلاء أبيض',
        features: [
          'منع الاصفرار',
          'حماية من الأشعة',
          'لمعان طبيعي',
          'حماية طويلة المدى',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-08-51.jpg',
        alt: 'معالجة سيراميك للطلاء الأسود',
        title: 'حماية خاصة للطلاء الأسود',
        description: 'معالجة سيراميك متخصصة للطلاء الأسود لحمايته من الخدوش',
        protectionInfo: 'حماية فعالة للطلاء الأسود من الخدوش والاتساخ',
        protectionType: 'حماية طلاء أسود',
        features: [
          'حماية من الخدوش',
          'لمعان عميق',
          'سهولة التنظيف',
          'حماية شاملة',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-08-52.jpg',
        alt: 'معالجة سيراميك للطلاء الأحمر',
        title: 'حماية خاصة للطلاء الأحمر',
        description: 'معالجة سيراميك متخصصة للطلاء الأحمر لحمايته من البهتان',
        protectionInfo: 'حماية فعالة للطلاء الأحمر من البهتان والعوامل الجوية',
        protectionType: 'حماية طلاء أحمر',
        features: [
          'منع البهتان',
          'حماية من الأشعة',
          'لمعان مشرق',
          'حماية طويلة المدى',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-08-54.jpg',
        alt: 'معالجة سيراميك للطلاء الأزرق',
        title: 'حماية خاصة للطلاء الأزرق',
        description: 'معالجة سيراميك متخصصة للطلاء الأزرق لحمايته من التلف',
        protectionInfo: 'حماية فعالة للطلاء الأزرق من التلف والعوامل الجوية',
        protectionType: 'حماية طلاء أزرق',
        features: ['حماية من التلف', 'لمعان طبيعي', 'حماية شاملة', 'ضمان شامل'],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-09-10.jpg',
        alt: 'معالجة سيراميك للطلاء الرمادي',
        title: 'حماية خاصة للطلاء الرمادي',
        description: 'معالجة سيراميك متخصصة للطلاء الرمادي لحمايته من الخدوش',
        protectionInfo: 'حماية فعالة للطلاء الرمادي من الخدوش والاتساخ',
        protectionType: 'حماية طلاء رمادي',
        features: [
          'حماية من الخدوش',
          'لمعان طبيعي',
          'سهولة التنظيف',
          'حماية شاملة',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-09-13.jpg',
        alt: 'معالجة سيراميك للطلاء الأخضر',
        title: 'حماية خاصة للطلاء الأخضر',
        description: 'معالجة سيراميك متخصصة للطلاء الأخضر لحمايته من البهتان',
        protectionInfo: 'حماية فعالة للطلاء الأخضر من البهتان والعوامل الجوية',
        protectionType: 'حماية طلاء أخضر',
        features: [
          'منع البهتان',
          'حماية من الأشعة',
          'لمعان طبيعي',
          'حماية طويلة المدى',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-09-16.jpg',
        alt: 'معالجة سيراميك للطلاء الأصفر',
        title: 'حماية خاصة للطلاء الأصفر',
        description: 'معالجة سيراميك متخصصة للطلاء الأصفر لحمايته من التلف',
        protectionInfo: 'حماية فعالة للطلاء الأصفر من التلف والعوامل الجوية',
        protectionType: 'حماية طلاء أصفر',
        features: ['حماية من التلف', 'لمعان مشرق', 'حماية شاملة', 'ضمان شامل'],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-09-22.jpg',
        alt: 'معالجة سيراميك للطلاء البرتقالي',
        title: 'حماية خاصة للطلاء البرتقالي',
        description:
          'معالجة سيراميك متخصصة للطلاء البرتقالي لحمايته من البهتان',
        protectionInfo:
          'حماية فعالة للطلاء البرتقالي من البهتان والعوامل الجوية',
        protectionType: 'حماية طلاء برتقالي',
        features: [
          'منع البهتان',
          'حماية من الأشعة',
          'لمعان مشرق',
          'حماية طويلة المدى',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-09-30.jpg',
        alt: 'معالجة سيراميك للطلاء البنفسجي',
        title: 'حماية خاصة للطلاء البنفسجي',
        description: 'معالجة سيراميك متخصصة للطلاء البنفسجي لحمايته من التلف',
        protectionInfo: 'حماية فعالة للطلاء البنفسجي من التلف والعوامل الجوية',
        protectionType: 'حماية طلاء بنفسجي',
        features: ['حماية من التلف', 'لمعان طبيعي', 'حماية شاملة', 'ضمان شامل'],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-09-32.jpg',
        alt: 'معالجة سيراميك للطلاء الوردي',
        title: 'حماية خاصة للطلاء الوردي',
        description: 'معالجة سيراميك متخصصة للطلاء الوردي لحمايته من البهتان',
        protectionInfo: 'حماية فعالة للطلاء الوردي من البهتان والعوامل الجوية',
        protectionType: 'حماية طلاء وردي',
        features: [
          'منع البهتان',
          'حماية من الأشعة',
          'لمعان طبيعي',
          'حماية طويلة المدى',
        ],
        category: 'ceramic',
      },

      {
        src: 'assets/images/gallery/photo_2025-08-18_11-10-21.jpg',
        alt: 'معالجة سيراميك للطلاء الفضي',
        title: 'حماية خاصة للطلاء الفضي',
        description: 'معالجة سيراميك متخصصة للطلاء الفضي لحمايته من الخدوش',
        protectionInfo: 'حماية فعالة للطلاء الفضي من الخدوش والاتساخ',
        protectionType: 'حماية طلاء فضي',
        features: [
          'حماية من الخدوش',
          'لمعان معدني',
          'سهولة التنظيف',
          'حماية شاملة',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-10-58.jpg',
        alt: 'معالجة سيراميك للطلاء الذهبي',
        title: 'حماية خاصة للطلاء الذهبي',
        description: 'معالجة سيراميك متخصصة للطلاء الذهبي لحمايته من الخدوش',
        protectionInfo: 'حماية فعالة للطلاء الذهبي من الخدوش والاتساخ',
        protectionType: 'حماية طلاء ذهبي',
        features: [
          'حماية من الخدوش',
          'لمعان ذهبي',
          'سهولة التنظيف',
          'حماية شاملة',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-11-07.jpg',
        alt: 'معالجة سيراميك للطلاء النحاسي',
        title: 'حماية خاصة للطلاء النحاسي',
        description: 'معالجة سيراميك متخصصة للطلاء النحاسي لحمايته من التأكسد',
        protectionInfo: 'حماية فعالة للطلاء النحاسي من التأكسد والعوامل الجوية',
        protectionType: 'حماية طلاء نحاسي',
        features: ['منع التأكسد', 'لمعان نحاسي', 'حماية شاملة', 'ضمان شامل'],
        category: 'ceramic',
      },

      {
        src: 'assets/images/gallery/photo_2025-08-18_11-11-18.jpg',
        alt: 'معالجة سيراميك للطلاء البلاتيني',
        title: 'حماية خاصة للطلاء البلاتيني',
        description: 'معالجة سيراميك متخصصة للطلاء البلاتيني لحمايته من الخدوش',
        protectionInfo: 'حماية فعالة للطلاء البلاتيني من الخدوش والاتساخ',
        protectionType: 'حماية طلاء بلاتيني',
        features: [
          'حماية من الخدوش',
          'لمعان بلاتيني',
          'سهولة التنظيف',
          'حماية شاملة',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-11-25.jpg',
        alt: 'معالجة سيراميك للطلاء الكرومي',
        title: 'حماية خاصة للطلاء الكرومي',
        description: 'معالجة سيراميك متخصصة للطلاء الكرومي لحمايته من الصدأ',
        protectionInfo: 'حماية فعالة للطلاء الكرومي من الصدأ والتأكسد',
        protectionType: 'حماية طلاء كرومي',
        features: ['منع الصدأ', 'لمعان كرومي', 'حماية شاملة', 'ضمان شامل'],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-11-46.jpg',
        alt: 'معالجة سيراميك للطلاء الميتاليك',
        title: 'حماية خاصة للطلاء الميتاليك',
        description: 'معالجة سيراميك متخصصة للطلاء الميتاليك لحمايته من الخدوش',
        protectionInfo: 'حماية فعالة للطلاء الميتاليك من الخدوش والاتساخ',
        protectionType: 'حماية طلاء ميتاليك',
        features: [
          'حماية من الخدوش',
          'لمعان ميتاليك',
          'سهولة التنظيف',
          'حماية شاملة',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-12-10.jpg',
        alt: 'معالجة سيراميك للطلاء البيرل',
        title: 'حماية خاصة للطلاء البيرل',
        description: 'معالجة سيراميك متخصصة للطلاء البيرل لحمايته من الخدوش',
        protectionInfo: 'حماية فعالة للطلاء البيرل من الخدوش والاتساخ',
        protectionType: 'حماية طلاء بيرل',
        features: [
          'حماية من الخدوش',
          'لمعان بيرل',
          'سهولة التنظيف',
          'حماية شاملة',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-12-20.jpg',
        alt: 'معالجة سيراميك للطلاء المات',
        title: 'حماية خاصة للطلاء المات',
        description: 'معالجة سيراميك متخصصة للطلاء المات لحمايته من الخدوش',
        protectionInfo: 'حماية فعالة للطلاء المات من الخدوش والاتساخ',
        protectionType: 'حماية طلاء مات',
        features: [
          'حماية من الخدوش',
          'لمعان مات',
          'سهولة التنظيف',
          'حماية شاملة',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-12-41.jpg',
        alt: 'معالجة سيراميك للطلاء الجلوسي',
        title: 'حماية خاصة للطلاء الجلوسي',
        description: 'معالجة سيراميك متخصصة للطلاء الجلوسي لحمايته من الخدوش',
        protectionInfo: 'حماية فعالة للطلاء الجلوسي من الخدوش والاتساخ',
        protectionType: 'حماية طلاء جلوسي',
        features: [
          'حماية من الخدوش',
          'لمعان جلوسي',
          'سهولة التنظيف',
          'حماية شاملة',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-12-48.jpg',
        alt: 'معالجة سيراميك للطلاء الكريستالي',
        title: 'حماية خاصة للطلاء الكريستالي',
        description:
          'معالجة سيراميك متخصصة للطلاء الكريستالي لحمايته من الخدوش',
        protectionInfo: 'حماية فعالة للطلاء الكريستالي من الخدوش والاتساخ',
        protectionType: 'حماية طلاء كريستالي',
        features: [
          'حماية من الخدوش',
          'لمعان كريستالي',
          'سهولة التنظيف',
          'حماية شاملة',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-12-59.jpg',
        alt: 'معالجة سيراميك للطلاء المائي',
        title: 'حماية خاصة للطلاء المائي',
        description: 'معالجة سيراميك متخصصة للطلاء المائي لحمايته من الخدوش',
        protectionInfo: 'حماية فعالة للطلاء المائي من الخدوش والاتساخ',
        protectionType: 'حماية طلاء مائي',
        features: [
          'حماية من الخدوش',
          'لمعان مائي',
          'سهولة التنظيف',
          'حماية شاملة',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-13-03.jpg',
        alt: 'معالجة سيراميك للطلاء البودري',
        title: 'حماية خاصة للطلاء البودري',
        description: 'معالجة سيراميك متخصصة للطلاء البودري لحمايته من الخدوش',
        protectionInfo: 'حماية فعالة للطلاء البودري من الخدوش والاتساخ',
        protectionType: 'حماية طلاء بودري',
        features: [
          'حماية من الخدوش',
          'لمعان بودري',
          'سهولة التنظيف',
          'حماية شاملة',
        ],
        category: 'ceramic',
      },
      {
        src: 'assets/images/gallery/photo_2025-08-18_11-13-22.jpg',
        alt: 'معالجة سيراميك نهائية شاملة',
        title: 'معالجة سيراميك نهائية شاملة',
        description:
          'المرحلة النهائية من معالجة السيراميك الشاملة لجميع أنواع الطلاء',
        protectionInfo:
          'حماية نهائية شاملة لجميع أنواع الطلاء مع ضمان الحماية الكاملة',
        protectionType: 'حماية نهائية شاملة',
        features: ['حماية كاملة', 'لمعان نهائي', 'ضمان شامل', 'نتائج مثالية'],
        category: 'ceramic',
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Navigate to contact form with service information
  navigateToContact(serviceType: string): void {
    // Create URL with service parameter
    const contactUrl = `/contact?service=${encodeURIComponent(serviceType)}`;

    // Navigate to contact page
    window.location.href = contactUrl;
  }

  openLightbox(index: number): void {
    this.currentImageIndex = index;
    this.isLightboxOpen = true;
    this.imageLoading = true;
    this.imageError = false;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
    this.imageLoading = false;
    this.imageError = false;
    document.body.style.overflow = 'auto';
  }

  onImageError(event: any): void {
    this.imageError = true;
    this.imageLoading = false;
    console.error('Image failed to load:', event.target.src);
  }

  onImageLoad(event: any): void {
    this.imageLoading = false;
    this.imageError = false;
  }

  nextImage(): void {
    this.currentImageIndex =
      (this.currentImageIndex + 1) % this.galleryImages.length;
  }

  previousImage(): void {
    this.currentImageIndex =
      this.currentImageIndex === 0
        ? this.galleryImages.length - 1
        : this.currentImageIndex - 1;
  }

  goToImage(index: number): void {
    this.currentImageIndex = index;
  }

  // Keyboard navigation
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isLightboxOpen) return;

    switch (event.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowRight':
        this.nextImage();
        break;
      case 'ArrowLeft':
        this.previousImage();
        break;
    }
  }
}

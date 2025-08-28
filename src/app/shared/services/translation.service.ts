import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private currentLang = 'ar';
  private isRtl = true;

  // Comprehensive translation dictionary for entire website
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
      'header.admin-messages': 'إدارة الرسائل',

      // Home Page - Hero Section
      'home.hero.title': 'رويال نانو سيراميك',
      'home.hero.subtitle': 'أفضل حماية للسيارات في مصر',
      'home.hero.description':
        'نحن متخصصون في توفير خدمات حماية متطورة للعربيات، الطيارات، المراكب، والموتوسيكلات باستخدام أحدث تكنولوجيا النانو سيراميك',
      'home.hero.cta_button': 'احمي سيارتك الآن',
      'home.hero.learn_more': 'اعرف أكثر',

      // Home Page - Services Section
      'home.services.title': 'خدماتنا',
      'home.services.subtitle':
        'نقدم مجموعة شاملة من خدمات حماية السيارات عالية الجودة',

      // Service Cards
      'service.ceramic_coating.title': 'طلاء السيراميك',
      'service.ceramic_coating.description':
        'حماية طويلة المدى للطلاء باستخدام تقنية النانو المتطورة',
      'service.paint_protection.title': 'حماية الطلاء',
      'service.paint_protection.description':
        'حماية شاملة للطلاء من الخدوش والعوامل الجوية',
      'service.interior_protection.title': 'حماية المقصورة الداخلية',
      'service.interior_protection.description':
        'حماية المقاعد والأسطح الداخلية من التلف',
      'service.detailing.title': 'تنظيف وتلميع شامل',
      'service.detailing.description':
        'تنظيف شامل وتلميع احترافي لجميع أجزاء السيارة',

      // Home Page - Features Section
      'home.features.title': 'لماذا تختارنا',
      'home.features.subtitle': 'مميزات تجعلنا الخيار الأمثل لحماية سيارتك',

      // Feature Cards
      'feature.experience.title': 'خبرة عالية',
      'feature.experience.description':
        'خبرة تزيد عن 10 سنوات في مجال حماية السيارات',
      'feature.quality.title': 'جودة عالية',
      'feature.quality.description':
        'نستخدم أفضل المنتجات العالمية وأحدث التقنيات',
      'feature.warranty.title': 'ضمان شامل',
      'feature.warranty.description':
        'ضمان شامل على جميع خدماتنا مع دعم فني متواصل',
      'feature.team.title': 'فريق محترف',
      'feature.team.description':
        'فريق من الخبراء المدربين على أحدث التقنيات العالمية',

      // Home Page - CTA Section
      'home.cta.title': 'جاهز لحماية سيارتك؟',
      'home.cta.description': 'تواصل معنا الآن واحصل على استشارة مجانية',
      'home.cta.button': 'تواصل معنا',

      // Home Page - Before & After Section
      'home.beforeAfter.title': 'معرض قبل وبعد',
      'home.beforeAfter.subtitle': 'شاهد التحولات المذهلة لخدماتنا',

      // Home Page - Social Media Section
      'home.social.title': 'تابعنا على وسائل التواصل الاجتماعي',
      'home.social.subtitle':
        'احصل على أحدث الأخبار والعروض الخاصة عبر صفحاتنا الاجتماعية',

      // Social Media Cards
      'social.whatsapp.title': 'WhatsApp',
      'social.whatsapp.description':
        'تواصل معنا مباشرة للحصول على استشارة فورية',
      'social.instagram.title': 'Instagram',
      'social.instagram.description': 'شاهد صور أعمالنا وأحدث التحديثات',
      'social.facebook.title': 'Facebook',
      'social.facebook.description': 'انضم إلى مجتمعنا واحصل على العروض الخاصة',
      'social.youtube.title': 'YouTube',
      'social.youtube.description':
        'شاهد فيديوهات تعليمية ونصائح العناية بالسيارة',

      // Footer
      'footer.description': 'رويال نانو سيراميك - أفضل حماية للسيارات في مصر',
      'footer.quick_links': 'روابط سريعة',
      'footer.services_list': 'خدماتنا',
      'footer.contact_info': 'معلومات التواصل',
      'footer.follow_us': 'تابعنا على',
      'footer.rights': 'جميع الحقوق محفوظة',
      'footer.home': 'الرئيسية',
      'footer.about': 'من نحن',
      'footer.services': 'الخدمات',
      'footer.contact': 'اتصل بنا',
      'footer.our_services': 'خدماتنا',
      'footer.ceramic_coating': 'طلاء السيراميك',
      'footer.paint_protection': 'حماية الطلاء',
      'footer.interior_protection': 'حماية المقصورة الداخلية',
      'footer.detailing': 'تنظيف وتلميع شامل',
      'footer.our_branches': 'فروعنا',
      'footer.branch_6october': '6 October',
      'footer.branch_nasr_city': 'Nasr City',
      'footer.branch_mohandessin': 'Mohandessin',
      'footer.branch_sheikh_zayed': 'Sheikh Zayed',
      'footer.branch_alexandria': 'Alexandria',
      'footer.click_all_branches': 'انقر لرؤية جميع الفروع',
      'footer.click_more': 'عرض المزيد',
      'footer.click_less': 'إخفاء',
      'footer.contact_whatsapp': 'تواصل معنا عبر واتساب',
      'footer.address': 'أكتوبر، الجيزة',
      'footer.copyright': '© 2025 رويال نانو سيراميك. جميع الحقوق محفوظة.',

      // Common
      'common.loading': 'جاري التحميل...',
      'common.error': 'حدث خطأ',
      'common.success': 'تم بنجاح',
      'common.read_more': 'اقرأ المزيد',
      'common.book_now': 'احجز الآن',
      'common.get_quote': 'احصل على عرض سعر',
      'common.learn_more': 'اعرف أكثر',
      'common.contact_us': 'تواصل معنا',
      'common.view_more': 'شاهد المزيد',
      'common.back_to_top': 'العودة للأعلى',
      'common.optional': 'اختياري',
      'common.reset': 'إعادة تعيين',
      'common.form_status': 'حالة النموذج',
      'common.field_required': 'هذا الحقل مطلوب',
      'common.min_length_error': 'يجب أن يكون الطول على الأقل {0} أحرف',
      'common.max_length_error': 'يجب أن لا يتجاوز الطول {0} حرف',
      'common.name_format_error':
        'يجب أن يحتوي الاسم على أحرف عربية أو إنجليزية فقط',
      'common.phone_format_error':
        'صيغة رقم الهاتف غير صحيحة - استخدم رقم مصري صحيح',
      'common.invalid_format': 'صيغة غير صحيحة',
      'common.server_connection_error':
        'لا يمكن الاتصال بالخادم - تحقق من الاتصال بالإنترنت',
      'common.invalid_form_data': 'بيانات النموذج غير صحيحة',
      'common.server_error': 'خطأ في الخادم - يرجى المحاولة لاحقاً',
      'common.general_error': 'حدث خطأ أثناء إرسال النموذج',

      // Hero Slider
      'slider.advanced_protection': 'حماية متطورة بتكنولوجيا النانو',
      'slider.experience_years': 'خبرة تزيد عن 10 سنوات',
      'slider.latest_technology':
        'نستخدم أحدث التقنيات العالمية لحماية سيارتك من العوامل الجوية والخدوش',
      'slider.contact_us': 'تواصل معنا',
      'slider.learn_more_services': 'اعرف أكثر عن خدماتنا',
      'slider.royal_nano_title': 'رويال نانو سيراميك',
      'slider.experts_description':
        'خبراء في حماية السيارات باستخدام أحدث تقنيات النانو والسيراميك',

      // About Us Page
      'about.hero.title': 'من نحن',
      'about.hero.subtitle': 'رويال نانو سيراميك - خبراء في حماية السيارات',
      'about.why_choose.title': 'لماذا تختار رويال نانو',
      'about.why_choose.subtitle':
        'اكتشف المميزات التي تجعلنا الخيار الأمثل لحماية سيارتك',
      'about.why_choose.main_title': 'ليه رويال نانو',
      'about.why_choose.speed.title': 'سرعة',
      'about.why_choose.speed.description':
        'حلول سريعة وفعالة لاحتياجات سيارتك. نقدم تكنولوجيا متطورة تضمن السرعة والموثوقية، مما يساعدك على البقاء في المقدمة في سوق تنافسي.',
      'about.why_choose.leadership.title': 'قيادة',
      'about.why_choose.leadership.description':
        'قيادة مبتكرة تلهم التقدم والنمو. قيادتنا ذات الرؤية المستقبلية تدفع الابتكار، وتعزز ثقافة التحسين والتطوير المستمر.',
      'about.why_choose.support.title': 'دعم',
      'about.why_choose.support.description':
        'دعم عملاء على مدار الساعة لمساعدتك متى احتجت. فريقنا المتفاني متاح دائماً، ويقدم التوجيه والدعم المتخصص لضمان رضاك على مدار الساعة.',
      'about.why_choose.sustainability.title': 'استدامة',
      'about.why_choose.sustainability.description':
        'ملتزمون بالاستدامة والممارسات الصديقة للبيئة. نعطي الأولوية للممارسات الواعية بيئياً، مما يضمن أن عملياتنا مستدامة وتساهم في مستقبل أكثر خضرة.',
      'about.story.title': 'قصتنا',
      'about.story.description':
        'نحن شركة متخصصة في حماية السيارات باستخدام أحدث تقنيات النانو والسيراميك.',
      'about.history.title': 'تاريخنا في السوق المصري',
      'about.timeline.2010.title': 'بداية الرحلة',
      'about.timeline.2010.description':
        'بدأت رحلة رويال نانو سيراميك عندما أسسها المهندس حمادة العدلي، خريج كلية الهندسة بجامعة القاهرة، وكان شغوفاً بتقنيات حماية السيارات الحديثة. بدأت الشركة كورشة صغيرة في منطقة المعادي بالقاهرة.',
      'about.timeline.2012.title': 'ثورة النانو تكنولوجي',
      'about.timeline.2012.description':
        'أدرك المؤسس أن السوق المصري يحتاج إلى تقنيات متقدمة لحماية السيارات من الظروف المناخية القاسية. بدأ في استيراد أول منتجات النانو سيراميك من امريكا، وكانت هذه بداية ثورة في مجال حماية السيارات في مصر.',
      'about.timeline.2015.title': 'التوسع الإقليمي',
      'about.timeline.2015.description':
        'توسعت الشركة لتشمل فروعاً في الإسكندرية والإسماعيلية، وأصبحت رائدة في مجال طلاء السيراميك للسيارات. تخطت التحديات الاقتصادية من خلال التركيز على الجودة والخدمة المتميزة.',
      'about.timeline.2018.title': 'الشراكة الاستراتيجية',
      'about.timeline.2018.description':
        'حققت رويال نانو سيراميك إنجازاً كبيراً عندما أصبحت الشريك الحصري لشركة رويال شيلد" الأمريكية في مصر وشمال أفريقيا. هذا التعاون سمح بالوصول إلى أحدث التقنيات العالمية.',
      'about.timeline.2020.title': 'مركز الأبحاث والتطوير',
      'about.timeline.2020.description':
        'شهد عام 2020 تحولاً كبيراً في استراتيجية الشركة، حيث بدأت في تطوير منتجات محلية باستخدام خبرات مصرية أمريكية مشتركة. تم إنشاء مركز أبحاث وتطوير في مدينة 6 أكتوبر.',
      'about.timeline.2024.title': 'الريادة الوطنية',
      'about.timeline.2024.description':
        'اليوم، تمتلك رويال نانو سيراميك شبكة من 16 فرعاً منتشرة في جميع أنحاء مصر. أصبحت الشركة مرجعية في مجال حماية السيارات، وتخدم أكثر من 250,000 عميل سنوياً.',
      'about.values.title': 'قيم الشركة',
      'about.values.quality.title': 'الجودة المصرية الأصيلة',
      'about.values.quality.description':
        'نلتزم بأعلى معايير الجودة مع الحفاظ على الهوية المصرية',
      'about.values.precision.title': 'الدقة الامريكية',
      'about.values.precision.description':
        'نطبق معايير الدقة والكفاءة الامريكية في جميع خدماتنا',
      'about.values.innovation.title': 'الابتكار المستمر',
      'about.values.innovation.description':
        'نطور تقنيات جديدة مخصصة للظروف المناخية المصرية',
      'about.vision.title': 'رؤيتنا',
      'about.vision.description':
        'أن نكون الخيار الأول لعملائنا في مجال حماية وتجميل السيارات.',
      'about.mission.title': 'مهمتنا',
      'about.mission.description':
        'تقديم خدمات عالية الجودة باستخدام أفضل المنتجات العالمية.',

      // Services Page
      'services.hero.title': 'خدماتنا المتطورة',
      'services.hero.subtitle':
        'تقنيات النانو والسيراميك المتقدمة لحماية سيارتك',
      'services.hero.stats.services': 'خدمة متطورة',
      'services.hero.stats.experience': 'سنوات خبرة',
      'services.hero.stats.quality': 'ضمان الجودة',
      'services.section.title': 'خدمات الحماية المتطورة',
      'services.section.subtitle':
        'اكتشف مجموعة خدماتنا الشاملة لحماية سيارتك بأحدث تقنيات النانو والسيراميك',
      'services.diamond_hybrid.title': 'Diamond Hybrid Plus',
      'services.diamond_hybrid.description':
        'تقنية هجينة متطورة تجمع بين قوة الماس وصلابة السيراميك. توفر حماية استثنائية ضد الخدوش والتآكل مع لمعان لا مثيل له.',
      'services.diamond_hybrid.features.protection': 'حماية 5 سنوات',
      'services.diamond_hybrid.features.scratch': 'مقاومة الخدوش',
      'services.diamond_hybrid.features.shine': 'لمعان استثنائي',
      'services.diamond_hybrid.details.protection_level': 'مستوى الحماية: 9H',
      'services.diamond_hybrid.details.duration': 'مدة الحماية: 5 سنوات',
      'services.diamond_hybrid.details.warranty': 'الضمان: شامل',
      'services.paint_protection.title': 'Paint Protection',
      'services.paint_protection.description':
        'حماية شاملة للطلاء باستخدام أفلام حماية متطورة. تحمي من الخدوش والحجارة والأضرار البيئية.',
      'services.paint_protection.features.protection': 'حماية 5 سنوات',
      'services.paint_protection.features.films': 'أفلام متطورة',
      'services.paint_protection.features.transparency': 'شفافية عالية',
      'services.paint_protection.details.protection_level': 'مستوى الحماية: 8H',
      'services.paint_protection.details.duration': 'مدة الحماية: 5 سنوات',
      'services.paint_protection.details.warranty': 'الضمان: شامل',
      'services.paint_protection_process.title': 'Paint Protection Process',
      'services.paint_protection_process.description':
        'عملية تطبيق حماية الطلاء باحترافية عالية. نستخدم أحدث التقنيات وأفضل المواد لضمان حماية مثالية.',
      'services.paint_protection_process.features.protection': 'حماية 5 سنوات',
      'services.paint_protection_process.features.technology': 'تقنيات متطورة',
      'services.paint_protection_process.features.professional':
        'احترافية عالية',
      'services.paint_protection_process.details.protection_level':
        'مستوى الحماية: 8H',
      'services.paint_protection_process.details.duration':
        'مدة الحماية: 5 سنوات',
      'services.paint_protection_process.details.warranty': 'الضمان: شامل',
      'services.shield_ultracool.title': 'Shield UltraCool',
      'services.shield_ultracool.description':
        'تقنية تبريد متطورة تحمي سيارتك من الحرارة العالية مع تقليل درجة حرارة المقصورة الداخلية بشكل ملحوظ.',
      'services.shield_ultracool.features.protection': 'حماية 4 سنوات',
      'services.shield_ultracool.features.cooling': 'تبريد متطور',
      'services.shield_ultracool.features.energy': 'توفير الطاقة',
      'services.shield_ultracool.details.protection_level': 'مستوى الحماية: 7H',
      'services.shield_ultracool.details.duration': 'مدة الحماية: 4 سنوات',
      'services.shield_ultracool.details.warranty': 'الضمان: شامل',
      'services.technology.title': 'تقنيات النانو المتطورة',
      'services.technology.subtitle':
        'اكتشف كيف تعمل تقنيات النانو والسيراميك لحماية سيارتك',
      'services.technology.nano.title': 'تقنية النانو',
      'services.technology.nano.description':
        'تستخدم جزيئات نانوية متناهية الصغر تخترق سطح الطلاء لتشكل طبقة حماية قوية ومتينة. هذه التقنية تضمن تغطية شاملة وحماية طويلة المدى.',
      'services.technology.ceramic.title': 'السيراميك المتقدم',
      'services.technology.ceramic.description':
        'طلاء سيراميك متطور يوفر صلابة عالية ومقاومة استثنائية للخدوش والتآكل. يحافظ على لمعان الطلاء الأصلي مع إضافة طبقة حماية شفافة.',
      'services.technology.graphene.title': 'الجرافين الهجين',
      'services.technology.graphene.description':
        'تقنية الجرافين تجمع بين القوة الاستثنائية والمرونة العالية. توفر حماية متقدمة مع خصائص موصلة للحرارة ومقاومة عالية للتلف.',
      'services.technology.multilayer.title': 'الحماية المتعددة الطبقات',
      'services.technology.multilayer.description':
        'نظام حماية متطور يتكون من عدة طبقات متخصصة. كل طبقة تقدم حماية محددة مما يضمن تغطية شاملة ضد جميع أنواع التلف.',
      'services.process.title': 'كيفية تطبيق الحماية',
      'services.process.subtitle': 'خطوات احترافية لضمان أفضل نتيجة',
      'services.process.step1.title': 'التنظيف الشامل',
      'services.process.step1.description':
        'تنظيف شامل للسيارة وإزالة جميع الأوساخ والزيوت',
      'services.process.step2.title': 'إزالة الشوائب',
      'services.process.step2.description':
        'إزالة الشوائب والطلاء القديم لضمان التصاق مثالي',
      'services.process.step3.title': 'تطبيق الحماية',
      'services.process.step3.description':
        'تطبيق طبقة الحماية باستخدام تقنيات متطورة',
      'services.process.step4.title': 'الفحص النهائي',
      'services.process.step4.description':
        'فحص شامل للتأكد من جودة التطبيق والنتيجة النهائية',
      'services.cta.title': 'جاهز لحماية سيارتك؟',
      'services.cta.description':
        'احصل على أفضل خدمات الحماية المتطورة من خبراء رويال نانو سيراميك',
      'services.cta.primary_button': 'احجز موعدك الآن',
      'services.cta.secondary_button': 'شاهد أعمالنا',
      'services.premium_badge': 'مميز',

      // Blog Page
      'blog.hero.title': 'مدونة رويال نانو سيراميك',
      'blog.hero.subtitle':
        'أحدث الأخبار والنصائح المتخصصة في حماية السيارات بتكنولوجيا النانو',
      'blog.hero.stats.articles': 'مقال متخصص',
      'blog.hero.stats.trusted': 'معلومات موثوقة',
      'blog.hero.stats.support': 'دعم فني',
      'blog.categories.all': 'جميع المقالات',
      'blog.categories.nano_technology': 'تكنولوجيا النانو',
      'blog.categories.car_care': 'العناية بالسيارة',
      'blog.categories.paint_protection': 'حماية الطلاء',
      'blog.categories.tips': 'نصائح وإرشادات',
      'blog.featured.badge': 'مقال مميز',
      'blog.posts.title': 'أحدث المقالات',
      'blog.search.placeholder': 'ابحث في المقالات...',
      'blog.load_more': 'عرض المزيد من المقالات',
      'blog.newsletter.title': 'اشترك في نشرتنا البريدية',
      'blog.newsletter.description':
        'احصل على أحدث المقالات والنصائح حول حماية السيارات مباشرة في بريدك الإلكتروني',
      'blog.newsletter.placeholder': 'أدخل بريدك الإلكتروني',
      'blog.newsletter.subscribe': 'اشتراك',
      'blog.quick_view': 'عرض سريع',
      'blog.read_more': 'اقرأ المزيد',
      'blog.read_full': 'اقرأ المقال كاملاً',
      'blog.subscribe_success': 'تم الاشتراك بنجاح في النشرة البريدية!',

      // Gallery Page
      'gallery.hero.title': 'معرض حماية السيارات',
      'gallery.hero.subtitle': 'اكتشف تقنيات الحماية المتقدمة لسيارتك',
      'gallery.section.title': 'معرض الأعمال',
      'gallery.section.subtitle': 'شاهد كيف نحمي سيارتك بطرق مبتكرة ومتطورة',
      'gallery.lightbox.protection_details': 'تفاصيل الحماية',
      'gallery.lightbox.features': 'المميزات',
      'gallery.lightbox.close': 'إغلاق',
      'gallery.lightbox.previous': 'السابق',
      'gallery.lightbox.next': 'التالي',

      // Join Us Page
      'join.hero.title': 'انضم إلى فريقنا',
      'join.hero.subtitle': 'كن جزءاً من مستقبل حماية السيارات في مصر',
      'join.hero.stats.branches': 'فرع',
      'join.hero.stats.employees': 'موظف',
      'join.hero.stats.experience': 'سنوات خبرة',
      'join.application.title': 'تقديم طلب توظيف',
      'join.application.subtitle':
        'املأ النموذج أدناه وسنقوم بالتواصل معك في أقرب وقت ممكن',
      'join.form.full_name': 'الاسم الكامل *',
      'join.form.full_name_placeholder': 'أدخل اسمك الكامل',
      'join.form.phone': 'رقم الهاتف *',
      'join.form.phone_placeholder': 'أدخل رقم هاتفك',
      'join.form.email': 'البريد الإلكتروني',
      'join.form.email_placeholder': 'أدخل بريدك الإلكتروني',
      'join.form.position': 'الوظيفة المطلوبة *',
      'join.form.position_placeholder': 'اختر الوظيفة',
      'join.form.experience': 'الخبرة السابقة',
      'join.form.experience_placeholder':
        'اذكر خبرتك السابقة في المجال (اختياري)',
      'join.form.cv': 'مرفق السيرة الذاتية *',
      'join.form.cv_placeholder': 'اختر ملف السيرة الذاتية',
      'join.form.cv_types': 'PDF, DOC, DOCX',
      'join.form.message': 'رسالة إضافية',
      'join.form.message_placeholder':
        'أضف أي معلومات إضافية تريد مشاركتها معنا',
      'join.form.submit': 'إرسال طلب التوظيف',
      'join.form.reset': 'إعادة تعيين',
      'join.why.title': 'لماذا تنضم إلينا؟',
      'join.why.subtitle':
        'اكتشف المميزات التي تجعل رويال نانو سيراميك مكان العمل المثالي',
      'join.why.career_growth.title': 'فرص نمو مهني',
      'join.why.career_growth.description':
        'نقدم مسار واضح للتطور الوظيفي مع فرص ترقية مستمرة',
      'join.why.training.title': 'تدريب مستمر',
      'join.why.training.description':
        'برامج تدريبية متقدمة في أحدث تقنيات النانو والسيراميك',
      'join.why.benefits.title': 'مزايا تنافسية',
      'join.why.benefits.description':
        'رواتب مجزية ومزايا إضافية تتناسب مع خبرتك وأدائك',
      'join.why.environment.title': 'بيئة عمل داعمة',
      'join.why.environment.description':
        'فريق متعاون وبيئة عمل إيجابية تشجع على الإبداع',
      'join.why.network.title': 'شبكة فروع واسعة',
      'join.why.network.description':
        '16 فرع في جميع أنحاء مصر مع إمكانية النقل بين الفروع',
      'join.why.technology.title': 'تقنيات متطورة',
      'join.why.technology.description':
        'العمل مع أحدث التقنيات العالمية في مجال حماية السيارات',
      'join.cta.title': 'جاهز لبدء رحلتك معنا؟',
      'join.cta.description':
        'انضم إلى فريق رويال نانو سيراميك وكن جزءاً من مستقبل صناعة السيارات',
      'join.cta.contact': 'تواصل معنا',
      'join.cta.learn_more': 'اعرف المزيد عنا',
      'join.jobs.tele_sales': 'تيلي سيلز',
      'join.jobs.branch_manager': 'مدير فرع',
      'join.jobs.nano_technician': 'فني نانو',
      'join.jobs.sales_manager': 'مدير مبيعات',
      'join.jobs.secretary': 'سكرتيره',
      'join.jobs.media_buyer': 'ميديا باير',
      'join.jobs.social_media_moderator': 'سوشيال ميديا مديتيور',
      'join.file_error': 'يرجى اختيار ملف بصيغة PDF أو DOC أو DOCX فقط',
      'join.success_message': 'تم إرسال طلب التوظيف بنجاح! سنتواصل معك قريباً.',

      // Contact Page
      'contact.hero.title': 'اتصل بنا',
      'contact.hero.subtitle': 'نحن هنا لمساعدتك في حماية سيارتك',
      'contact.form.title': 'أرسل لنا رسالة',
      'contact.form.full_name': 'الاسم الكامل',
      'contact.form.full_name_placeholder': 'أدخل اسمك',
      'contact.form.phone': 'رقم الهاتف',
      'contact.form.phone_placeholder': 'أدخل رقم الهاتف',
      'contact.form.car_type': 'نوع السيارة',
      'contact.form.car_type_placeholder': 'أدخل نوع السيارة',
      'contact.form.car_model': 'موديل السيارة',
      'contact.form.car_model_placeholder': 'أدخل موديل السيارة',
      'contact.form.notes': 'ملاحظات إضافية',
      'contact.form.notes_placeholder': 'أضف أي ملاحظات أو متطلبات خاصة',
      'contact.form.submit': 'إرسال الطلب',
      'contact.form.success_message':
        'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.',
      'contact.location.title': 'موقعنا',
      'contact.location.company': 'Royal Nano Ceramic',
      'contact.location.address1': 'المحور الخدمي، قسم أول 6 أكتوبر',
      'contact.location.address2': 'قسم ثان 6 أكتوبر، محافظة الجيزة 12563',
      'contact.location.phone': '+20 123 456 7890',
      'contact.location.email': 'info@royalnanoceramic.com',
      'contact.location.hours': 'طوال أيام الأسبوع: 11:00 ص - 11:00 م',
      'contact.map.title': 'موقع Royal Nano Ceramic',
      'contact.map.open_google': 'افتح في Google Maps',
      'contact.social.title': 'تواصل معنا عبر وسائل التواصل الاجتماعي',
      'contact.social.subtitle': 'اختر الطريقة التي تفضلها للتواصل معنا',
      'contact.social.whatsapp.title': 'WhatsApp',
      'contact.social.whatsapp.description': 'تواصل فوري مع فريق العمل',
      'contact.social.instagram.title': 'Instagram',
      'contact.social.instagram.description': 'تابع أعمالنا وأحدث التحديثات',
      'contact.social.facebook.title': 'Facebook',
      'contact.social.facebook.description': 'انضم إلى صفحتنا الرسمية',
      'contact.social.email.title': 'البريد الإلكتروني',
      'contact.social.email.description': 'أرسل لنا رسالة عبر البريد',
      'contact.car_types.sedan': 'سيدان',
      'contact.car_types.suv': 'SUV',
      'contact.car_types.hatchback': 'هاتشباك',
      'contact.car_types.coupe': 'كوبيه',
      'contact.car_types.van': 'فان',
      'contact.car_types.truck': 'شاحنة',
      'contact.car_types.motorcycle': 'دراجة نارية',
      'contact.car_types.other': 'أخرى',

      // Blog Page - Blog Posts Data
      'blog.post.1.title': 'تكنولوجيا النانو سيراميك: ثورة في حماية السيارات',
      'blog.post.1.excerpt':
        'اكتشف كيف أحدثت تكنولوجيا النانو سيراميك ثورة في عالم حماية السيارات، وتعلم عن أحدث التقنيات المستخدمة في رويال نانو سيراميك.',
      'blog.post.1.category': 'تكنولوجيا النانو',
      'blog.post.1.readTime': '8 دقائق',
      'blog.post.1.tags':
        'نانو سيراميك,حماية السيارات,تكنولوجيا متقدمة,رويال نانو',
      'blog.post.1.seoKeywords':
        'نانو سيراميك,حماية السيارات,تكنولوجيا النانو,رويال نانو سيراميك,طلاء سيراميك',
      'blog.post.1.seoDescription':
        'اكتشف تكنولوجيا النانو سيراميك المتقدمة في حماية السيارات مع رويال نانو سيراميك. أحدث التقنيات لحماية طلاء سيارتك.',

      'blog.post.2.title': 'كيف تحمي سيارتك من أشعة الشمس الضارة',
      'blog.post.2.excerpt':
        'أشعة الشمس يمكن أن تلحق أضراراً بالغة بطلاء سيارتك. تعلم أفضل الطرق لحماية سيارتك من الأشعة فوق البنفسجية.',
      'blog.post.2.category': 'حماية الطلاء',
      'blog.post.2.readTime': '6 دقائق',
      'blog.post.2.tags':
        'حماية من الشمس,طلاء السيارات,أشعة فوق البنفسجية,صيانة السيارات',
      'blog.post.2.seoKeywords':
        'حماية السيارات من الشمس,أشعة فوق البنفسجية,طلاء السيارات,صيانة السيارات',
      'blog.post.2.seoDescription':
        'تعلم كيفية حماية سيارتك من أشعة الشمس الضارة وأفضل الطرق لحماية طلاء سيارتك من التلف.',

      'blog.post.3.title':
        'فوائد طلاء السيراميك: لماذا تختار رويال نانو سيراميك',
      'blog.post.3.excerpt':
        'اكتشف الفوائد العديدة لطلاء السيراميك وكيف يمكن أن يحافظ على مظهر سيارتك لسنوات عديدة.',
      'blog.post.3.category': 'تكنولوجيا النانو',
      'blog.post.3.readTime': '7 دقائق',
      'blog.post.3.tags': 'طلاء سيراميك,فوائد,حماية طويلة المدى,رويال نانو',
      'blog.post.3.seoKeywords':
        'طلاء سيراميك,فوائد طلاء السيراميك,حماية السيارات,رويال نانو سيراميك',
      'blog.post.3.seoDescription':
        'اكتشف الفوائد العديدة لطلاء السيراميك وكيف يمكن أن يحافظ على مظهر سيارتك لسنوات عديدة.',

      'blog.post.4.title': 'أفضل طرق تنظيف السيارة بعد تطبيق النانو سيراميك',
      'blog.post.4.excerpt':
        'بعد تطبيق النانو سيراميك، تحتاج سيارتك لطرق تنظيف خاصة. تعلم الطرق الصحيحة لتنظيف سيارتك.',
      'blog.post.4.category': 'العناية بالسيارة',
      'blog.post.4.readTime': '5 دقائق',
      'blog.post.4.tags': 'تنظيف السيارة,نانو سيراميك,صيانة,نصائح',
      'blog.post.4.seoKeywords':
        'تنظيف السيارة,نانو سيراميك,صيانة السيارات,نصائح تنظيف',
      'blog.post.4.seoDescription':
        'تعلم أفضل طرق تنظيف السيارة بعد تطبيق النانو سيراميك وكيفية الحفاظ على طبقة الحماية.',

      'blog.post.5.title':
        'مقارنة: النانو سيراميك التقليدي vs التكنولوجيا المتقدمة',
      'blog.post.5.excerpt':
        'قارن بين تقنيات النانو سيراميك التقليدية والتكنولوجيا المتقدمة المستخدمة في رويال نانو سيراميك.',
      'blog.post.5.category': 'تكنولوجيا النانو',
      'blog.post.5.readTime': '9 دقائق',
      'blog.post.5.tags':
        'مقارنة تقنيات,نانو سيراميك,تكنولوجيا متقدمة,رويال نانو',
      'blog.post.5.seoKeywords':
        'مقارنة نانو سيراميك,تقنيات حماية السيارات,رويال نانو سيراميك,تكنولوجيا متقدمة',
      'blog.post.5.seoDescription':
        'قارن بين تقنيات النانو سيراميك التقليدية والتكنولوجيا المتقدمة المستخدمة في رويال نانو سيراميك.',

      'blog.post.6.title': 'كيفية الحفاظ على لمعان السيارة مع النانو سيراميك',
      'blog.post.6.excerpt':
        'تعلم كيفية الحفاظ على لمعان سيارتك لأطول فترة ممكنة مع تقنيات النانو سيراميك المتقدمة.',
      'blog.post.6.category': 'العناية بالسيارة',
      'blog.post.6.readTime': '6 دقائق',
      'blog.post.6.tags': 'لمعان السيارة,نانو سيراميك,صيانة,مظهر جديد',
      'blog.post.6.seoKeywords':
        'لمعان السيارة,نانو سيراميك,صيانة السيارات,مظهر جديد',
      'blog.post.6.seoDescription':
        'تعلم كيفية الحفاظ على لمعان سيارتك لأطول فترة ممكنة مع تقنيات النانو سيراميك المتقدمة.',

      'blog.post.7.title': 'أخطاء شائعة في العناية بالسيارة بعد النانو سيراميك',
      'blog.post.7.excerpt':
        'تجنب الأخطاء الشائعة التي يرتكبها الكثيرون في العناية بسياراتهم بعد تطبيق النانو سيراميك.',
      'blog.post.7.category': 'نصائح وإرشادات',
      'blog.post.7.readTime': '7 دقائق',
      'blog.post.7.tags': 'أخطاء شائعة,نانو سيراميك,نصائح,تجنب الأخطاء',
      'blog.post.7.seoKeywords':
        'أخطاء العناية بالسيارة,نانو سيراميك,نصائح صيانة,تجنب الأخطاء',
      'blog.post.7.seoDescription':
        'تجنب الأخطاء الشائعة التي يرتكبها الكثيرون في العناية بسياراتهم بعد تطبيق النانو سيراميك.',

      'blog.post.8.title': 'تكنولوجيا الجرافين: المستقبل في حماية السيارات',
      'blog.post.8.excerpt':
        'اكتشف تكنولوجيا الجرافين المتقدمة وكيف ستغير مستقبل حماية السيارات مع رويال نانو سيراميك.',
      'blog.post.8.category': 'تكنولوجيا النانو',
      'blog.post.8.readTime': '8 دقائق',
      'blog.post.8.tags': 'جرافين,تكنولوجيا المستقبل,حماية متقدمة,رويال نانو',
      'blog.post.8.seoKeywords':
        'تكنولوجيا الجرافين,حماية السيارات,رويال نانو سيراميك,تكنولوجيا المستقبل',
      'blog.post.8.seoDescription':
        'اكتشف تكنولوجيا الجرافين المتقدمة وكيف ستغير مستقبل حماية السيارات مع رويال نانو سيراميك.',

      'blog.post.9.title': 'كيفية اختيار أفضل خدمة نانو سيراميك لسيارتك',
      'blog.post.9.excerpt':
        'دليل شامل لاختيار أفضل خدمة نانو سيراميك لسيارتك. تعلم ما يجب البحث عنه في الشركة.',
      'blog.post.9.category': 'نصائح وإرشادات',
      'blog.post.9.readTime': '6 دقائق',
      'blog.post.9.tags': 'اختيار الخدمة,نانو سيراميك,نصائح,دليل شامل',
      'blog.post.9.seoKeywords':
        'اختيار خدمة نانو سيراميك,أفضل شركة نانو سيراميك,نصائح اختيار,دليل شامل',
      'blog.post.9.seoDescription':
        'دليل شامل لاختيار أفضل خدمة نانو سيراميك لسيارتك. تعلم ما يجب البحث عنه في الشركة.',

      'blog.post.10.title': 'الفرق بين الشمع التقليدي والنانو سيراميك',
      'blog.post.10.excerpt':
        'قارن بين الشمع التقليدي والنانو سيراميك. اكتشف لماذا النانو سيراميك هو الخيار الأفضل.',
      'blog.post.10.category': 'تكنولوجيا النانو',
      'blog.post.10.readTime': '6 دقائق',
      'blog.post.10.tags': 'شمع تقليدي,نانو سيراميك,مقارنة,أفضل خيار',
      'blog.post.10.seoKeywords':
        'شمع تقليدي,نانو سيراميك,مقارنة,أفضل خيار لحماية السيارات',
      'blog.post.10.seoDescription':
        'قارن بين الشمع التقليدي والنانو سيراميك. اكتشف لماذا النانو سيراميك هو الخيار الأفضل.',

      'blog.post.11.title': 'كيفية الحفاظ على طبقة النانو سيراميك لأطول فترة',
      'blog.post.11.excerpt':
        'تعلم أفضل الطرق للحفاظ على طبقة النانو سيراميك لأطول فترة ممكنة.',
      'blog.post.11.category': 'العناية بالسيارة',
      'blog.post.11.readTime': '5 دقائق',
      'blog.post.11.tags': 'حماية الطبقة,نانو سيراميك,صيانة,عمر طويل',
      'blog.post.11.seoKeywords':
        'حماية طبقة النانو سيراميك,صيانة,عمر طويل,نصائح',
      'blog.post.11.seoDescription':
        'تعلم أفضل الطرق للحفاظ على طبقة النانو سيراميك لأطول فترة ممكنة.',

      'blog.post.12.title': 'أحدث تقنيات حماية السيارات في 2024',
      'blog.post.12.excerpt':
        'اكتشف أحدث تقنيات حماية السيارات التي ستظهر في عام 2024 مع رويال نانو سيراميك.',
      'blog.post.12.category': 'تكنولوجيا النانو',
      'blog.post.12.readTime': '7 دقائق',
      'blog.post.12.tags':
        'تقنيات 2024,حماية متقدمة,تكنولوجيا جديدة,رويال نانو',
      'blog.post.12.seoKeywords':
        'تقنيات 2024,حماية السيارات,تكنولوجيا جديدة,رويال نانو سيراميك',
      'blog.post.12.seoDescription':
        'اكتشف أحدث تقنيات حماية السيارات التي ستظهر في عام 2024 مع رويال نانو سيراميك.',

      // Gallery Page - Gallery Images Data
      'gallery.image.1.alt': 'طلاء السيراميك المتقدم',
      'gallery.image.1.title': 'طلاء السيراميك المتقدم',
      'gallery.image.1.description':
        'حماية شاملة للطلاء من الخدوش والعوامل الجوية',
      'gallery.image.1.protectionInfo':
        'يوفر طلاء السيراميك حماية لمدة 5 سنوات ضد الخدوش، الأشعة فوق البنفسجية، والأمطار الحمضية. يعطي بريقاً دائمماً ويقلل من الحاجة للغسيل المتكرر.',
      'gallery.image.1.protectionType': 'حماية متقدمة',
      'gallery.image.1.features':
        'حماية 5 سنوات,مقاومة الخدوش,حماية من الأشعة فوق البنفسجية,مقاومة الأمطار الحمضية',

      'gallery.image.2.alt': 'حماية من الخدوش',
      'gallery.image.2.title': 'حماية من الخدوش',
      'gallery.image.2.description': 'طبقة حماية شفافة تمنع الخدوش والاحتكاك',
      'gallery.image.2.protectionInfo':
        'طبقة الحماية الشفافة تحمي طلاء السيارة من الخدوش الصغيرة، الاحتكاك، والمواد الكيميائية. يمكن إزالتها بسهولة عند الحاجة دون التأثير على الطلاء الأصلي.',
      'gallery.image.2.protectionType': 'حماية سطحية',
      'gallery.image.2.features':
        'طبقة شفافة,حماية من الخدوش,مقاومة الاحتكاك,قابلة للإزالة',

      'gallery.image.3.alt': 'حماية من الأشعة فوق البنفسجية',
      'gallery.image.3.title': 'حماية من الأشعة فوق البنفسجية',
      'gallery.image.3.description':
        'حماية طويلة المدى من تأثيرات الشمس الضارة',
      'gallery.image.3.protectionInfo':
        'الحماية من الأشعة فوق البنفسجية تمنع تلاشي لون السيارة وتشقق الطلاء. تحافظ على المظهر الجديد للسيارة لسنوات عديدة حتى في المناخات الحارة.',
      'gallery.image.3.protectionType': 'حماية ضوئية',
      'gallery.image.3.features':
        'حماية من الأشعة فوق البنفسجية,منع تلاشي اللون,حماية من التشقق,حماية طويلة المدى',

      'gallery.image.4.alt': 'حماية من الأمطار الحمضية',
      'gallery.image.4.title': 'حماية من الأمطار الحمضية',
      'gallery.image.4.description': 'درع واقي ضد التآكل والتلف الكيميائي',
      'gallery.image.4.protectionInfo':
        'الأمطار الحمضية يمكن أن تسبب تآكل الطلاء وتلف المعادن. طبقة الحماية الكيميائية تمنع هذا التلف وتحمي السيارة في جميع الظروف الجوية.',
      'gallery.image.4.protectionType': 'حماية كيميائية',
      'gallery.image.4.features':
        'حماية من الأمطار الحمضية,منع التآكل,حماية المعادن,مقاومة كيميائية',

      'gallery.image.5.alt': 'حماية من الأوساخ',
      'gallery.image.5.title': 'حماية من الأوساخ',
      'gallery.image.5.description': 'سطح مقاوم للأوساخ يسهل التنظيف',
      'gallery.image.5.protectionInfo':
        'السطح المقاوم للأوساخ يجعل السيارة أقل عرضة للاتساخ. عند الغسيل، تزول الأوساخ بسهولة مما يقلل من خطر خدش الطلاء أثناء التنظيف.',
      'gallery.image.5.protectionType': 'حماية بيئية',
      'gallery.image.5.features':
        'مقاومة الأوساخ,سهولة التنظيف,منع الخدوش,حماية بيئية',

      'gallery.image.6.alt': 'حماية من الحرارة',
      'gallery.image.6.title': 'حماية من الحرارة',
      'gallery.image.6.description': 'مقاومة للحرارة وحماية من التلف الحراري',
      'gallery.image.6.protectionInfo':
        'الحماية الحرارية تمنع تشقق الطلاء وتلف المواد البلاستيكية عند التعرض لدرجات حرارة عالية. مهمة خاصة في المناخات الحارة والمناطق المشمسة.',
      'gallery.image.6.protectionType': 'حماية حرارية',
      'gallery.image.6.features':
        'مقاومة الحرارة,منع التشقق,حماية البلاستيك,مناسبة للمناخات الحارة',

      'gallery.image.7.alt': 'حماية من المواد الكيميائية',
      'gallery.image.7.title': 'حماية من المواد الكيميائية',
      'gallery.image.7.description': 'مقاومة للزيوت والمواد الكيميائية الضارة',
      'gallery.image.7.protectionInfo':
        'المواد الكيميائية مثل الزيوت، الوقود، والمنظفات يمكن أن تلحق الضرر بالطلاء. طبقة الحماية الكيميائية تمنع هذا التلف وتحمي السيارة.',
      'gallery.image.7.protectionType': 'حماية متقدمة',
      'gallery.image.7.features':
        'مقاومة الزيوت,مقاومة الوقود,مقاومة المنظفات,حماية كيميائية',

      'gallery.image.8.alt': 'حماية شاملة',
      'gallery.image.8.title': 'حماية شاملة',
      'gallery.image.8.description': 'نظام حماية متكامل لجميع أجزاء السيارة',
      'gallery.image.8.protectionInfo':
        'النظام المتكامل يوفر حماية شاملة للطلاء، الزجاج، المعادن، والبلاستيك. يضمن مظهراً جديداً للسيارة لسنوات عديدة مع تقليل تكاليف الصيانة.',
      'gallery.image.8.protectionType': 'نظام متكامل',
      'gallery.image.8.features':
        'حماية شاملة,حماية الطلاء,حماية الزجاج,حماية المعادن,حماية البلاستيك',

      'gallery.image.9.alt': 'تلميع احترافي',
      'gallery.image.9.title': 'تلميع احترافي',
      'gallery.image.9.description': 'تلميع احترافي يعيد بريق السيارة',
      'gallery.image.9.protectionInfo':
        'التلميع الاحترافي يعيد بريق السيارة ويجعلها تبدو وكأنها جديدة. يستخدم تقنيات متقدمة ومواد عالية الجودة لضمان نتائج ممتازة.',
      'gallery.image.9.protectionType': 'تجميل متقدم',
      'gallery.image.9.features':
        'تلميع احترافي,بريق دائم,تقنيات متقدمة,مواد عالية الجودة',

      'gallery.image.10.alt': 'حماية المقصورة',
      'gallery.image.10.title': 'حماية المقصورة',
      'gallery.image.10.description': 'حماية شاملة للمقاعد والأسطح الداخلية',
      'gallery.image.10.protectionInfo':
        'حماية المقصورة الداخلية تشمل المقاعد، لوحة التحكم، والأسطح الأخرى. تمنع التلف والبقع وتحافظ على المظهر الجديد.',
      'gallery.image.10.protectionType': 'حماية داخلية',
      'gallery.image.10.features':
        'حماية المقاعد,حماية لوحة التحكم,منع البقع,حماية الأسطح الداخلية',

      'gallery.image.11.alt': 'حماية المقاعد',
      'gallery.image.11.title': 'حماية المقاعد',
      'gallery.image.11.description': 'حماية دائمة للمقاعد الجلدية',
      'gallery.image.11.protectionInfo':
        'حماية المقاعد الجلدية تمنع التلف والتشقق الناتج عن الاستخدام اليومي. تحافظ على نعومة الجلد وتطيل عمر المقاعد.',
      'gallery.image.11.protectionType': 'حماية جلدية',
      'gallery.image.11.features':
        'حماية الجلد,منع التشقق,حماية من التلف,إطالة العمر',

      'gallery.image.12.alt': 'حماية الأسطح',
      'gallery.image.12.title': 'حماية الأسطح',
      'gallery.image.12.description': 'حماية من التلف والبقع لجميع الأسطح',
      'gallery.image.12.protectionInfo':
        'حماية شاملة لجميع أسطح السيارة الداخلية والخارجية. تمنع التلف والبقع وتحافظ على المظهر الجديد لسنوات عديدة.',
      'gallery.image.12.protectionType': 'حماية شاملة',
      'gallery.image.12.features':
        'حماية جميع الأسطح,منع التلف,منع البقع,حماية طويلة المدى',
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
      'header.admin-messages': 'Admin Messages',

      // Home Page - Hero Section
      'home.hero.title': 'Royal Nano Ceramic',
      'home.hero.subtitle': 'Best Car Protection in Egypt',
      'home.hero.description':
        'We specialize in providing advanced protection services for cars, planes, boats, and motorcycles using the latest nano ceramic technology',
      'home.hero.cta_button': 'Protect Your Car Now',
      'home.hero.learn_more': 'Learn More',

      // Home Page - Services Section
      'home.services.title': 'Our Services',
      'home.services.subtitle':
        'We offer a comprehensive range of high-quality car protection services',

      // Service Cards
      'service.ceramic_coating.title': 'Ceramic Coating',
      'service.ceramic_coating.description':
        'Long-term paint protection using advanced nano technology',
      'service.paint_protection.title': 'Paint Protection',
      'service.paint_protection.description':
        'Comprehensive paint protection from scratches and weather',
      'service.interior_protection.title': 'Interior Protection',
      'service.interior_protection.description':
        'Protection for seats and interior surfaces from damage',
      'service.detailing.title': 'Complete Detailing',
      'service.detailing.description':
        'Complete cleaning and professional polishing for all car parts',

      // Home Page - Features Section
      'home.features.title': 'Why Choose Us',
      'home.features.subtitle':
        'Features that make us the ideal choice for protecting your car',

      // Feature Cards
      'feature.experience.title': 'High Experience',
      'feature.experience.description':
        'Over 10 years of experience in car protection',
      'feature.quality.title': 'High Quality',
      'feature.quality.description':
        'We use the best global products and latest technologies',
      'feature.warranty.title': 'Full Warranty',
      'feature.warranty.description':
        'Full warranty on all our services with continuous technical support',
      'feature.team.title': 'Professional Team',
      'feature.team.description':
        'Team of experts trained on the latest global technologies',

      // Home Page - CTA Section
      'home.cta.title': 'Ready to Protect Your Car?',
      'home.cta.description': 'Contact us now and get a free consultation',
      'home.cta.button': 'Contact Us',

      // Home Page - Before & After Section
      'home.beforeAfter.title': 'Before & After',
      'home.beforeAfter.subtitle':
        'See the amazing transformations of our services',

      // Home Page - Social Media Section
      'home.social.title': 'Follow Us on Social Media',
      'home.social.subtitle':
        'Get the latest news and special offers through our social pages',

      // Social Media Cards
      'social.whatsapp.title': 'WhatsApp',
      'social.whatsapp.description':
        'Contact us directly for instant consultation',
      'social.instagram.title': 'Instagram',
      'social.instagram.description':
        'See photos of our work and latest updates',
      'social.facebook.title': 'Facebook',
      'social.facebook.description':
        'Join our community and get special offers',
      'social.youtube.title': 'YouTube',
      'social.youtube.description':
        'Watch educational videos and car care tips',

      // Footer
      'footer.description': 'Royal Nano Ceramic - Best Car Protection in Egypt',
      'footer.quick_links': 'Quick Links',
      'footer.services_list': 'Our Services',
      'footer.contact_info': 'Contact Info',
      'footer.follow_us': 'Follow Us',
      'footer.rights': 'All Rights Reserved',
      'footer.home': 'Home',
      'footer.about': 'About',
      'footer.services': 'Services',
      'footer.contact': 'Contact',
      'footer.our_services': 'Our Services',
      'footer.ceramic_coating': 'Ceramic Coating',
      'footer.paint_protection': 'Paint Protection',
      'footer.interior_protection': 'Interior Protection',
      'footer.detailing': 'Complete Detailing',
      'footer.our_branches': 'Our Branches',
      'footer.branch_6october': '6 October',
      'footer.branch_nasr_city': 'Nasr City',
      'footer.branch_mohandessin': 'Mohandessin',
      'footer.branch_sheikh_zayed': 'Sheikh Zayed',
      'footer.branch_alexandria': 'Alexandria',
      'footer.click_all_branches': 'Click to see all branches',
      'footer.click_more': 'Show More',
      'footer.click_less': 'Show Less',
      'footer.contact_whatsapp': 'Contact us via WhatsApp',
      'footer.address': 'October, Giza',
      'footer.copyright': '© 2025 Royal Nano Ceramic. All rights reserved.',

      // Common
      'common.loading': 'Loading...',
      'common.error': 'An error occurred',
      'common.success': 'Success',
      'common.read_more': 'Read More',
      'common.book_now': 'Book Now',
      'common.get_quote': 'Get Quote',
      'common.learn_more': 'Learn More',
      'common.contact_us': 'Contact Us',
      'common.view_more': 'View More',
      'common.back_to_top': 'Back to Top',
      'common.optional': 'Optional',
      'common.reset': 'Reset',
      'common.form_status': 'Form Status',
      'common.field_required': 'This field is required',
      'common.min_length_error': 'The length must be at least {0} characters',
      'common.max_length_error': 'The length must not exceed {0} characters',
      'common.name_format_error':
        'The name must contain only Arabic or English letters',
      'common.phone_format_error':
        'Invalid phone format - please use an Egyptian phone number',
      'common.invalid_format': 'Invalid format',
      'common.server_connection_error':
        'Unable to connect to server - please check your internet connection',
      'common.invalid_form_data': 'Invalid form data',
      'common.server_error': 'Server error - please try again later',
      'common.general_error': 'An error occurred while submitting the form',

      // Hero Slider
      'slider.advanced_protection': 'Advanced Protection with Nano Technology',
      'slider.experience_years': 'Over 10 Years of Experience',
      'slider.latest_technology':
        'We use the latest global technologies to protect your car from weather factors and scratches',
      'slider.contact_us': 'Contact Us',
      'slider.learn_more_services': 'Learn More About Our Services',
      'slider.royal_nano_title': 'Royal Nano Ceramic',
      'slider.experts_description':
        'Experts in car protection using the latest nano and ceramic technologies',

      // About Us Page
      'about.hero.title': 'About Us',
      'about.hero.subtitle': 'Royal Nano Ceramic - Car Protection Experts',
      'about.why_choose.title': 'Why Choose Royal Nano',
      'about.why_choose.subtitle':
        'Discover the features that make us the ideal choice for protecting your car',
      'about.why_choose.main_title': 'Why Royal Nano',
      'about.why_choose.speed.title': 'Speed',
      'about.why_choose.speed.description':
        'Fast and efficient solutions for your car needs. We provide cutting-edge technology that ensures speed and reliability, helping your business stay ahead in a competitive market.',
      'about.why_choose.leadership.title': 'Leadership',
      'about.why_choose.leadership.description':
        'Innovative leadership that inspires progress and growth. Our forward-thinking leadership drives innovation, fostering a culture of continuous improvement and development.',
      'about.why_choose.support.title': 'Support',
      'about.why_choose.support.description':
        '24/7 customer support to assist you whenever needed. Our dedicated team is always available, providing expert guidance and support to ensure your satisfaction around the clock.',
      'about.why_choose.sustainability.title': 'Sustainability',
      'about.why_choose.sustainability.description':
        'Committed to sustainability and eco-friendly practices. We prioritize eco-conscious practices, ensuring our operations are sustainable and contribute to a greener future.',
      'about.story.title': 'Our Story',
      'about.story.description':
        'We are a company specialized in car protection using the latest nano and ceramic technologies.',
      'about.history.title': 'Our History in the Egyptian Market',
      'about.timeline.2010.title': 'The Beginning of the Journey',
      'about.timeline.2010.description':
        "Royal Nano Ceramic's journey began when it was founded by Engineer Hamada El-Adly, a graduate of Cairo University's Faculty of Engineering, who was passionate about modern car protection technologies. The company started as a small workshop in Maadi, Cairo.",
      'about.timeline.2012.title': 'Nano Technology Revolution',
      'about.timeline.2012.description':
        'The founder realized that the Egyptian market needed advanced technologies to protect cars from harsh weather conditions. He began importing the first nano ceramic products from America, marking the beginning of a revolution in car protection in Egypt.',
      'about.timeline.2015.title': 'Regional Expansion',
      'about.timeline.2015.description':
        'The company expanded to include branches in Alexandria and Ismailia, becoming a leader in ceramic car coating. It overcame economic challenges by focusing on quality and excellent service.',
      'about.timeline.2018.title': 'Strategic Partnership',
      'about.timeline.2018.description':
        'Royal Nano Ceramic achieved a major milestone when it became the exclusive partner of American company "Royal shield" in Egypt and North Africa. This collaboration allowed access to the latest global technologies.',
      'about.timeline.2020.title': 'Research and Development Center',
      'about.timeline.2020.description':
        "2020 witnessed a major transformation in the company's strategy, as it began developing local products using shared Egyptian and German expertise. A research and development center was established in 6th October City.",
      'about.timeline.2024.title': 'National Leadership',
      'about.timeline.2024.description':
        'Today, Royal Nano Ceramic owns a network of 16 branches spread throughout Egypt. The company has become a reference in car protection, serving more than 250,000 customers annually.',
      'about.values.title': 'Company Values',
      'about.values.quality.title': 'Authentic Egyptian Quality',
      'about.values.quality.description':
        'We commit to the highest quality standards while preserving Egyptian identity',
      'about.values.precision.title': 'American Precision',
      'about.values.precision.description':
        'We apply American standards of precision and efficiency in all our services',
      'about.values.innovation.title': 'Continuous Innovation',
      'about.values.innovation.description':
        'We develop new technologies tailored to Egyptian climate conditions',
      'about.vision.title': 'Our Vision',
      'about.vision.description':
        "To be our customers' first choice in car protection and beautification.",
      'about.mission.title': 'Our Mission',
      'about.mission.description':
        'To provide high-quality services using the best global products.',

      // Services Page
      'services.hero.title': 'Our Advanced Services',
      'services.hero.subtitle':
        'Advanced Nano and Ceramic Technologies for Car Protection',
      'services.hero.stats.services': 'Advanced Services',
      'services.hero.stats.experience': 'Years Experience',
      'services.hero.stats.quality': 'Quality Guarantee',
      'services.section.title': 'Advanced Protection Services',
      'services.section.subtitle':
        'Discover our comprehensive range of services to protect your car with the latest nano and ceramic technologies',
      'services.diamond_hybrid.title': 'Diamond Hybrid Plus',
      'services.diamond_hybrid.description':
        'Advanced hybrid technology combining diamond strength and ceramic hardness. Provides exceptional protection against scratches and corrosion with unparalleled shine.',
      'services.diamond_hybrid.features.protection': '5 Years Protection',
      'services.diamond_hybrid.features.scratch': 'Scratch Resistance',
      'services.diamond_hybrid.features.shine': 'Exceptional Shine',
      'services.diamond_hybrid.details.protection_level':
        'Protection Level: 9H',
      'services.diamond_hybrid.details.duration':
        'Protection Duration: 5 Years',
      'services.diamond_hybrid.details.warranty': 'Warranty: Comprehensive',
      'services.paint_protection.title': 'Paint Protection',
      'services.paint_protection.description':
        'Comprehensive paint protection using advanced protective films. Protects from scratches, stones, and environmental damage.',
      'services.paint_protection.features.protection': '5 Years Protection',
      'services.paint_protection.features.films': 'Advanced Films',
      'services.paint_protection.features.transparency': 'High Transparency',
      'services.paint_protection.details.protection_level':
        'Protection Level: 8H',
      'services.paint_protection.details.duration':
        'Protection Duration: 5 Years',
      'services.paint_protection.details.warranty': 'Warranty: Comprehensive',
      'services.paint_protection_process.title': 'Paint Protection Process',
      'services.paint_protection_process.description':
        'High-professional paint protection application process. We use the latest technologies and best materials to ensure optimal protection.',
      'services.paint_protection_process.features.protection':
        '5 Years Protection',
      'services.paint_protection_process.features.technology':
        'Advanced Technology',
      'services.paint_protection_process.features.professional':
        'High Professionalism',
      'services.paint_protection_process.details.protection_level':
        'Protection Level: 8H',
      'services.paint_protection_process.details.duration':
        'Protection Duration: 5 Years',
      'services.paint_protection_process.details.warranty':
        'Warranty: Comprehensive',
      'services.shield_ultracool.title': 'Shield UltraCool',
      'services.shield_ultracool.description':
        'Advanced cooling technology that protects your car from high heat while significantly reducing interior cabin temperature.',
      'services.shield_ultracool.features.protection': '4 Years Protection',
      'services.shield_ultracool.features.cooling': 'Advanced Cooling',
      'services.shield_ultracool.features.energy': 'Energy Saving',
      'services.shield_ultracool.details.protection_level':
        'Protection Level: 7H',
      'services.shield_ultracool.details.duration':
        'Protection Duration: 4 Years',
      'services.shield_ultracool.details.warranty': 'Warranty: Comprehensive',
      'services.technology.title': 'Advanced Nano Technologies',
      'services.technology.subtitle':
        'Discover how nano and ceramic technologies work to protect your car',
      'services.technology.nano.title': 'Nano Technology',
      'services.technology.nano.description':
        'Uses ultra-fine nano particles that penetrate the paint surface to form a strong and durable protective layer. This technology ensures comprehensive coverage and long-term protection.',
      'services.technology.ceramic.title': 'Advanced Ceramic',
      'services.technology.ceramic.description':
        'Advanced ceramic coating that provides high hardness and exceptional resistance to scratches and corrosion. Maintains the original paint shine while adding a transparent protective layer.',
      'services.technology.graphene.title': 'Hybrid Graphene',
      'services.technology.graphene.description':
        'Graphene technology combines exceptional strength with high flexibility. Provides advanced protection with heat-conducting properties and high resistance to damage.',
      'services.technology.multilayer.title': 'Multi-Layer Protection',
      'services.technology.multilayer.description':
        'Advanced protection system consisting of several specialized layers. Each layer provides specific protection ensuring comprehensive coverage against all types of damage.',
      'services.process.title': 'How to Apply Protection',
      'services.process.subtitle':
        'Professional steps to ensure the best results',
      'services.process.step1.title': 'Comprehensive Cleaning',
      'services.process.step1.description':
        'Comprehensive car cleaning and removal of all dirt and oils',
      'services.process.step2.title': 'Impurity Removal',
      'services.process.step2.description':
        'Removal of impurities and old paint to ensure perfect adhesion',
      'services.process.step3.title': 'Protection Application',
      'services.process.step3.description':
        'Application of the protection layer using advanced technologies',
      'services.process.step4.title': 'Final Inspection',
      'services.process.step4.description':
        'Comprehensive inspection to ensure application quality and final results',
      'services.cta.title': 'Ready to Protect Your Car?',
      'services.cta.description':
        'Get the best advanced protection services from Royal Nano Ceramic experts',
      'services.cta.primary_button': 'Book Your Appointment Now',
      'services.cta.secondary_button': 'View Our Work',
      'services.premium_badge': 'Premium',

      // Blog Page
      'blog.hero.title': 'Royal Nano Ceramic Blog',
      'blog.hero.subtitle':
        'Latest news and specialized tips in car protection with nano technology',
      'blog.hero.stats.articles': 'Specialized Articles',
      'blog.hero.stats.trusted': 'Trusted Information',
      'blog.hero.stats.support': 'Technical Support',
      'blog.categories.all': 'All Articles',
      'blog.categories.nano_technology': 'Nano Technology',
      'blog.categories.car_care': 'Car Care',
      'blog.categories.paint_protection': 'Paint Protection',
      'blog.categories.tips': 'Tips & Guidelines',
      'blog.featured.badge': 'Featured Article',
      'blog.posts.title': 'Latest Articles',
      'blog.search.placeholder': 'Search in articles...',
      'blog.load_more': 'Show More Articles',
      'blog.newsletter.title': 'Subscribe to Our Newsletter',
      'blog.newsletter.description':
        'Get the latest articles and tips about car protection directly in your email',
      'blog.newsletter.placeholder': 'Enter your email',
      'blog.newsletter.subscribe': 'Subscribe',
      'blog.quick_view': 'Quick View',
      'blog.read_more': 'Read More',
      'blog.read_full': 'Read Full Article',
      'blog.subscribe_success': 'Successfully subscribed to the newsletter!',

      // Gallery Page
      'gallery.hero.title': 'Car Protection Gallery',
      'gallery.hero.subtitle':
        'Discover advanced protection technologies for your car',
      'gallery.section.title': 'Portfolio Gallery',
      'gallery.section.subtitle':
        'See how we protect your car with innovative and advanced methods',
      'gallery.lightbox.protection_details': 'Protection Details',
      'gallery.lightbox.features': 'Features',
      'gallery.lightbox.close': 'Close',
      'gallery.lightbox.previous': 'Previous',
      'gallery.lightbox.next': 'Next',

      // Join Us Page
      'join.hero.title': 'Join Our Team',
      'join.hero.subtitle': 'Be part of the future of car protection in Egypt',
      'join.hero.stats.branches': 'Branches',
      'join.hero.stats.employees': 'Employees',
      'join.hero.stats.experience': 'Years Experience',
      'join.application.title': 'Submit Job Application',
      'join.application.subtitle':
        'Fill out the form below and we will contact you as soon as possible',
      'join.form.full_name': 'Full Name *',
      'join.form.full_name_placeholder': 'Enter your full name',
      'join.form.phone': 'Phone Number *',
      'join.form.phone_placeholder': 'Enter your phone number',
      'join.form.email': 'Email',
      'join.form.email_placeholder': 'Enter your email',
      'join.form.position': 'Desired Position *',
      'join.form.position_placeholder': 'Choose position',
      'join.form.experience': 'Previous Experience',
      'join.form.experience_placeholder':
        'Mention your previous experience in the field (optional)',
      'join.form.cv': 'CV Attachment *',
      'join.form.cv_placeholder': 'Choose CV file',
      'join.form.cv_types': 'PDF, DOC, DOCX',
      'join.form.message': 'Additional Message',
      'join.form.message_placeholder':
        'Add any additional information you want to share with us',
      'join.form.submit': 'Submit Job Application',
      'join.form.reset': 'Reset',
      'join.why.title': 'Why Join Us?',
      'join.why.subtitle':
        'Discover the benefits that make Royal Nano Ceramic the ideal workplace',
      'join.why.career_growth.title': 'Career Growth Opportunities',
      'join.why.career_growth.description':
        'We provide a clear path for career development with continuous promotion opportunities',
      'join.why.training.title': 'Continuous Training',
      'join.why.training.description':
        'Advanced training programs in the latest nano and ceramic technologies',
      'join.why.benefits.title': 'Competitive Benefits',
      'join.why.benefits.description':
        'Attractive salaries and additional benefits that match your experience and performance',
      'join.why.environment.title': 'Supportive Work Environment',
      'join.why.environment.description':
        'Collaborative team and positive work environment that encourages creativity',
      'join.why.network.title': 'Wide Branch Network',
      'join.why.network.description':
        '16 branches throughout Egypt with the possibility of transfer between branches',
      'join.why.technology.title': 'Advanced Technologies',
      'join.why.technology.description':
        'Working with the latest global technologies in car protection',
      'join.cta.title': 'Ready to Start Your Journey With Us?',
      'join.cta.description':
        'Join the Royal Nano Ceramic team and be part of the future of the automotive industry',
      'join.cta.contact': 'Contact Us',
      'join.cta.learn_more': 'Learn More About Us',
      'join.jobs.tele_sales': 'Tele Sales',
      'join.jobs.branch_manager': 'Branch Manager',
      'join.jobs.nano_technician': 'Nano Technician',
      'join.jobs.sales_manager': 'Sales Manager',
      'join.jobs.secretary': 'Secretary',
      'join.jobs.media_buyer': 'Media Buyer',
      'join.jobs.social_media_moderator': 'Social Media Moderator',
      'join.file_error':
        'Please choose a file in PDF, DOC, or DOCX format only',
      'join.success_message':
        'Job application submitted successfully! We will contact you soon.',

      // Contact Page
      'contact.hero.title': 'Contact Us',
      'contact.hero.subtitle': 'We are here to help you protect your car',
      'contact.form.title': 'Send Us a Message',
      'contact.form.full_name': 'Full Name',
      'contact.form.full_name_placeholder': 'Enter your name',
      'contact.form.phone': 'Phone Number',
      'contact.form.phone_placeholder': 'Enter phone number',
      'contact.form.car_type': 'Car Type',
      'contact.form.car_type_placeholder': 'Enter car type',
      'contact.form.car_model': 'Car Model',
      'contact.form.car_model_placeholder': 'Enter car model',
      'contact.form.notes': 'Additional Notes',
      'contact.form.notes_placeholder': 'Add any notes or special requirements',
      'contact.form.submit': 'Send Request',
      'contact.form.success_message':
        'Your message has been sent successfully! We will contact you soon.',
      'contact.location.title': 'Our Location',
      'contact.location.company': 'Royal Nano Ceramic',
      'contact.location.address1': 'Service Axis, First District 6 October',
      'contact.location.address2':
        'Second District 6 October, Giza Governorate 12563',
      'contact.location.phone': '+20 123 456 7890',
      'contact.location.email': 'info@royalnanoceramic.com',
      'contact.location.hours': 'All Week: 11:00 AM - 11:00 PM',
      'contact.map.title': 'Royal Nano Ceramic Location',
      'contact.map.open_google': 'Open in Google Maps',
      'contact.social.title': 'Contact Us via Social Media',
      'contact.social.subtitle': 'Choose your preferred way to contact us',
      'contact.social.whatsapp.title': 'WhatsApp',
      'contact.social.whatsapp.description':
        'Instant communication with our team',
      'contact.social.instagram.title': 'Instagram',
      'contact.social.instagram.description':
        'Follow our work and latest updates',
      'contact.social.facebook.title': 'Facebook',
      'contact.social.facebook.description': 'Join our official page',
      'contact.social.email.title': 'Email',
      'contact.social.email.description': 'Send us a message via email',
      'contact.car_types.sedan': 'Sedan',
      'contact.car_types.suv': 'SUV',
      'contact.car_types.hatchback': 'Hatchback',
      'contact.car_types.coupe': 'Coupe',
      'contact.car_types.van': 'Van',
      'contact.car_types.truck': 'Truck',
      'contact.car_types.motorcycle': 'Motorcycle',
      'contact.car_types.other': 'Other',

      // Blog Page - Blog Posts Data
      'blog.post.1.title':
        'Nano Ceramic Technology: Revolution in Car Protection',
      'blog.post.1.excerpt':
        'Discover how nano ceramic technology has revolutionized the world of car protection, and learn about the latest technologies used at Royal Nano Ceramic.',
      'blog.post.1.category': 'Nano Technology',
      'blog.post.1.readTime': '8 minutes',
      'blog.post.1.tags':
        'Nano Ceramic,Car Protection,Advanced Technology,Royal Nano',
      'blog.post.1.seoKeywords':
        'Nano Ceramic,Car Protection,Nano Technology,Royal Nano Ceramic,Ceramic Coating',
      'blog.post.1.seoDescription':
        'Discover advanced nano ceramic technology in car protection with Royal Nano Ceramic. Latest technologies to protect your car paint.',

      'blog.post.2.title': 'How to Protect Your Car from Harmful Sun Rays',
      'blog.post.2.excerpt':
        'Sun rays can cause severe damage to your car paint. Learn the best ways to protect your car from ultraviolet rays.',
      'blog.post.2.category': 'Paint Protection',
      'blog.post.2.readTime': '6 minutes',
      'blog.post.2.tags':
        'Sun Protection,Car Paint,Ultraviolet Rays,Car Maintenance',
      'blog.post.2.seoKeywords':
        'Car Sun Protection,Ultraviolet Rays,Car Paint,Car Maintenance',
      'blog.post.2.seoDescription':
        'Learn how to protect your car from harmful sun rays and the best ways to protect your car paint from damage.',

      'blog.post.3.title':
        'Benefits of Ceramic Coating: Why Choose Royal Nano Ceramic',
      'blog.post.3.excerpt':
        'Discover the many benefits of ceramic coating and how it can maintain your car appearance for many years.',
      'blog.post.3.category': 'Nano Technology',
      'blog.post.3.readTime': '7 minutes',
      'blog.post.3.tags':
        'Ceramic Coating,Benefits,Long-term Protection,Royal Nano',
      'blog.post.3.seoKeywords':
        'Ceramic Coating,Ceramic Coating Benefits,Car Protection,Royal Nano Ceramic',
      'blog.post.3.seoDescription':
        'Discover the many benefits of ceramic coating and how it can maintain your car appearance for many years.',

      'blog.post.4.title':
        'Best Ways to Clean Your Car After Nano Ceramic Application',
      'blog.post.4.excerpt':
        'After applying nano ceramic, your car needs special cleaning methods. Learn the correct ways to clean your car.',
      'blog.post.4.category': 'Car Care',
      'blog.post.4.readTime': '5 minutes',
      'blog.post.4.tags': 'Car Cleaning,Nano Ceramic,Maintenance,Tips',
      'blog.post.4.seoKeywords':
        'Car Cleaning,Nano Ceramic,Car Maintenance,Cleaning Tips',
      'blog.post.4.seoDescription':
        'Learn the best ways to clean your car after nano ceramic application and how to maintain the protection layer.',

      'blog.post.5.title':
        'Comparison: Traditional Nano Ceramic vs Advanced Technology',
      'blog.post.5.excerpt':
        'Compare traditional nano ceramic technologies with advanced technology used at Royal Nano Ceramic.',
      'blog.post.5.category': 'Nano Technology',
      'blog.post.5.readTime': '9 minutes',
      'blog.post.5.tags':
        'Technology Comparison,Nano Ceramic,Advanced Technology,Royal Nano',
      'blog.post.5.seoKeywords':
        'Nano Ceramic Comparison,Car Protection Technologies,Royal Nano Ceramic,Advanced Technology',
      'blog.post.5.seoDescription':
        'Compare traditional nano ceramic technologies with advanced technology used at Royal Nano Ceramic.',

      'blog.post.6.title': 'How to Maintain Car Shine with Nano Ceramic',
      'blog.post.6.excerpt':
        'Learn how to maintain your car shine for the longest possible time with advanced nano ceramic technologies.',
      'blog.post.6.category': 'Car Care',
      'blog.post.6.readTime': '6 minutes',
      'blog.post.6.tags': 'Car Shine,Nano Ceramic,Maintenance,New Look',
      'blog.post.6.seoKeywords':
        'Car Shine,Nano Ceramic,Car Maintenance,New Look',
      'blog.post.6.seoDescription':
        'Learn how to maintain your car shine for the longest possible time with advanced nano ceramic technologies.',

      'blog.post.7.title': 'Common Mistakes in Car Care After Nano Ceramic',
      'blog.post.7.excerpt':
        'Avoid common mistakes that many people make in caring for their cars after nano ceramic application.',
      'blog.post.7.category': 'Tips & Guidelines',
      'blog.post.7.readTime': '7 minutes',
      'blog.post.7.tags': 'Common Mistakes,Nano Ceramic,Tips,Avoid Mistakes',
      'blog.post.7.seoKeywords':
        'Car Care Mistakes,Nano Ceramic,Maintenance Tips,Avoid Mistakes',
      'blog.post.7.seoDescription':
        'Avoid common mistakes that many people make in caring for their cars after nano ceramic application.',

      'blog.post.8.title': 'Graphene Technology: The Future in Car Protection',
      'blog.post.8.excerpt':
        'Discover advanced graphene technology and how it will change the future of car protection with Royal Nano Ceramic.',
      'blog.post.8.category': 'Nano Technology',
      'blog.post.8.readTime': '8 minutes',
      'blog.post.8.tags':
        'Graphene,Future Technology,Advanced Protection,Royal Nano',
      'blog.post.8.seoKeywords':
        'Graphene Technology,Car Protection,Royal Nano Ceramic,Future Technology',
      'blog.post.8.seoDescription':
        'Discover advanced graphene technology and how it will change the future of car protection with Royal Nano Ceramic.',

      'blog.post.9.title':
        'How to Choose the Best Nano Ceramic Service for Your Car',
      'blog.post.9.excerpt':
        'Comprehensive guide to choosing the best nano ceramic service for your car. Learn what to look for in the company.',
      'blog.post.9.category': 'Tips & Guidelines',
      'blog.post.9.readTime': '6 minutes',
      'blog.post.9.tags':
        'Service Selection,Nano Ceramic,Tips,Comprehensive Guide',
      'blog.post.9.seoKeywords':
        'Choose Nano Ceramic Service,Best Nano Ceramic Company,Selection Tips,Comprehensive Guide',
      'blog.post.9.seoDescription':
        'Comprehensive guide to choosing the best nano ceramic service for your car. Learn what to look for in the company.',

      'blog.post.10.title':
        'Difference Between Traditional Wax and Nano Ceramic',
      'blog.post.10.excerpt':
        'Compare traditional wax with nano ceramic. Discover why nano ceramic is the best choice.',
      'blog.post.10.category': 'Nano Technology',
      'blog.post.10.readTime': '6 minutes',
      'blog.post.10.tags':
        'Traditional Wax,Nano Ceramic,Comparison,Best Choice',
      'blog.post.10.seoKeywords':
        'Traditional Wax,Nano Ceramic,Comparison,Best Choice for Car Protection',
      'blog.post.10.seoDescription':
        'Compare traditional wax with nano ceramic. Discover why nano ceramic is the best choice.',

      'blog.post.11.title':
        'How to Maintain Nano Ceramic Layer for Longest Time',
      'blog.post.11.excerpt':
        'Learn the best ways to maintain the nano ceramic layer for the longest possible time.',
      'blog.post.11.category': 'Car Care',
      'blog.post.11.readTime': '5 minutes',
      'blog.post.11.tags':
        'Layer Protection,Nano Ceramic,Maintenance,Long Life',
      'blog.post.11.seoKeywords':
        'Nano Ceramic Layer Protection,Maintenance,Long Life,Tips',
      'blog.post.11.seoDescription':
        'Learn the best ways to maintain the nano ceramic layer for the longest possible time.',

      'blog.post.12.title': 'Latest Car Protection Technologies in 2024',
      'blog.post.12.excerpt':
        'Discover the latest car protection technologies that will appear in 2024 with Royal Nano Ceramic.',
      'blog.post.12.category': 'Nano Technology',
      'blog.post.12.readTime': '7 minutes',
      'blog.post.12.tags':
        '2024 Technologies,Advanced Protection,New Technology,Royal Nano',
      'blog.post.12.seoKeywords':
        '2024 Technologies,Car Protection,New Technology,Royal Nano Ceramic',
      'blog.post.12.seoDescription':
        'Discover the latest car protection technologies that will appear in 2024 with Royal Nano Ceramic',

      // Gallery Page - Gallery Images Data
      'gallery.image.1.alt': 'Advanced Ceramic Coating',
      'gallery.image.1.title': 'Advanced Ceramic Coating',
      'gallery.image.1.description':
        'Comprehensive paint protection from scratches and weather factors',
      'gallery.image.1.protectionInfo':
        'Ceramic coating provides 5-year protection against scratches, ultraviolet rays, and acid rain. Gives permanent shine and reduces the need for frequent washing.',
      'gallery.image.1.protectionType': 'Advanced Protection',
      'gallery.image.1.features':
        '5 Years Protection,Scratch Resistance,UV Protection,Acid Rain Resistance',

      'gallery.image.2.alt': 'Scratch Protection',
      'gallery.image.2.title': 'Scratch Protection',
      'gallery.image.2.description':
        'Transparent protection layer prevents scratches and friction',
      'gallery.image.2.protectionInfo':
        'The transparent protection layer protects car paint from small scratches, friction, and chemicals. Can be easily removed when needed without affecting the original paint.',
      'gallery.image.2.protectionType': 'Surface Protection',
      'gallery.image.2.features':
        'Transparent Layer,Scratch Protection,Friction Resistance,Removable',

      'gallery.image.3.alt': 'UV Protection',
      'gallery.image.3.title': 'UV Protection',
      'gallery.image.3.description':
        'Long-term protection from harmful sun effects',
      'gallery.image.3.protectionInfo':
        'UV protection prevents car color fading and paint cracking. Maintains the car new appearance for many years even in hot climates.',
      'gallery.image.3.protectionType': 'Light Protection',
      'gallery.image.3.features':
        'UV Protection,Color Fade Prevention,Cracking Protection,Long-term Protection',

      'gallery.image.4.alt': 'Acid Rain Protection',
      'gallery.image.4.title': 'Acid Rain Protection',
      'gallery.image.4.description':
        'Protective shield against corrosion and chemical damage',
      'gallery.image.4.protectionInfo':
        'Acid rain can cause paint corrosion and metal damage. The chemical protection layer prevents this damage and protects the car in all weather conditions.',
      'gallery.image.4.protectionType': 'Chemical Protection',
      'gallery.image.4.features':
        'Acid Rain Protection,Corrosion Prevention,Metal Protection,Chemical Resistance',

      'gallery.image.5.alt': 'Dirt Protection',
      'gallery.image.5.title': 'Dirt Protection',
      'gallery.image.5.description': 'Dirt-resistant surface for easy cleaning',
      'gallery.image.5.protectionInfo':
        'The dirt-resistant surface makes the car less prone to getting dirty. When washing, dirt comes off easily reducing the risk of scratching the paint during cleaning.',
      'gallery.image.5.protectionType': 'Environmental Protection',
      'gallery.image.5.features':
        'Dirt Resistance,Easy Cleaning,Scratch Prevention,Environmental Protection',

      'gallery.image.6.alt': 'Heat Protection',
      'gallery.image.6.title': 'Heat Protection',
      'gallery.image.6.description':
        'Heat resistant and thermal damage protection',
      'gallery.image.6.protectionInfo':
        'Thermal protection prevents paint cracking and plastic material damage when exposed to high temperatures. Especially important in hot climates and sunny areas.',
      'gallery.image.6.protectionType': 'Thermal Protection',
      'gallery.image.6.features':
        'Heat Resistance,Cracking Prevention,Plastic Protection,Suitable for Hot Climates',

      'gallery.image.7.alt': 'Chemical Protection',
      'gallery.image.7.title': 'Chemical Protection',
      'gallery.image.7.description': 'Resistant to oils and harmful chemicals',
      'gallery.image.7.protectionInfo':
        'Chemicals like oils, fuel, and detergents can damage paint. The chemical protection layer prevents this damage and protects the car.',
      'gallery.image.7.protectionType': 'Advanced Protection',
      'gallery.image.7.features':
        'Oil Resistance,Fuel Resistance,Detergent Resistance,Chemical Protection',

      'gallery.image.8.alt': 'Comprehensive Protection',
      'gallery.image.8.title': 'Comprehensive Protection',
      'gallery.image.8.description':
        'Integrated protection system for all car parts',
      'gallery.image.8.protectionInfo':
        'The integrated system provides comprehensive protection for paint, glass, metals, and plastic. Ensures new car appearance for many years while reducing maintenance costs.',
      'gallery.image.8.protectionType': 'Integrated System',
      'gallery.image.8.features':
        'Comprehensive Protection,Paint Protection,Glass Protection,Metal Protection,Plastic Protection',

      'gallery.image.9.alt': 'Professional Polishing',
      'gallery.image.9.title': 'Professional Polishing',
      'gallery.image.9.description':
        'Professional polishing restores car shine',
      'gallery.image.9.protectionInfo':
        'Professional polishing restores car shine and makes it look like new. Uses advanced techniques and high-quality materials to ensure excellent results.',
      'gallery.image.9.protectionType': 'Advanced Beauty',
      'gallery.image.9.features':
        'Professional Polishing,Permanent Shine,Advanced Techniques,High Quality Materials',

      'gallery.image.10.alt': 'Interior Protection',
      'gallery.image.10.title': 'Interior Protection',
      'gallery.image.10.description':
        'Comprehensive protection for seats and interior surfaces',
      'gallery.image.10.protectionInfo':
        'Interior protection includes seats, dashboard, and other surfaces. Prevents damage and stains while maintaining new appearance.',
      'gallery.image.10.protectionType': 'Interior Protection',
      'gallery.image.10.features':
        'Seat Protection,Dashboard Protection,Stain Prevention,Interior Surface Protection',

      'gallery.image.11.alt': 'Seat Protection',
      'gallery.image.11.title': 'Seat Protection',
      'gallery.image.11.description': 'Permanent protection for leather seats',
      'gallery.image.11.protectionInfo':
        'Leather seat protection prevents damage and cracking from daily use. Maintains leather softness and extends seat lifespan.',
      'gallery.image.11.protectionType': 'Leather Protection',
      'gallery.image.11.features':
        'Leather Protection,Cracking Prevention,Damage Protection,Lifespan Extension',

      'gallery.image.12.alt': 'Surface Protection',
      'gallery.image.12.title': 'Surface Protection',
      'gallery.image.12.description':
        'Protection from damage and stains for all surfaces',
      'gallery.image.12.protectionInfo':
        'Comprehensive protection for all car interior and exterior surfaces. Prevents damage and stains while maintaining new appearance for many years.',
      'gallery.image.12.protectionType': 'Comprehensive Protection',
      'gallery.image.12.features':
        'All Surface Protection,Damage Prevention,Stain Prevention,Long-term Protection',
    },
  };

  constructor() {
    // Set initial language
    this.setLanguage('ar');
  }

  setLanguage(lang: string): void {
    if (lang !== 'ar' && lang !== 'en') {
      lang = 'ar';
    }

    // Update our properties
    this.currentLang = lang;
    this.isRtl = lang === 'ar';

    // Update page direction and language
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Update body classes
    document.body.className =
      lang === 'ar' ? 'rtl arabic-font' : 'ltr english-font';

    // Language updated
  }

  getCurrentLanguage(): string {
    return this.currentLang;
  }

  switchLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    this.setLanguage(newLang);
  }

  getTranslation(key: string): string {
    const langTranslations =
      this.translations[this.currentLang as keyof typeof this.translations];
    const translation =
      langTranslations[key as keyof typeof langTranslations] || key;
    return translation;
  }

  isArabic(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }

  isEnglish(): boolean {
    return this.getCurrentLanguage() === 'en';
  }

  // Simple getters for components
  get currentLang$(): string {
    return this.currentLang;
  }

  get isRtl$(): boolean {
    return this.isRtl;
  }
}

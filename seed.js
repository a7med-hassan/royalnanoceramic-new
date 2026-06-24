/**
 * Database Seed Script for Royal Nano Ceramic Blog
 * (Using Firebase Web SDK to avoid Service Account authentication errors)
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Use the API key from environment.ts
const firebaseConfig = {
  apiKey: "AIzaSyB5rK458qgLbYyU6tntDlwAqB_zt9TtYQQ",
  authDomain: "royalnanoceramic-backend.firebaseapp.com",
  projectId: "royalnanoceramic-backend",
  storageBucket: "royalnanoceramic-backend.firebasestorage.app",
  messagingSenderId: "777170823985",
  appId: "1:777170823985:web:1be5028fbaa800892d5e10"
};

console.log('Initializing Firebase Web SDK...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTION = 'blog_posts';

const samplePosts = [
  {
    slug: 'nano-ceramic-complete-guide',
    titleAr: 'الدليل الشامل للنانو سيراميك: كل ما تحتاج لمعرفته',
    titleEn: 'The Ultimate Nano Ceramic Guide: Everything You Need to Know',
    excerptAr: 'اكتشف فوائد النانو سيراميك، كيف يحمي سيارتك من الخدوش والعوامل الجوية، ولماذا يعتبر الاستثمار الأفضل لسيارتك.',
    excerptEn: 'Discover the benefits of Nano Ceramic coating, how it protects your car, and why it is the best investment.',
    contentAr: '<h1>الدليل الشامل للنانو سيراميك</h1><p>النانو سيراميك هو طبقة حماية سائلة تعتمد على تقنية النانو تلتصق كيميائياً بطلاء السيارة.</p><h2>ما هو النانو سيراميك؟</h2><p>تتكون هذه المادة من جزيئات السيراميك الدقيقة التي تشكل طبقة زجاجية متينة.</p><h3>فوائد النانو سيراميك</h3><ul><li>حماية من الخدوش الدقيقة</li><li>لمعان دائم وعميق</li><li>مقاومة للماء والأوساخ (Hydrophobic)</li></ul><img src="https://royalnanoceramic.com/assets/images/service-1.webp" alt="image" style="max-width:100%; border-radius:8px; margin:1.5rem 0; border:1px solid rgba(197,160,89,0.15);" /><p>هذه الطبقة تعتبر الاستثمار الأفضل لسيارتك على المدى الطويل.</p><div style="margin: 2rem 0; border-radius: 12px; overflow: hidden; position: relative; aspect-ratio: 16/9; background: #111; border: 1px solid rgba(197, 160, 89, 0.15);"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen loading="lazy"></iframe></div><p><br></p>',
    contentEn: '<h1>The Ultimate Nano Ceramic Guide</h1><p>Nano ceramic is a liquid polymer applied to the exterior of a vehicle that chemically bonds with the factory paint.</p><h2>What is Nano Ceramic?</h2><p>It consists of microscopic ceramic particles forming a durable glass-like layer.</p><h3>Benefits of Nano Ceramic</h3><ul><li>Protection against micro-scratches</li><li>Deep, lasting gloss</li><li>Water and dirt resistance (Hydrophobic)</li></ul><img src="https://royalnanoceramic.com/assets/images/service-1.webp" alt="image" style="max-width:100%; border-radius:8px; margin:1.5rem 0; border:1px solid rgba(197,160,89,0.15);" /><p>This coating is the best long-term investment for your vehicle.</p><div style="margin: 2rem 0; border-radius: 12px; overflow: hidden; position: relative; aspect-ratio: 16/9; background: #111; border: 1px solid rgba(197, 160, 89, 0.15);"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen loading="lazy"></iframe></div><p><br></p>',
    image: 'https://royalnanoceramic.com/assets/images/service-1.webp',
    hasVideo: false,
    category: 'تقنيات النانو',
    tags: ['نانو سيراميك', 'حماية السيارات', 'دليل شامل'],
    seoKeywords: ['nano ceramic', 'car protection', 'guide'],
    readTime: '6 دقائق',
    featured: true,
    published: true,
    views: 125,
    author: 'Royal Nano Admin',
    authorId: 'admin',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    slug: 'ppf-vs-nano-ceramic',
    titleAr: 'أفلام الحماية PPF مقابل النانو سيراميك: أيهما الأفضل؟',
    titleEn: 'PPF vs Nano Ceramic: Which is Better for Your Car?',
    excerptAr: 'مقارنة تفصيلية بين أفلام الحماية الشفافة والنانو سيراميك لتساعدك في اختيار الحماية الأنسب لسيارتك.',
    excerptEn: 'A detailed comparison between Paint Protection Film and Nano Ceramic to help you choose the best protection.',
    contentAr: '<h1>أفلام الحماية PPF مقابل النانو سيراميك</h1><p>مقارنة تفصيلية بين أفلام الحماية الشفافة والنانو سيراميك.</p><h2>الفرق الأساسي</h2><p>أفلام الحماية (PPF) توفر حماية فيزيائية أقوى ضد الحصى المتطاير، بينما يركز النانو سيراميك على اللمعان والمقاومة الكيميائية.</p><img src="https://royalnanoceramic.com/assets/images/service-2.webp" alt="image" style="max-width:100%; border-radius:8px; margin:1.5rem 0; border:1px solid rgba(197,160,89,0.15);" /><h3>متى تختار PPF؟</h3><p>إذا كنت تسافر كثيراً على طرق سريعة أو غير ممهدة.</p>',
    contentEn: '<h1>PPF vs Nano Ceramic</h1><p>A detailed comparison between Paint Protection Film and Nano Ceramic.</p><h2>The Main Difference</h2><p>Paint Protection Film (PPF) provides stronger physical protection against rock chips, while Nano Ceramic focuses on gloss and chemical resistance.</p><img src="https://royalnanoceramic.com/assets/images/service-2.webp" alt="image" style="max-width:100%; border-radius:8px; margin:1.5rem 0; border:1px solid rgba(197,160,89,0.15);" /><h3>When to choose PPF?</h3><p>If you frequently travel on highways or unpaved roads.</p>',
    image: 'https://royalnanoceramic.com/assets/images/service-2.webp',
    hasVideo: true,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'أفلام الحماية',
    tags: ['PPF', 'مقارنة', 'حماية الطلاء'],
    seoKeywords: ['ppf', 'paint protection film', 'vs nano ceramic'],
    readTime: '5 دقائق',
    featured: false,
    published: true,
    views: 84,
    author: 'Royal Nano Admin',
    authorId: 'admin',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000)
  },
  {
    slug: 'car-washing-mistakes',
    titleAr: '5 أخطاء شائعة عند غسيل السيارة تدمر الطلاء',
    titleEn: '5 Common Car Washing Mistakes That Destroy Your Paint',
    excerptAr: 'تعرف على الأخطاء الكارثية التي يرتكبها الكثيرون أثناء غسيل سياراتهم وكيفية تجنبها للحفاظ على لمعان الطلاء.',
    excerptEn: 'Learn about the disastrous mistakes many people make while washing their cars and how to avoid them.',
    contentAr: '<h1>أخطاء تدمر طلاء سيارتك أثناء الغسيل</h1><p>تجنب هذه الأخطاء الكارثية للحفاظ على لمعان سيارتك.</p><h2>1. استخدام مناشف غير مناسبة</h2><p>استخدام المناشف الخشنة أو غير المخصصة للسيارات يسبب خدوش دقيقة تعرف بالدوائر (Swirl Marks).</p><h2>2. الغسيل تحت أشعة الشمس المباشرة</h2><p>يؤدي إلى تبخر الماء بسرعة تاركاً بقعاً مائية صعبة الإزالة.</p><h3>الحل الأمثل</h3><p>دائماً اغسل سيارتك في الظل واستخدم شامبو مخصص للسيارات ومناشف مايكروفايبر ناعمة.</p>',
    contentEn: '<h1>Mistakes That Destroy Your Paint During Washing</h1><p>Avoid these disastrous mistakes to keep your car glossy.</p><h2>1. Using Wrong Towels</h2><p>Using rough or non-microfiber towels causes swirl marks.</p><h2>2. Washing Under Direct Sunlight</h2><p>Causes water to evaporate quickly, leaving hard water spots.</p><h3>The Best Solution</h3><p>Always wash your car in the shade using dedicated car shampoo and soft microfiber towels.</p>',
    image: 'https://royalnanoceramic.com/assets/images/service-3.webp',
    hasVideo: false,
    category: 'تنظيف السيارات',
    tags: ['غسيل', 'عناية', 'نصائح'],
    seoKeywords: ['car washing', 'mistakes', 'car care'],
    readTime: '4 دقائق',
    featured: false,
    published: true,
    views: 230,
    author: 'Royal Nano Admin',
    authorId: 'admin',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000)
  }
];

async function seedDatabase() {
  console.log(`Starting to seed ${samplePosts.length} posts to '${COLLECTION}' collection...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const data of samplePosts) {
    const slug = data.slug;
    console.log(`⏳ Seeding: ${slug}`);

    try {
      await setDoc(doc(db, COLLECTION, slug), data);
      console.log(`✅ Success: ${slug}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed: ${slug}`, error.message);
      errorCount++;
    }
  }

  console.log('\n================================');
  console.log(`🎉 Seeding Complete!`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('================================');
  process.exit(0);
}

seedDatabase();

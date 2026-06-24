/**
 * Script لإنشاء collection whiteFridaySessions في Firebase Firestore
 * 
 * الاستخدام:
 * node speed.js
 * 
 * يتطلب: serviceAccountKey.json في نفس المجلد
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
  // databaseURL اختياري - Firestore لا يحتاجه
});

const db = admin.firestore();

/**
 * إنشاء collection whiteFridaySessions مع document مثال
 */
async function createWhiteFridaySessionsCollection() {
  try {
    console.log('🚀 بدء إنشاء collection whiteFridaySessions...\n');

    const collectionRef = db.collection('whiteFridaySessions');

    // ✅ التحقق من وجود documents في الـ collection
    const existingDocs = await collectionRef.limit(1).get();
    if (!existingDocs.empty) {
      console.log('✅ Collection "whiteFridaySessions" موجود بالفعل');
      const totalDocs = await collectionRef.get();
      console.log(`📊 عدد الـ documents الموجودة: ${totalDocs.size}\n`);
    }

    // ✅ إنشاء document مثال لتأكيد إنشاء الـ collection
    const exampleSessionId = 'sess_example_' + Date.now();
    const exampleData = {
      stage: 'intro',
      discount: null,
      discountText: null,
      isGift: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: 'Script Setup',
      note: 'This is an example document created by speed.js script'
    };

    await collectionRef.doc(exampleSessionId).set(exampleData);
    console.log('✅ تم إنشاء document مثال في collection whiteFridaySessions');
    console.log(`   Document ID: ${exampleSessionId}\n`);

    // ✅ إنشاء document آخر كمثال للحالة form
    const formExampleId = 'sess_form_example_' + Date.now();
    const formExampleData = {
      stage: 'form',
      discount: 30,
      discountText: 'خصم 30%',
      isGift: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: 'Script Setup',
      note: 'Example document for form stage'
    };

    await collectionRef.doc(formExampleId).set(formExampleData);
    console.log('✅ تم إنشاء document مثال للحالة form');
    console.log(`   Document ID: ${formExampleId}\n`);

    // ✅ إنشاء document آخر كمثال للحالة submitted
    const submittedExampleId = 'sess_submitted_example_' + Date.now();
    const submittedExampleData = {
      stage: 'submitted',
      discount: 25,
      discountText: 'خصم 25%',
      isGift: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: 'Script Setup',
      note: 'Example document for submitted stage'
    };

    await collectionRef.doc(submittedExampleId).set(submittedExampleData);
    console.log('✅ تم إنشاء document مثال للحالة submitted');
    console.log(`   Document ID: ${submittedExampleId}\n`);

    console.log('🎉 تم إنشاء collection whiteFridaySessions بنجاح!');
    console.log('\n📋 ملخص:');
    console.log('   - Collection Name: whiteFridaySessions');
    console.log('   - Documents Created: 3 (example documents)');
    console.log('   - Structure:');
    console.log('     * stage: "intro" | "form" | "submitted"');
    console.log('     * discount: number | string (null for intro)');
    console.log('     * discountText: string (null for intro)');
    console.log('     * isGift: boolean');
    console.log('     * createdAt: timestamp');
    console.log('     * updatedAt: timestamp');
    console.log('     * userAgent: string');
    console.log('\n💡 ملاحظة: يمكنك حذف الـ example documents من Firebase Console');
    console.log('   أو تركها كأمثلة للبنية.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في إنشاء collection:', error);
    console.error('\n🔍 تأكد من:');
    console.error('   1. Firebase config صحيح');
    console.error('   2. Firestore Rules تسمح بالكتابة');
    console.error('   3. الاتصال بالإنترنت متاح');
    process.exit(1);
  }
}

/**
 * التحقق من وجود collection
 */
async function checkCollectionExists() {
  try {
    console.log('🔍 التحقق من وجود collection whiteFridaySessions...\n');
    
    const collectionRef = db.collection('whiteFridaySessions');
    const snapshot = await collectionRef.limit(1).get();
    
    if (!snapshot.empty) {
      console.log('✅ Collection "whiteFridaySessions" موجود بالفعل');
      const totalSnapshot = await collectionRef.get();
      console.log(`📊 عدد الـ documents: ${totalSnapshot.size}\n`);
    } else {
      console.log('ℹ️ Collection غير موجود - سيتم إنشاؤه تلقائياً عند إضافة أول document');
      console.log('   (Firestore لا يحتاج إنشاء collection مسبقاً)\n');
    }
    
    return true;
  } catch (error) {
    console.error('❌ خطأ في التحقق:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  White Friday Sessions Collection Setup Script');
  console.log('═══════════════════════════════════════════════════════\n');

  // التحقق من وجود collection
  await checkCollectionExists();

  // إنشاء collection مع أمثلة
  await createWhiteFridaySessionsCollection();
}

// تشغيل الـ script
main();


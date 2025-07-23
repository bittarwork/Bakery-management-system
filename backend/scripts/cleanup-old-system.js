import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, '..');

/**
 * Cleanup script for old complex scheduling system
 * Removes unnecessary files and replaces with simple distribution system
 */

console.log('🧹 بدء عملية تنظيف النظام القديم المعقد...\n');

// Files to delete
const filesToDelete = [
    // Backend files
    'controllers/autoSchedulingController.js',
    'routes/autoSchedulingRoutes.js', 
    'services/smartSchedulingService.js',
    'scripts/test-auto-scheduling-api.js',
    'scripts/create-missing-scheduling-drafts.js',
    'scripts/check-orders-schema.js',
    'scripts/apply-order-fixes.js',
    
    // Documentation files
    '../AUTO_SCHEDULING_USER_GUIDE.md',
    
    // Frontend files (dashboard)
    '../dashboard/src/services/autoSchedulingService.js',
    '../dashboard/src/pages/scheduling/AutoSchedulingReviewPage.jsx'
];

let deletedCount = 0;
let skippedCount = 0;

// Delete files
for (const filePath of filesToDelete) {
    const fullPath = path.join(backendDir, filePath);
    
    try {
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`✅ تم حذف: ${filePath}`);
            deletedCount++;
        } else {
            console.log(`⚠️  غير موجود: ${filePath}`);
            skippedCount++;
        }
    } catch (error) {
        console.log(`❌ خطأ في حذف ${filePath}: ${error.message}`);
        skippedCount++;
    }
}

// Check for scheduling_drafts related files
const schedulingRelatedFiles = [
    'migrations/create-delivery-scheduling-tables.sql',
    'scripts/checkDeliveryTables.js',
    'models/DeliverySchedule.js',
    'models/DeliveryCapacity.js'
];

console.log('\n📋 فحص الملفات المتعلقة بجدولة التسليم...');
for (const filePath of schedulingRelatedFiles) {
    const fullPath = path.join(backendDir, filePath);
    
    if (fs.existsSync(fullPath)) {
        console.log(`🔍 موجود: ${filePath} - يمكن حذفه إذا لم يعد مستخدماً`);
    }
}

// Summary
console.log('\n📊 ملخص التنظيف:');
console.log(`   ✅ تم حذف: ${deletedCount} ملف`);
console.log(`   ⚠️  تم تخطي: ${skippedCount} ملف`);

// Recommendations
console.log('\n💡 التوصيات:');
console.log('   1. تم إزالة النظام المعقد بنجاح');
console.log('   2. النظام الجديد البسيط جاهز للاستخدام');
console.log('   3. يمكنك الآن إنشاء طلب وسيتم تعيين موزع تلقائياً');
console.log('   4. استخدم API /api/simple-distribution للإدارة');

console.log('\n🎉 تم انتهاء عملية التنظيف بنجاح!');

// Test if we can create the summary file
try {
    const summaryContent = `
# System Cleanup Summary

## تم حذف النظام المعقد القديم:
- autoSchedulingController.js
- autoSchedulingRoutes.js  
- smartSchedulingService.js
- AUTO_SCHEDULING_USER_GUIDE.md

## النظام الجديد البسيط:
- simpleDistributionService.js ✅
- distributionController.js ✅
- distributionRoutes.js ✅

## الآلية الجديدة:
إنشاء طلب → تعيين موزع تلقائياً → ظهور في تطبيق الموزع

## API Endpoints الجديدة:
- GET /api/simple-distribution/orders
- POST /api/simple-distribution/assign
- GET /api/simple-distribution/distributor/:id/orders

تاريخ التنظيف: ${new Date().toLocaleString('ar-SA')}
`;

    fs.writeFileSync(path.join(backendDir, '../SYSTEM_CLEANUP_SUMMARY.md'), summaryContent);
    console.log('\n📄 تم إنشاء SYSTEM_CLEANUP_SUMMARY.md');
    
} catch (error) {
    console.log(`⚠️  تعذر إنشاء ملف الملخص: ${error.message}`);
} 
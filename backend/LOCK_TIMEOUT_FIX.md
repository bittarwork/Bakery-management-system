# Lock Wait Timeout Fix - إصلاح مشكلة تجاوز مهلة انتظار القفل

## المشكلة
كانت تظهر رسالة خطأ `ER_LOCK_WAIT_TIMEOUT` عند إنشاء طلبات جديدة، مما يؤدي إلى فشل عملية إنشاء الطلب.

## السبب
المشكلة كانت ناتجة عن:
1. تحديث الطلب خارج المعاملة (transaction) بعد إغلاقها
2. عدم تمرير المعاملة لخدمة التوزيع
3. إعدادات قاعدة البيانات غير محسنة
4. عدم معالجة أخطاء القفل بشكل صحيح

## الإصلاحات المطبقة

### 1. إصلاح تحديث الطلب في orderController.js
```javascript
// قبل الإصلاح
await order.update({
    assigned_distributor_id: assignmentResult.assigned_distributor.id,
    status: ORDER_STATUS.CONFIRMED
});

// بعد الإصلاح
await order.update({
    assigned_distributor_id: assignmentResult.assigned_distributor.id,
    status: ORDER_STATUS.CONFIRMED
}, { transaction });
```

### 2. تحسين خدمة التوزيع البسيطة
- إضافة دعم المعاملات لـ `assignOrderToDistributor`
- إضافة دعم المعاملات لـ `updateDistributorWorkload`
- تجنب قفل الصفوف لتجنب التعارضات

### 3. تحسين إعدادات قاعدة البيانات
```javascript
// إعدادات محسنة للمعاملات
const transaction = await sequelize.transaction({
    isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    timeout: 30000 // 30 seconds timeout
});

// إعدادات محسنة لـ connection pool
pool: {
    max: 10,        // زيادة من 5 إلى 10
    min: 2,         // زيادة من 0 إلى 2
    acquire: 60000, // زيادة من 30000 إلى 60000
    idle: 10000
}

// إعدادات إضافية لـ dialectOptions
dialectOptions: {
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    multipleStatements: true,
    supportBigNumbers: true,
    bigNumberStrings: true
}
```

### 4. معالجة أفضل للأخطاء
```javascript
// معالجة خاصة لخطأ القفل
if (error.original && error.original.code === 'ER_LOCK_WAIT_TIMEOUT') {
    return res.status(409).json({
        success: false,
        message: 'تم تجاوز مهلة انتظار القفل. يرجى المحاولة مرة أخرى.',
        error: 'Lock wait timeout exceeded'
    });
}
```

### 5. تحسين إعدادات الإنتاج
```javascript
// إعدادات محسنة للإنتاج
pool: {
    max: 25,        // زيادة من 20 إلى 25
    min: 5,         // زيادة من 0 إلى 5
    acquire: 60000,
    idle: 10000
}
```

## الملفات المعدلة
1. `backend/controllers/orderController.js` - إصلاح تحديث الطلب
2. `backend/services/simpleDistributionService.js` - دعم المعاملات
3. `backend/config/database.js` - تحسين الإعدادات
4. `backend/scripts/test-order-creation.js` - سكريبت اختبار جديد

## كيفية الاختبار
```bash
# تشغيل سكريبت الاختبار
cd backend
node scripts/test-order-creation.js
```

## النتائج المتوقعة
- ✅ عدم ظهور خطأ `ER_LOCK_WAIT_TIMEOUT`
- ✅ إنشاء الطلبات بنجاح
- ✅ تعيين الموزعين بشكل صحيح
- ✅ أداء محسن لقاعدة البيانات

## ملاحظات إضافية
- تم تحسين إعدادات connection pool لتحسين الأداء
- تم إضافة معالجة خاصة لأخطاء القفل
- تم تحسين إعدادات المعاملات لتجنب التعارضات
- تم إضافة سكريبت اختبار للتحقق من الإصلاحات 
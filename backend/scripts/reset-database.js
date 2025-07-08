import sequelize from '../config/database.js';

console.log('🔄 بدء إعادة تعيين قاعدة البيانات...');

try {
    // Test database connection first
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // Drop all tables and recreate them
    console.log('🗑️ حذف وإعادة إنشاء الجداول...');
    await sequelize.sync({ force: true });

    console.log('✅ تم إعادة إنشاء جميع الجداول بنجاح');
    console.log('🎉 تم إعادة تعيين قاعدة البيانات بنجاح!');

} catch (error) {
    console.error('❌ خطأ في إعادة تعيين قاعدة البيانات:', error.message);
    console.error('تفاصيل الخطأ:', error);
} finally {
    await sequelize.close();
    console.log('🔌 تم إغلاق الاتصال بقاعدة البيانات');
} 
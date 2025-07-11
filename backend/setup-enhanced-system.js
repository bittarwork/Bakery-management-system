#!/usr/bin/env node

import { initializeEnhancedSystem, healthCheck } from './utils/enhancedSystemSetup.js';

const runSetup = async () => {
    try {
        console.log('🚀 بدء إعداد النظام المحسن...');
        console.log('═'.repeat(50));

        // Initialize the enhanced system
        await initializeEnhancedSystem();

        // Perform health check
        console.log('\n🔍 فحص صحة النظام...');
        const health = await healthCheck();

        console.log('\n📊 تقرير صحة النظام:');
        console.log(`   الحالة: ${health.status}`);
        console.log(`   الرسالة: ${health.message}`);
        if (health.tables_count) {
            console.log(`   عدد الجداول: ${health.tables_count}`);
        }

        if (health.status === 'healthy') {
            console.log('\n🎉 تم إعداد النظام المحسن بنجاح!');
            console.log('✅ النظام جاهز للاستخدام');
        } else {
            console.log('\n⚠️ النظام يحتاج إلى إصلاح');
            if (health.missing_tables) {
                console.log(`   الجداول المفقودة: ${health.missing_tables.join(', ')}`);
            }
        }

        console.log('\n📋 الميزات المتاحة:');
        console.log('   • نظام التوزيع المحسن مع تتبع GPS');
        console.log('   • إدارة المحلات المتقدمة');
        console.log('   • نظام المدفوعات متعدد العملات (EUR/SYP)');
        console.log('   • نظام الأمان المحسن');
        console.log('   • تقارير وإحصائيات شاملة');

        console.log('\n💡 للبدء في استخدام النظام:');
        console.log('   npm run dev');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ خطأ في إعداد النظام المحسن:', error);
        console.error('\n🔧 محاولة إصلاح المشكلة...');

        // Try to fix common issues
        try {
            const { setupDatabase } = await import('./utils/enhancedSystemSetup.js');
            await setupDatabase();
            console.log('✅ تم إصلاح قاعدة البيانات');
        } catch (fixError) {
            console.error('❌ فشل في إصلاح قاعدة البيانات:', fixError);
        }

        process.exit(1);
    }
};

// Always run setup when this script is executed
runSetup();

export default runSetup; 
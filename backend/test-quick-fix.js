#!/usr/bin/env node

/**
 * Quick Fix Test - تطبيق إصلاحات سريعة للنظام
 */

import express from 'express';
import cors from 'cors';
import distributionRoutes from './routes/distributionRoutes.js';

const app = express();
const PORT = 5002; // منفذ مختلف للاختبار

// إعدادات أساسية
app.use(cors({ origin: '*' }));
app.use(express.json());

// تسجيل الطلبات
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// استخدام مسارات التوزيع بدون مصادقة
app.use('/api/distribution', distributionRoutes);

// بدء الخادم
app.listen(PORT, () => {
    console.log('🔧 Quick Fix Server running on:', `http://localhost:${PORT}`);
    console.log('🧪 Test endpoint:', `http://localhost:${PORT}/api/distribution/schedules/auto`);
    console.log('📊 Status:', 'Ready for testing');
});

export default app;
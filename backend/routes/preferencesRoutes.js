import express from 'express';
import { body } from 'express-validator';
import preferencesController from '../controllers/preferencesController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const generalSettingsValidation = [
    body('language')
        .optional()
        .isIn(['ar', 'en', 'fr', 'nl'])
        .withMessage('اللغة المختارة غير مدعومة'),
    body('theme')
        .optional()
        .isIn(['light', 'dark', 'auto'])
        .withMessage('المظهر المختار غير مدعوم'),
    body('timezone')
        .optional()
        .isLength({ min: 3, max: 50 })
        .withMessage('المنطقة الزمنية غير صحيحة'),
    body('currency')
        .optional()
        .isLength({ min: 3, max: 3 })
        .withMessage('رمز العملة يجب أن يكون 3 أحرف'),
    body('date_format')
        .optional()
        .isIn(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])
        .withMessage('تنسيق التاريخ غير مدعوم'),
    body('time_format')
        .optional()
        .isIn(['12h', '24h'])
        .withMessage('تنسيق الوقت غير مدعوم'),
    body('auto_logout')
        .optional()
        .isInt({ min: 30, max: 1440 })
        .withMessage('مدة تسجيل الخروج التلقائي يجب أن تكون بين 30 و 1440 دقيقة')
];

const notificationSettingsValidation = [
    body('email')
        .optional()
        .isBoolean()
        .withMessage('إعداد البريد الإلكتروني يجب أن يكون true أو false'),
    body('push')
        .optional()
        .isBoolean()
        .withMessage('إعداد الإشعارات المدفوعة يجب أن يكون true أو false'),
    body('sms')
        .optional()
        .isBoolean()
        .withMessage('إعداد الرسائل النصية يجب أن يكون true أو false'),
    body('orders')
        .optional()
        .isBoolean()
        .withMessage('إعداد إشعارات الطلبات يجب أن يكون true أو false'),
    body('payments')
        .optional()
        .isBoolean()
        .withMessage('إعداد إشعارات المدفوعات يجب أن يكون true أو false'),
    body('system')
        .optional()
        .isBoolean()
        .withMessage('إعداد إشعارات النظام يجب أن يكون true أو false')
];

const dashboardLayoutValidation = [
    body('widgets')
        .optional()
        .isArray()
        .withMessage('قائمة الأدوات يجب أن تكون مصفوفة'),
    body('widgets.*')
        .optional()
        .isIn(['orders', 'products', 'payments', 'reports', 'stores', 'analytics'])
        .withMessage('أداة غير مدعومة'),
    body('columns')
        .optional()
        .isInt({ min: 1, max: 4 })
        .withMessage('عدد الأعمدة يجب أن يكون بين 1 و 4'),
    body('compact')
        .optional()
        .isBoolean()
        .withMessage('إعداد العرض المدمج يجب أن يكون true أو false')
];

const displayPreferencesValidation = [
    body('items_per_page')
        .optional()
        .isInt({ min: 10, max: 100 })
        .withMessage('عدد العناصر في الصفحة يجب أن يكون بين 10 و 100'),
    body('show_images')
        .optional()
        .isBoolean()
        .withMessage('إعداد عرض الصور يجب أن يكون true أو false'),
    body('show_descriptions')
        .optional()
        .isBoolean()
        .withMessage('إعداد عرض الأوصاف يجب أن يكون true أو false'),
    body('default_view')
        .optional()
        .isIn(['table', 'grid', 'list'])
        .withMessage('العرض الافتراضي غير مدعوم')
];

const accessibilityValidation = [
    body('high_contrast')
        .optional()
        .isBoolean()
        .withMessage('إعداد التباين العالي يجب أن يكون true أو false'),
    body('large_text')
        .optional()
        .isBoolean()
        .withMessage('إعداد النص الكبير يجب أن يكون true أو false'),
    body('screen_reader')
        .optional()
        .isBoolean()
        .withMessage('إعداد قارئ الشاشة يجب أن يكون true أو false'),
    body('keyboard_navigation')
        .optional()
        .isBoolean()
        .withMessage('إعداد التنقل بلوحة المفاتيح يجب أن يكون true أو false')
];

const privacyValidation = [
    body('share_activity')
        .optional()
        .isBoolean()
        .withMessage('إعداد مشاركة النشاط يجب أن يكون true أو false'),
    body('analytics')
        .optional()
        .isBoolean()
        .withMessage('إعداد التحليلات يجب أن يكون true أو false'),
    body('marketing')
        .optional()
        .isBoolean()
        .withMessage('إعداد التسويق يجب أن يكون true أو false')
];

const languageValidation = [
    body('language')
        .notEmpty()
        .withMessage('اللغة مطلوبة')
        .isIn(['ar', 'en', 'fr', 'nl'])
        .withMessage('اللغة المختارة غير مدعومة')
];

const themeValidation = [
    body('theme')
        .notEmpty()
        .withMessage('المظهر مطلوب')
        .isIn(['light', 'dark', 'auto'])
        .withMessage('المظهر المختار غير مدعوم')
];

const resetPreferencesValidation = [
    body('section')
        .optional()
        .isIn(['general', 'notifications', 'dashboard', 'display', 'accessibility', 'privacy'])
        .withMessage('القسم المحدد غير مدعوم')
];

// All routes are protected
router.use(protect);

// Main preferences routes
router.get('/', preferencesController.getUserPreferences);

// Settings categories
router.put('/general', generalSettingsValidation, preferencesController.updateGeneralSettings);
router.put('/notifications', notificationSettingsValidation, preferencesController.updateNotificationSettings);
router.put('/dashboard', dashboardLayoutValidation, preferencesController.updateDashboardLayout);
router.put('/display', displayPreferencesValidation, preferencesController.updateDisplayPreferences);
router.put('/accessibility', accessibilityValidation, preferencesController.updateAccessibilitySettings);
router.put('/privacy', privacyValidation, preferencesController.updatePrivacySettings);

// Quick settings
router.put('/language', languageValidation, preferencesController.updateLanguage);
router.put('/theme', themeValidation, preferencesController.updateTheme);

// Reset and export
router.post('/reset', resetPreferencesValidation, preferencesController.resetPreferences);
router.get('/export', preferencesController.exportPreferences);

export default router; 
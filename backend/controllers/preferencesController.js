import { UserPreferences, User } from '../models/index.js';
import { validationResult } from 'express-validator';

const preferencesController = {
    // الحصول على تفضيلات المستخدم
    async getUserPreferences(req, res) {
        try {
            const userId = req.userId;

            const preferences = await UserPreferences.getOrCreateForUser(userId);

            res.status(200).json({
                success: true,
                data: preferences.getFormattedPreferences()
            });

        } catch (error) {
            console.error('Get user preferences error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في استرجاع التفضيلات'
            });
        }
    },

    // تحديث الإعدادات العامة
    async updateGeneralSettings(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'بيانات غير صحيحة',
                    errors: errors.array()
                });
            }

            const userId = req.userId;
            const {
                language,
                theme,
                timezone,
                currency,
                date_format,
                time_format,
                auto_logout
            } = req.body;

            const preferences = await UserPreferences.getOrCreateForUser(userId);

            const updateData = {};
            if (language !== undefined) updateData.language = language;
            if (theme !== undefined) updateData.theme = theme;
            if (timezone !== undefined) updateData.timezone = timezone;
            if (currency !== undefined) updateData.currency = currency;
            if (date_format !== undefined) updateData.date_format = date_format;
            if (time_format !== undefined) updateData.time_format = time_format;
            if (auto_logout !== undefined) updateData.auto_logout = auto_logout;

            await preferences.update(updateData);

            res.status(200).json({
                success: true,
                message: 'تم تحديث الإعدادات العامة بنجاح',
                data: preferences.getFormattedPreferences()
            });

        } catch (error) {
            console.error('Update general settings error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث الإعدادات العامة'
            });
        }
    },

    // تحديث إعدادات الإشعارات
    async updateNotificationSettings(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'بيانات غير صحيحة',
                    errors: errors.array()
                });
            }

            const userId = req.userId;
            const notificationSettings = req.body;

            const preferences = await UserPreferences.getOrCreateForUser(userId);
            await preferences.updateNotifications(notificationSettings);

            res.status(200).json({
                success: true,
                message: 'تم تحديث إعدادات الإشعارات بنجاح',
                data: preferences.notifications
            });

        } catch (error) {
            console.error('Update notification settings error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث إعدادات الإشعارات'
            });
        }
    },

    // تحديث تخطيط لوحة التحكم
    async updateDashboardLayout(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'بيانات غير صحيحة',
                    errors: errors.array()
                });
            }

            const userId = req.userId;
            const layoutSettings = req.body;

            const preferences = await UserPreferences.getOrCreateForUser(userId);
            await preferences.updateDashboardLayout(layoutSettings);

            res.status(200).json({
                success: true,
                message: 'تم تحديث تخطيط لوحة التحكم بنجاح',
                data: preferences.dashboard_layout
            });

        } catch (error) {
            console.error('Update dashboard layout error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث تخطيط لوحة التحكم'
            });
        }
    },

    // تحديث تفضيلات العرض
    async updateDisplayPreferences(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'بيانات غير صحيحة',
                    errors: errors.array()
                });
            }

            const userId = req.userId;
            const displaySettings = req.body;

            const preferences = await UserPreferences.getOrCreateForUser(userId);
            await preferences.updateDisplayPreferences(displaySettings);

            res.status(200).json({
                success: true,
                message: 'تم تحديث تفضيلات العرض بنجاح',
                data: preferences.display_preferences
            });

        } catch (error) {
            console.error('Update display preferences error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث تفضيلات العرض'
            });
        }
    },

    // تحديث إعدادات إمكانية الوصول
    async updateAccessibilitySettings(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'بيانات غير صحيحة',
                    errors: errors.array()
                });
            }

            const userId = req.userId;
            const accessibilitySettings = req.body;

            const preferences = await UserPreferences.getOrCreateForUser(userId);
            await preferences.updateAccessibility(accessibilitySettings);

            res.status(200).json({
                success: true,
                message: 'تم تحديث إعدادات إمكانية الوصول بنجاح',
                data: preferences.accessibility
            });

        } catch (error) {
            console.error('Update accessibility settings error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث إعدادات إمكانية الوصول'
            });
        }
    },

    // تحديث إعدادات الخصوصية
    async updatePrivacySettings(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'بيانات غير صحيحة',
                    errors: errors.array()
                });
            }

            const userId = req.userId;
            const privacySettings = req.body;

            const preferences = await UserPreferences.getOrCreateForUser(userId);
            await preferences.updatePrivacySettings(privacySettings);

            res.status(200).json({
                success: true,
                message: 'تم تحديث إعدادات الخصوصية بنجاح',
                data: preferences.privacy_settings
            });

        } catch (error) {
            console.error('Update privacy settings error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث إعدادات الخصوصية'
            });
        }
    },

    // تحديث اللغة فقط (endpoint سريع)
    async updateLanguage(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'بيانات غير صحيحة',
                    errors: errors.array()
                });
            }

            const userId = req.userId;
            const { language } = req.body;

            const preferences = await UserPreferences.getOrCreateForUser(userId);
            await preferences.update({ language });

            res.status(200).json({
                success: true,
                message: 'تم تحديث اللغة بنجاح',
                data: { language: preferences.language }
            });

        } catch (error) {
            console.error('Update language error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث اللغة'
            });
        }
    },

    // تحديث المظهر فقط (endpoint سريع)
    async updateTheme(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'بيانات غير صحيحة',
                    errors: errors.array()
                });
            }

            const userId = req.userId;
            const { theme } = req.body;

            const preferences = await UserPreferences.getOrCreateForUser(userId);
            await preferences.update({ theme });

            res.status(200).json({
                success: true,
                message: 'تم تحديث المظهر بنجاح',
                data: { theme: preferences.theme }
            });

        } catch (error) {
            console.error('Update theme error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تحديث المظهر'
            });
        }
    },

    // إعادة تعيين التفضيلات للقيم الافتراضية
    async resetPreferences(req, res) {
        try {
            const userId = req.userId;
            const { section } = req.body; // general, notifications, dashboard, display, accessibility, privacy

            const preferences = await UserPreferences.getOrCreateForUser(userId);

            let updateData = {};

            switch (section) {
                case 'general':
                    updateData = {
                        language: 'ar',
                        theme: 'light',
                        timezone: 'Europe/Brussels',
                        currency: 'EUR',
                        date_format: 'DD/MM/YYYY',
                        time_format: '24h',
                        auto_logout: 480
                    };
                    break;
                case 'notifications':
                    updateData = {
                        notifications: {
                            email: true,
                            push: true,
                            sms: false,
                            orders: true,
                            payments: true,
                            system: true
                        }
                    };
                    break;
                case 'dashboard':
                    updateData = {
                        dashboard_layout: {
                            widgets: ['orders', 'products', 'payments', 'reports'],
                            columns: 2,
                            compact: false
                        }
                    };
                    break;
                case 'display':
                    updateData = {
                        display_preferences: {
                            items_per_page: 20,
                            show_images: true,
                            show_descriptions: true,
                            default_view: 'table'
                        }
                    };
                    break;
                case 'accessibility':
                    updateData = {
                        accessibility: {
                            high_contrast: false,
                            large_text: false,
                            screen_reader: false,
                            keyboard_navigation: false
                        }
                    };
                    break;
                case 'privacy':
                    updateData = {
                        privacy_settings: {
                            share_activity: false,
                            analytics: true,
                            marketing: false
                        }
                    };
                    break;
                default:
                    // إعادة تعيين جميع التفضيلات
                    await preferences.destroy();
                    const newPreferences = await UserPreferences.createDefaultForUser(userId);
                    return res.status(200).json({
                        success: true,
                        message: 'تم إعادة تعيين جميع التفضيلات بنجاح',
                        data: newPreferences.getFormattedPreferences()
                    });
            }

            await preferences.update(updateData);

            res.status(200).json({
                success: true,
                message: `تم إعادة تعيين ${section} بنجاح`,
                data: preferences.getFormattedPreferences()
            });

        } catch (error) {
            console.error('Reset preferences error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في إعادة تعيين التفضيلات'
            });
        }
    },

    // تصدير التفضيلات
    async exportPreferences(req, res) {
        try {
            const userId = req.userId;

            const preferences = await UserPreferences.getOrCreateForUser(userId);
            const user = await User.findByPk(userId, {
                attributes: ['id', 'username', 'full_name', 'email']
            });

            const exportData = {
                user: user,
                preferences: preferences.getFormattedPreferences(),
                exported_at: new Date(),
                version: '1.0'
            };

            res.status(200).json({
                success: true,
                message: 'تم تصدير التفضيلات بنجاح',
                data: exportData
            });

        } catch (error) {
            console.error('Export preferences error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تصدير التفضيلات'
            });
        }
    }
};

export default preferencesController; 
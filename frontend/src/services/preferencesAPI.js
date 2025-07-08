import apiClient from './apiClient.js';

// خدمة إدارة تفضيلات المستخدم
const preferencesAPI = {
    // الحصول على تفضيلات المستخدم
    async getUserPreferences() {
        try {
            const response = await apiClient.get('/preferences');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في استرجاع التفضيلات' };
        }
    },

    // تحديث الإعدادات العامة
    async updateGeneralSettings(settings) {
        try {
            const response = await apiClient.put('/preferences/general', settings);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تحديث الإعدادات العامة' };
        }
    },

    // تحديث إعدادات الإشعارات
    async updateNotificationSettings(settings) {
        try {
            const response = await apiClient.put('/preferences/notifications', settings);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تحديث إعدادات الإشعارات' };
        }
    },

    // تحديث تخطيط لوحة التحكم
    async updateDashboardLayout(layout) {
        try {
            const response = await apiClient.put('/preferences/dashboard', layout);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تحديث تخطيط لوحة التحكم' };
        }
    },

    // تحديث تفضيلات العرض
    async updateDisplayPreferences(preferences) {
        try {
            const response = await apiClient.put('/preferences/display', preferences);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تحديث تفضيلات العرض' };
        }
    },

    // تحديث إعدادات إمكانية الوصول
    async updateAccessibilitySettings(settings) {
        try {
            const response = await apiClient.put('/preferences/accessibility', settings);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تحديث إعدادات إمكانية الوصول' };
        }
    },

    // تحديث إعدادات الخصوصية
    async updatePrivacySettings(settings) {
        try {
            const response = await apiClient.put('/preferences/privacy', settings);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تحديث إعدادات الخصوصية' };
        }
    },

    // تحديث اللغة فقط (استخدام سريع)
    async updateLanguage(language) {
        try {
            const response = await apiClient.put('/preferences/language', { language });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تحديث اللغة' };
        }
    },

    // تحديث المظهر فقط (استخدام سريع)
    async updateTheme(theme) {
        try {
            const response = await apiClient.put('/preferences/theme', { theme });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تحديث المظهر' };
        }
    },

    // تحديث اللغة فقط (استخدام سريع)
    async updateLanguage(language) {
        try {
            const response = await apiClient.put('/preferences/language', { language });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تحديث اللغة' };
        }
    },

    // إعادة تعيين التفضيلات
    async resetPreferences(section = null) {
        try {
            const response = await apiClient.post('/preferences/reset', { section });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في إعادة تعيين التفضيلات' };
        }
    },

    // تصدير التفضيلات
    async exportPreferences() {
        try {
            const response = await apiClient.get('/preferences/export');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تصدير التفضيلات' };
        }
    }
};

export default preferencesAPI; 
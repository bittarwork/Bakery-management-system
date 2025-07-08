import apiClient from './apiClient.js';

// خدمة إدارة الجلسات
const sessionAPI = {
    // تسجيل الدخول وإنشاء جلسة جديدة
    async login(credentials) {
        try {
            const response = await apiClient.post('/sessions/login', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تسجيل الدخول' };
        }
    },

    // تسجيل الخروج وإنهاء الجلسة الحالية
    async logout() {
        try {
            const response = await apiClient.post('/sessions/logout');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تسجيل الخروج' };
        }
    },

    // تسجيل الخروج من جميع الأجهزة
    async logoutAll() {
        try {
            const response = await apiClient.post('/sessions/logout-all');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تسجيل الخروج من جميع الأجهزة' };
        }
    },

    // الحصول على الجلسات النشطة
    async getActiveSessions() {
        try {
            const response = await apiClient.get('/sessions/active');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في استرجاع الجلسات النشطة' };
        }
    },

    // إنهاء جلسة محددة
    async terminateSession(sessionId) {
        try {
            const response = await apiClient.delete(`/sessions/${sessionId}`);
            return response.data;
        } catch (error) {
            // معالجة خاصة للجلسات غير الموجودة
            if (error.response?.status === 404) {
                throw {
                    success: false,
                    message: 'الجلسة غير موجودة',
                    status: 404,
                    response: error.response
                };
            }
            throw error.response?.data || { message: 'خطأ في إنهاء الجلسة' };
        }
    },

    // تمديد الجلسة الحالية
    async extendSession(hours = 24) {
        try {
            const response = await apiClient.post('/sessions/extend', { hours });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'خطأ في تمديد الجلسة' };
        }
    },

    // التحقق من صحة الجلسة الحالية
    async validateSession() {
        try {
            const response = await apiClient.post('/sessions/validate');
            return response.data;
        } catch (error) {
            // تحسين معالجة الأخطاء
            if (error.response?.status === 401) {
                throw {
                    success: false,
                    message: 'الجلسة غير صحيحة أو منتهية الصلاحية',
                    status: 401,
                    response: error.response
                };
            }
            throw error.response?.data || { message: 'خطأ في التحقق من الجلسة' };
        }
    }
};

export default sessionAPI; 
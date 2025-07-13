import { apiService } from './apiService';

class AuthService {
    constructor() {
        this.apiService = apiService;
    }

    /**
     * Login user
     * @param {Object} credentials - Login credentials
     * @param {string} credentials.email - User email
     * @param {string} credentials.password - User password
     * @returns {Promise<Object>} Response object
     */
    async login(credentials) {
        try {
            const response = await this.apiService.post('/auth/login', credentials);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تسجيل الدخول'
            };
        }
    }

    /**
     * Logout user
     * @returns {Promise<Object>} Response object
     */
    async logout() {
        try {
            const response = await this.apiService.post('/auth/logout');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تسجيل الخروج'
            };
        }
    }

    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Response object
     */
    async register(userData) {
        try {
            const response = await this.apiService.post('/auth/register', userData);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في التسجيل'
            };
        }
    }

    /**
     * Refresh authentication token
     * @returns {Promise<Object>} Response object
     */
    async refreshToken() {
        try {
            const response = await this.apiService.post('/auth/refresh');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تحديث الجلسة'
            };
        }
    }

    /**
     * Verify current token
     * @returns {Promise<Object>} Response object
     */
    async verifyToken() {
        try {
            const response = await this.apiService.get('/auth/verify');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في التحقق من الجلسة'
            };
        }
    }

    /**
     * Get current user profile
     * @returns {Promise<Object>} Response object
     */
    async getProfile() {
        try {
            const response = await this.apiService.get('/auth/profile');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب الملف الشخصي'
            };
        }
    }

    /**
     * Update user profile
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} Response object
     */
    async updateProfile(profileData) {
        try {
            const response = await this.apiService.put('/auth/profile', profileData);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تحديث الملف الشخصي'
            };
        }
    }

    /**
     * Change user password
     * @param {Object} passwordData - Password change data
     * @param {string} passwordData.currentPassword - Current password
     * @param {string} passwordData.newPassword - New password
     * @param {string} passwordData.confirmPassword - Confirm new password
     * @returns {Promise<Object>} Response object
     */
    async changePassword(passwordData) {
        try {
            const response = await this.apiService.put('/auth/change-password', passwordData);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تغيير كلمة المرور'
            };
        }
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>} Response object
     */
    async forgotPassword(email) {
        try {
            const response = await this.apiService.post('/auth/forgot-password', { email });
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في إرسال رابط الاستعادة'
            };
        }
    }

    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} password - New password
     * @returns {Promise<Object>} Response object
     */
    async resetPassword(token, password) {
        try {
            const response = await this.apiService.post('/auth/reset-password', {
                token,
                password,
                password_confirmation: password
            });
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في إعادة تعيين كلمة المرور'
            };
        }
    }

    /**
     * Check if email exists
     * @param {string} email - Email to check
     * @returns {Promise<Object>} Response object
     */
    async checkEmail(email) {
        try {
            const response = await this.apiService.post('/auth/check-email', { email });
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في التحقق من البريد الإلكتروني'
            };
        }
    }

    /**
     * Update user avatar
     * @param {File} file - Avatar file
     * @returns {Promise<Object>} Response object
     */
    async updateAvatar(file) {
        try {
            const response = await this.apiService.uploadFile('/auth/avatar', file);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تحديث الصورة الشخصية'
            };
        }
    }

    /**
     * Get user permissions
     * @returns {Promise<Object>} Response object
     */
    async getPermissions() {
        try {
            const response = await this.apiService.get('/auth/permissions');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب الصلاحيات'
            };
        }
    }

    /**
     * Get user sessions
     * @returns {Promise<Object>} Response object
     */
    async getSessions() {
        try {
            const response = await this.apiService.get('/auth/sessions');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب الجلسات'
            };
        }
    }

    /**
     * Revoke session
     * @param {string} sessionId - Session ID to revoke
     * @returns {Promise<Object>} Response object
     */
    async revokeSession(sessionId) {
        try {
            const response = await this.apiService.delete(`/auth/sessions/${sessionId}`);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في إلغاء الجلسة'
            };
        }
    }

    /**
     * Revoke all sessions except current
     * @returns {Promise<Object>} Response object
     */
    async revokeAllSessions() {
        try {
            const response = await this.apiService.delete('/auth/sessions');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في إلغاء جميع الجلسات'
            };
        }
    }

    /**
     * Enable two-factor authentication
     * @returns {Promise<Object>} Response object
     */
    async enableTwoFactor() {
        try {
            const response = await this.apiService.post('/auth/two-factor/enable');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تفعيل المصادقة الثنائية'
            };
        }
    }

    /**
     * Disable two-factor authentication
     * @param {string} password - Current password
     * @returns {Promise<Object>} Response object
     */
    async disableTwoFactor(password) {
        try {
            const response = await this.apiService.post('/auth/two-factor/disable', { password });
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في إلغاء المصادقة الثنائية'
            };
        }
    }

    /**
     * Verify two-factor authentication code
     * @param {string} code - 2FA code
     * @returns {Promise<Object>} Response object
     */
    async verifyTwoFactor(code) {
        try {
            const response = await this.apiService.post('/auth/two-factor/verify', { code });
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في التحقق من الرمز'
            };
        }
    }

    /**
     * Get backup codes for two-factor authentication
     * @returns {Promise<Object>} Response object
     */
    async getTwoFactorBackupCodes() {
        try {
            const response = await this.apiService.get('/auth/two-factor/backup-codes');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب رموز النسخ الاحتياطي'
            };
        }
    }

    /**
     * Regenerate backup codes for two-factor authentication
     * @returns {Promise<Object>} Response object
     */
    async regenerateTwoFactorBackupCodes() {
        try {
            const response = await this.apiService.post('/auth/two-factor/backup-codes/regenerate');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في إعادة توليد رموز النسخ الاحتياطي'
            };
        }
    }

    /**
     * Get login attempts
     * @returns {Promise<Object>} Response object
     */
    async getLoginAttempts() {
        try {
            const response = await this.apiService.get('/auth/login-attempts');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب محاولات تسجيل الدخول'
            };
        }
    }

    /**
     * Clear login attempts
     * @returns {Promise<Object>} Response object
     */
    async clearLoginAttempts() {
        try {
            const response = await this.apiService.delete('/auth/login-attempts');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في مسح محاولات تسجيل الدخول'
            };
        }
    }

    /**
     * Get security settings
     * @returns {Promise<Object>} Response object
     */
    async getSecuritySettings() {
        try {
            const response = await this.apiService.get('/auth/security');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب إعدادات الأمان'
            };
        }
    }

    /**
     * Update security settings
     * @param {Object} settings - Security settings
     * @returns {Promise<Object>} Response object
     */
    async updateSecuritySettings(settings) {
        try {
            const response = await this.apiService.put('/auth/security', settings);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تحديث إعدادات الأمان'
            };
        }
    }
}

// Create and export service instance
export const authService = new AuthService();

export default authService; 
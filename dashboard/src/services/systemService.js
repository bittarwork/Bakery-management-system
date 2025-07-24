import { apiService } from './apiService';

class SystemService {
    constructor() {
        this.apiService = apiService;
    }

    /**
     * Get system health status
     * @returns {Promise<Object>} Response object
     */
    async getHealth() {
        try {
            const response = await this.apiService.get('/health');
            return response;
        } catch (error) {
            // If it's a network error, return a structured response
            if (error.isNetworkError) {
                return {
                    success: false,
                    message: error.message,
                    isNetworkError: true
                };
            }
            
            return {
                success: false,
                message: error.message || 'خطأ في فحص حالة النظام'
            };
        }
    }

    /**
     * Get system information
     * @returns {Promise<Object>} Response object
     */
    async getInfo() {
        try {
            const response = await this.apiService.get('/system/info');
            return response;
        } catch (error) {
            // If it's a network error, return a structured response
            if (error.isNetworkError) {
                return {
                    success: false,
                    message: error.message,
                    isNetworkError: true
                };
            }
            
            return {
                success: false,
                message: error.message || 'خطأ في جلب معلومات النظام'
            };
        }
    }

    /**
     * Get system settings
     * @returns {Promise<Object>} Response object
     */
    async getSettings() {
        try {
            const response = await this.apiService.get('/system/settings');
            return response;
        } catch (error) {
            // If it's a network error, return a structured response
            if (error.isNetworkError) {
                return {
                    success: false,
                    message: error.message,
                    isNetworkError: true
                };
            }
            
            return {
                success: false,
                message: error.message || 'خطأ في جلب إعدادات النظام'
            };
        }
    }

    /**
     * Update system settings
     * @param {Object} settings - Settings to update
     * @returns {Promise<Object>} Response object
     */
    async updateSettings(settings) {
        try {
            const response = await this.apiService.put('/system/settings', settings);
            return response;
        } catch (error) {
            // If it's a network error, return a structured response
            if (error.isNetworkError) {
                return {
                    success: false,
                    message: error.message,
                    isNetworkError: true
                };
            }
            
            return {
                success: false,
                message: error.message || 'خطأ في تحديث إعدادات النظام'
            };
        }
    }

    /**
     * Get system statistics
     * @returns {Promise<Object>} Response object
     */
    async getStatistics() {
        try {
            const response = await this.apiService.get('/system/statistics');
            return response;
        } catch (error) {
            // If it's a network error, return a structured response
            if (error.isNetworkError) {
                return {
                    success: false,
                    message: error.message,
                    isNetworkError: true
                };
            }
            
            return {
                success: false,
                message: error.message || 'خطأ في جلب إحصائيات النظام'
            };
        }
    }

    /**
     * Get system logs
     * @param {Object} params - Log parameters
     * @returns {Promise<Object>} Response object
     */
    async getLogs(params = {}) {
        try {
            const response = await this.apiService.get('/logs', { params });
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب سجلات النظام'
            };
        }
    }

    /**
     * Clear system logs
     * @returns {Promise<Object>} Response object
     */
    async clearLogs() {
        try {
            const response = await this.apiService.delete('/logs');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في مسح سجلات النظام'
            };
        }
    }

    /**
     * Get system backup
     * @returns {Promise<Object>} Response object
     */
    async getBackup() {
        try {
            const response = await this.apiService.get('/backup');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب النسخ الاحتياطية'
            };
        }
    }

    /**
     * Create system backup
     * @returns {Promise<Object>} Response object
     */
    async createBackup() {
        try {
            const response = await this.apiService.post('/backup');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في إنشاء النسخة الاحتياطية'
            };
        }
    }

    /**
     * Restore system backup
     * @param {string} backupId - Backup ID
     * @returns {Promise<Object>} Response object
     */
    async restoreBackup(backupId) {
        try {
            const response = await this.apiService.post(`/backup/${backupId}/restore`);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في استعادة النسخة الاحتياطية'
            };
        }
    }

    /**
     * Delete system backup
     * @param {string} backupId - Backup ID
     * @returns {Promise<Object>} Response object
     */
    async deleteBackup(backupId) {
        try {
            const response = await this.apiService.delete(`/backup/${backupId}`);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في حذف النسخة الاحتياطية'
            };
        }
    }

    /**
     * Get system maintenance status
     * @returns {Promise<Object>} Response object
     */
    async getMaintenanceStatus() {
        try {
            const response = await this.apiService.get('/maintenance');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب حالة الصيانة'
            };
        }
    }

    /**
     * Enable maintenance mode
     * @param {Object} options - Maintenance options
     * @returns {Promise<Object>} Response object
     */
    async enableMaintenance(options = {}) {
        try {
            const response = await this.apiService.post('/maintenance/enable', options);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تفعيل وضع الصيانة'
            };
        }
    }

    /**
     * Disable maintenance mode
     * @returns {Promise<Object>} Response object
     */
    async disableMaintenance() {
        try {
            const response = await this.apiService.post('/maintenance/disable');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في إلغاء وضع الصيانة'
            };
        }
    }

    /**
     * Get system cache status
     * @returns {Promise<Object>} Response object
     */
    async getCacheStatus() {
        try {
            const response = await this.apiService.get('/cache');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب حالة الذاكرة المؤقتة'
            };
        }
    }

    /**
     * Clear system cache
     * @returns {Promise<Object>} Response object
     */
    async clearCache() {
        try {
            const response = await this.apiService.delete('/cache');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في مسح الذاكرة المؤقتة'
            };
        }
    }

    /**
     * Get exchange rates
     * @returns {Promise<Object>} Response object
     */
    async getExchangeRates() {
        try {
            const response = await this.apiService.get('/exchange-rates');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب أسعار الصرف'
            };
        }
    }

    /**
     * Update exchange rates
     * @param {Object} rates - Exchange rates
     * @returns {Promise<Object>} Response object
     */
    async updateExchangeRates(rates) {
        try {
            const response = await this.apiService.put('/exchange-rates', rates);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تحديث أسعار الصرف'
            };
        }
    }

    /**
     * Get system notifications
     * @returns {Promise<Object>} Response object
     */
    async getNotifications() {
        try {
            const response = await this.apiService.get('/notifications');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب إشعارات النظام'
            };
        }
    }

    /**
     * Send system notification
     * @param {Object} notification - Notification data
     * @returns {Promise<Object>} Response object
     */
    async sendNotification(notification) {
        try {
            const response = await this.apiService.post('/notifications', notification);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في إرسال الإشعار'
            };
        }
    }

    /**
     * Mark notification as read
     * @param {string} notificationId - Notification ID
     * @returns {Promise<Object>} Response object
     */
    async markNotificationAsRead(notificationId) {
        try {
            const response = await this.apiService.patch(`/notifications/${notificationId}/read`);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تحديث حالة الإشعار'
            };
        }
    }

    /**
     * Delete notification
     * @param {string} notificationId - Notification ID
     * @returns {Promise<Object>} Response object
     */
    async deleteNotification(notificationId) {
        try {
            const response = await this.apiService.delete(`/notifications/${notificationId}`);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في حذف الإشعار'
            };
        }
    }

    /**
     * Get system performance metrics
     * @returns {Promise<Object>} Response object
     */
    async getPerformanceMetrics() {
        try {
            const response = await this.apiService.get('/performance');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب مقاييس الأداء'
            };
        }
    }

    /**
     * Get system configuration
     * @returns {Promise<Object>} Response object
     */
    async getConfiguration() {
        try {
            const response = await this.apiService.get('/configuration');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب إعدادات النظام'
            };
        }
    }

    /**
     * Update system configuration
     * @param {Object} config - Configuration data
     * @returns {Promise<Object>} Response object
     */
    async updateConfiguration(config) {
        try {
            const response = await this.apiService.put('/configuration', config);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تحديث إعدادات النظام'
            };
        }
    }

    /**
     * Get system version
     * @returns {Promise<Object>} Response object
     */
    async getVersion() {
        try {
            const response = await this.apiService.get('/version');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب إصدار النظام'
            };
        }
    }

    /**
     * Check for system updates
     * @returns {Promise<Object>} Response object
     */
    async checkUpdates() {
        try {
            const response = await this.apiService.get('/updates');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في فحص التحديثات'
            };
        }
    }

    /**
     * Install system update
     * @param {string} updateId - Update ID
     * @returns {Promise<Object>} Response object
     */
    async installUpdate(updateId) {
        try {
            const response = await this.apiService.post(`/updates/${updateId}/install`);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تثبيت التحديث'
            };
        }
    }

    /**
     * Get system database status
     * @returns {Promise<Object>} Response object
     */
    async getDatabaseStatus() {
        try {
            const response = await this.apiService.get('/database/status');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في فحص حالة قاعدة البيانات'
            };
        }
    }

    /**
     * Optimize database
     * @returns {Promise<Object>} Response object
     */
    async optimizeDatabase() {
        try {
            const response = await this.apiService.post('/database/optimize');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تحسين قاعدة البيانات'
            };
        }
    }

    /**
     * Get system security audit
     * @returns {Promise<Object>} Response object
     */
    async getSecurityAudit() {
        try {
            const response = await this.apiService.get('/security/audit');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب تقرير الأمان'
            };
        }
    }

    /**
     * Run security scan
     * @returns {Promise<Object>} Response object
     */
    async runSecurityScan() {
        try {
            const response = await this.apiService.post('/security/scan');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في فحص الأمان'
            };
        }
    }
}

// Create and export service instance
export const systemService = new SystemService();

export default systemService; 
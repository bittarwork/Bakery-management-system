import apiService from './apiService.js';

class UserService {
    /**
     * الحصول على جميع الموظفين
     * @param {Object} params - معاملات البحث والتصفح
     * @returns {Promise<Object>} استجابة API
     */
    async getUsers(params = {}) {
        try {
            const response = await apiService.get('/users', { params });
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب بيانات الموظفين'
            };
        }
    }

    /**
     * الحصول على موظف واحد
     * @param {number} id - معرف الموظف
     * @returns {Promise<Object>} استجابة API
     */
    async getUser(id) {
        try {
            const response = await apiService.get(`/users/${id}`);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب بيانات الموظف'
            };
        }
    }

    /**
     * إنشاء موظف جديد
     * @param {Object} userData - بيانات الموظف
     * @returns {Promise<Object>} استجابة API
     */
    async createUser(userData) {
        try {
            const response = await apiService.post('/users', userData);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في إنشاء الموظف'
            };
        }
    }

    /**
     * تحديث بيانات موظف
     * @param {number} id - معرف الموظف
     * @param {Object} userData - البيانات المحدثة
     * @returns {Promise<Object>} استجابة API
     */
    async updateUser(id, userData) {
        try {
            const response = await apiService.put(`/users/${id}`, userData);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تحديث بيانات الموظف'
            };
        }
    }

    /**
     * حذف موظف
     * @param {number} id - معرف الموظف
     * @returns {Promise<Object>} استجابة API
     */
    async deleteUser(id) {
        try {
            const response = await apiService.delete(`/users/${id}`);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في حذف الموظف'
            };
        }
    }

    /**
     * تغيير حالة موظف
     * @param {number} id - معرف الموظف
     * @param {string} status - الحالة الجديدة
     * @returns {Promise<Object>} استجابة API
     */
    async toggleUserStatus(id, status) {
        try {
            const response = await apiService.patch(`/users/${id}/status`, { status });
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تغيير حالة الموظف'
            };
        }
    }

    /**
     * الحصول على إحصائيات الموظفين
     * @returns {Promise<Object>} استجابة API
     */
    async getUserStatistics() {
        try {
            const response = await apiService.get('/users/statistics');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب إحصائيات الموظفين'
            };
        }
    }

    /**
     * تصدير بيانات الموظفين
     * @param {string} format - صيغة التصدير (json/csv)
     * @returns {Promise<Object>} استجابة API
     */
    async exportUsers(format = 'json') {
        try {
            const response = await apiService.get('/users/export', {
                params: { format },
                responseType: format === 'csv' ? 'blob' : 'json'
            });
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تصدير بيانات الموظفين'
            };
        }
    }

    /**
     * البحث في الموظفين
     * @param {string} searchTerm - مصطلح البحث
     * @param {Object} filters - الفلاتر
     * @returns {Promise<Object>} استجابة API
     */
    async searchUsers(searchTerm, filters = {}) {
        try {
            const params = {
                search: searchTerm,
                ...filters
            };
            const response = await apiService.get('/users', { params });
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في البحث عن الموظفين'
            };
        }
    }

    /**
     * التحقق من صحة بيانات الموظف
     * @param {Object} userData - بيانات الموظف
     * @returns {Object} نتيجة التحقق
     */
    validateUserData(userData) {
        const errors = {};

        // التحقق من الاسم الكامل
        if (!userData.full_name || userData.full_name.trim().length < 2) {
            errors.full_name = 'الاسم الكامل مطلوب ويجب أن يكون أكثر من حرفين';
        }

        // التحقق من البريد الإلكتروني
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userData.email || !emailRegex.test(userData.email)) {
            errors.email = 'البريد الإلكتروني غير صحيح';
        }

        // التحقق من اسم المستخدم
        if (!userData.username || userData.username.length < 3) {
            errors.username = 'اسم المستخدم مطلوب ويجب أن يكون أكثر من 3 أحرف';
        }

        // التحقق من كلمة المرور (للإنشاء فقط)
        if (userData.password) {
            if (userData.password.length < 8) {
                errors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
                errors.password = 'كلمة المرور يجب أن تحتوي على حرف صغير وحرف كبير ورقم';
            }
        }

        // التحقق من رقم الهاتف
        if (userData.phone) {
            const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
            if (!phoneRegex.test(userData.phone)) {
                errors.phone = 'رقم الهاتف غير صحيح';
            }
        }

        // التحقق من الدور
        const validRoles = ['admin', 'manager', 'distributor', 'cashier', 'accountant'];
        if (!userData.role || !validRoles.includes(userData.role)) {
            errors.role = 'الدور غير صحيح';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * تنسيق بيانات الموظف للعرض
     * @param {Object} user - بيانات الموظف
     * @returns {Object} البيانات المنسقة
     */
    formatUserForDisplay(user) {
        return {
            ...user,
            displayName: user.full_name,
            displayRole: this.getRoleDisplayName(user.role),
            displayStatus: this.getStatusDisplayName(user.status),
            displayCreatedAt: new Date(user.created_at).toLocaleDateString('ar-SA'),
            displayLastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString('ar-SA') : 'لم يسجل دخول'
        };
    }

    /**
     * الحصول على اسم الدور بالعربية
     * @param {string} role - الدور
     * @returns {string} اسم الدور بالعربية
     */
    getRoleDisplayName(role) {
        const roleNames = {
            admin: 'مدير النظام',
            manager: 'مدير',
            distributor: 'موزع',
            cashier: 'كاشير',
            accountant: 'محاسب'
        };
        return roleNames[role] || role;
    }

    /**
     * الحصول على اسم الحالة بالعربية
     * @param {string} status - الحالة
     * @returns {string} اسم الحالة بالعربية
     */
    getStatusDisplayName(status) {
        const statusNames = {
            active: 'نشط',
            inactive: 'غير نشط',
            suspended: 'معلق',
            pending: 'في الانتظار'
        };
        return statusNames[status] || status;
    }

    /**
     * الحصول على لون الدور
     * @param {string} role - الدور
     * @returns {string} لون الدور
     */
    getRoleColor(role) {
        const roleColors = {
            admin: 'purple',
            manager: 'blue',
            distributor: 'orange',
            cashier: 'green',
            accountant: 'indigo'
        };
        return roleColors[role] || 'gray';
    }

    /**
     * الحصول على لون الحالة
     * @param {string} status - الحالة
     * @returns {string} لون الحالة
     */
    getStatusColor(status) {
        const statusColors = {
            active: 'green',
            inactive: 'red',
            suspended: 'yellow',
            pending: 'orange'
        };
        return statusColors[status] || 'gray';
    }
}

export default new UserService(); 
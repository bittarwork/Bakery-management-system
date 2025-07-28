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
     * الحصول على الموزعين فقط
     * @returns {Promise<Object>} استجابة API
     */
    async getDistributors() {
        try {
            const response = await apiService.get('/users', {
                params: { role: 'distributor' }
            });
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب بيانات الموزعين'
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

    /**
     * تحديث الملف الشخصي للمستخدم الحالي
     * @param {Object} profileData - بيانات الملف الشخصي
     * @returns {Promise<Object>} استجابة API
     */
    async updateProfile(profileData) {
        try {
            const response = await apiService.put('/users/profile', profileData);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تحديث الملف الشخصي'
            };
        }
    }

    /**
     * الحصول على المستخدمين حسب الدور
     * @param {string} role - الدور المطلوب
     * @returns {Promise<Object>} استجابة API
     */
    async getUsersByRole(role) {
        try {
            const response = await apiService.get(`/users?role=${role}`);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب المستخدمين حسب الدور'
            };
        }
    }

    // ===== DISTRIBUTOR-SPECIFIC METHODS =====

    /**
     * Get all distributors with performance data
     * @param {Object} filters - Optional filters
     * @returns {Promise<Object>} API response
     */
    async getDistributors(filters = {}) {
        try {
            const response = await apiService.get('/users/distributors', { params: filters });
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب بيانات الموزعين'
            };
        }
    }

    /**
     * Get distributor details with performance metrics
     * @param {number} id - Distributor ID
     * @returns {Promise<Object>} API response
     */
    async getDistributorDetails(id) {
        try {
            const response = await apiService.get(`/users/distributors/${id}/details`);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب تفاصيل الموزع'
            };
        }
    }

    /**
     * Update distributor work status and location
     * @param {number} id - Distributor ID
     * @param {Object} statusData - Status update data
     * @returns {Promise<Object>} API response
     */
    async updateDistributorStatus(id, statusData) {
        try {
            const response = await apiService.patch(`/users/distributors/${id}/status`, statusData);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تحديث حالة الموزع'
            };
        }
    }

    /**
     * Get distributor performance summary
     * @param {number} id - Distributor ID
     * @param {Object} filters - Date filters
     * @returns {Object} Performance summary
     */
    getDistributorPerformanceSummary(distributorData) {
        const performance = distributorData.performance_data || {};
        
        return {
            current_workload: performance.current_workload || 0,
            performance_rating: performance.performance_rating || 0,
            work_status: performance.work_status || 'offline',
            last_active: performance.last_active,
            location_status: performance.location_info?.current_location ? 'tracked' : 'not_tracked',
            summary: {
                workload_level: this.getWorkloadLevel(performance.current_workload || 0),
                performance_level: this.getPerformanceLevel(performance.performance_rating || 0),
                availability: this.getAvailabilityStatus(performance.work_status)
            }
        };
    }

    /**
     * Get workload level description
     * @param {number} workload - Current workload
     * @returns {Object} Workload level info
     */
    getWorkloadLevel(workload) {
        if (workload === 0) return { level: 'none', label: 'لا توجد مهام', color: 'gray' };
        if (workload <= 3) return { level: 'light', label: 'عبء خفيف', color: 'green' };
        if (workload <= 6) return { level: 'moderate', label: 'عبء متوسط', color: 'yellow' };
        if (workload <= 10) return { level: 'heavy', label: 'عبء كثيف', color: 'orange' };
        return { level: 'overloaded', label: 'محمّل بشدة', color: 'red' };
    }

    /**
     * Get performance level description
     * @param {number} rating - Performance rating
     * @returns {Object} Performance level info
     */
    getPerformanceLevel(rating) {
        if (rating >= 4.5) return { level: 'excellent', label: 'ممتاز', color: 'green' };
        if (rating >= 3.5) return { level: 'good', label: 'جيد', color: 'blue' };
        if (rating >= 2.5) return { level: 'average', label: 'متوسط', color: 'yellow' };
        if (rating >= 1.5) return { level: 'poor', label: 'ضعيف', color: 'orange' };
        return { level: 'very_poor', label: 'ضعيف جداً', color: 'red' };
    }

    /**
     * Get availability status info
     * @param {string} workStatus - Work status
     * @returns {Object} Availability info
     */
    getAvailabilityStatus(workStatus) {
        const statusMap = {
            'available': { label: 'متاح', color: 'green', priority: 1 },
            'busy': { label: 'مشغول', color: 'orange', priority: 2 },
            'break': { label: 'في استراحة', color: 'blue', priority: 3 },
            'offline': { label: 'غير متصل', color: 'gray', priority: 4 }
        };
        return statusMap[workStatus] || statusMap['offline'];
    }

    // ===== ADMIN-SPECIFIC METHODS =====

    /**
     * Get all admins and managers
     * @returns {Promise<Object>} API response
     */
    async getAdmins() {
        try {
            const response = await apiService.get('/users/admins');
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب بيانات المديرين'
            };
        }
    }

    /**
     * Get admin details with permissions
     * @param {number} id - Admin ID
     * @returns {Promise<Object>} API response
     */
    async getAdminDetails(id) {
        try {
            const response = await apiService.get(`/users/admins/${id}/details`);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في جلب تفاصيل المدير'
            };
        }
    }

    /**
     * Get admin permissions summary
     * @param {Array} permissions - Admin permissions
     * @returns {Object} Permissions summary
     */
    getAdminPermissionsSummary(permissions) {
        const permissionCategories = {
            user_management: { label: 'إدارة المستخدمين', category: 'users' },
            store_management: { label: 'إدارة المتاجر', category: 'stores' },
            product_management: { label: 'إدارة المنتجات', category: 'products' },
            order_management: { label: 'إدارة الطلبات', category: 'orders' },
            vehicle_management: { label: 'إدارة المركبات', category: 'vehicles' },
            financial_reports: { label: 'التقارير المالية', category: 'finance' },
            system_settings: { label: 'إعدادات النظام', category: 'system' },
            data_export: { label: 'تصدير البيانات', category: 'export' },
            user_creation: { label: 'إنشاء المستخدمين', category: 'users' },
            user_deletion: { label: 'حذف المستخدمين', category: 'users' }
        };

        const categorized = {};
        permissions.forEach(permission => {
            const permInfo = permissionCategories[permission];
            if (permInfo) {
                if (!categorized[permInfo.category]) {
                    categorized[permInfo.category] = [];
                }
                categorized[permInfo.category].push({
                    permission,
                    label: permInfo.label
                });
            }
        });

        return {
            total: permissions.length,
            categories: categorized,
            has_full_access: permissions.includes('full_access'),
            access_level: this.getAccessLevel(permissions)
        };
    }

    /**
     * Get access level based on permissions
     * @param {Array} permissions - User permissions
     * @returns {Object} Access level info
     */
    getAccessLevel(permissions) {
        if (permissions.includes('full_access')) {
            return { level: 'super_admin', label: 'مدير عام', color: 'purple' };
        }
        if (permissions.length >= 8) {
            return { level: 'admin', label: 'إداري كامل', color: 'blue' };
        }
        if (permissions.length >= 5) {
            return { level: 'manager', label: 'مدير', color: 'green' };
        }
        if (permissions.length >= 2) {
            return { level: 'supervisor', label: 'مشرف', color: 'orange' };
        }
        return { level: 'basic', label: 'أساسي', color: 'gray' };
    }

    // ===== ENHANCED UTILITY METHODS =====

    /**
     * Update user password
     * @param {number} id - User ID
     * @param {Object} passwordData - Password data
     * @returns {Promise<Object>} API response
     */
    async updateUserPassword(id, passwordData) {
        try {
            const response = await apiService.patch(`/users/${id}/password`, passwordData);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في تحديث كلمة المرور'
            };
        }
    }

    /**
     * Get user dashboard data based on role
     * @param {Object} user - User data
     * @returns {Object} Dashboard configuration
     */
    getUserDashboardConfig(user) {
        const configs = {
            admin: {
                defaultRoute: '/dashboard',
                allowedModules: ['users', 'stores', 'products', 'orders', 'vehicles', 'reports', 'settings'],
                quickActions: ['create-user', 'view-reports', 'system-settings', 'data-export'],
                widgets: ['users-overview', 'system-health', 'recent-activities', 'performance-metrics']
            },
            manager: {
                defaultRoute: '/dashboard',
                allowedModules: ['stores', 'products', 'orders', 'distributors', 'reports'],
                quickActions: ['create-order', 'manage-distributors', 'view-reports', 'store-management'],
                widgets: ['orders-overview', 'distributors-status', 'sales-metrics', 'store-performance']
            },
            distributor: {
                defaultRoute: '/deliveries',
                allowedModules: ['deliveries', 'orders', 'map', 'profile'],
                quickActions: ['update-location', 'view-route', 'report-issue', 'update-status'],
                widgets: ['assigned-orders', 'route-map', 'performance-summary', 'delivery-history']
            },
            cashier: {
                defaultRoute: '/sales',
                allowedModules: ['sales', 'products', 'customers', 'reports'],
                quickActions: ['new-sale', 'process-payment', 'view-products', 'daily-summary'],
                widgets: ['sales-today', 'popular-products', 'payment-methods', 'customer-stats']
            },
            accountant: {
                defaultRoute: '/finance',
                allowedModules: ['finance', 'reports', 'payments', 'expenses'],
                quickActions: ['financial-report', 'expense-entry', 'payment-tracking', 'reconciliation'],
                widgets: ['revenue-overview', 'expense-summary', 'payment-status', 'financial-trends']
            }
        };

        return configs[user.role] || configs.distributor;
    }

    /**
     * Format user data for different display contexts
     * @param {Object} user - Raw user data
     * @param {string} context - Display context (list, detail, card, etc.)
     * @returns {Object} Formatted user data
     */
    formatUserForContext(user, context = 'list') {
        const baseFormat = this.formatUserForDisplay(user);
        
        switch (context) {
            case 'card':
                return {
                    ...baseFormat,
                    initials: this.getUserInitials(user.full_name),
                    avatarColor: this.getAvatarColor(user.id),
                    roleInfo: {
                        label: this.getRoleDisplayName(user.role),
                        color: this.getRoleColor(user.role)
                    },
                    statusInfo: {
                        label: this.getStatusDisplayName(user.status),
                        color: this.getStatusColor(user.status)
                    }
                };
            
            case 'detail':
                return {
                    ...baseFormat,
                    dashboardConfig: this.getUserDashboardConfig(user),
                    rolePermissions: user.permissions || [],
                    lastActivity: this.formatLastActivity(user.last_login),
                    joinedDuration: this.getJoinedDuration(user.created_at)
                };
            
            default:
                return baseFormat;
        }
    }

    /**
     * Get user initials for avatar
     * @param {string} fullName - User's full name
     * @returns {string} User initials
     */
    getUserInitials(fullName) {
        return fullName
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    /**
     * Get avatar color based on user ID
     * @param {number} userId - User ID
     * @returns {string} Color class
     */
    getAvatarColor(userId) {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
        return colors[userId % colors.length];
    }

    /**
     * Format last activity display
     * @param {string} lastLogin - Last login timestamp
     * @returns {string} Formatted last activity
     */
    formatLastActivity(lastLogin) {
        if (!lastLogin) return 'لم يسجل دخول مطلقاً';
        
        const now = new Date();
        const loginDate = new Date(lastLogin);
        const diffInHours = Math.floor((now - loginDate) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'متصل الآن';
        if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
        if (diffInHours < 48) return 'البارحة';
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `منذ ${diffInDays} يوم`;
    }

    /**
     * Get joined duration
     * @param {string} createdAt - Creation timestamp
     * @returns {string} Joined duration
     */
    getJoinedDuration(createdAt) {
        const now = new Date();
        const joinDate = new Date(createdAt);
        const diffInDays = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
        
        if (diffInDays < 30) return `${diffInDays} يوم`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} شهر`;
        return `${Math.floor(diffInDays / 365)} سنة`;
    }

    /**
     * Advanced search users with multiple criteria
     * @param {Object} searchCriteria - Search criteria
     * @returns {Promise<Object>} API response
     */
    async advancedSearchUsers(searchCriteria) {
        try {
            const response = await apiService.post('/users/search', searchCriteria);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في البحث المتقدم'
            };
        }
    }

    /**
     * Bulk operations on users
     * @param {string} operation - Operation type
     * @param {Array} userIds - User IDs
     * @param {Object} data - Operation data
     * @returns {Promise<Object>} API response
     */
    async bulkUserOperation(operation, userIds, data = {}) {
        try {
            const response = await apiService.post('/users/bulk', {
                operation,
                user_ids: userIds,
                data
            });
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'خطأ في العملية الجماعية'
            };
        }
    }
}

export default new UserService(); 
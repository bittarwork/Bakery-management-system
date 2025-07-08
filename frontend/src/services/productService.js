import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// إنشاء instance للـ axios مع التكوين الأساسي
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// إضافة interceptor للتوكن
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// إضافة response interceptor للتعامل مع انتهاء صلاحية التوكن
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // إزالة التوكن المنتهي الصلاحية
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // إعادة توجيه لصفحة تسجيل الدخول
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// خدمة المنتجات
export const productService = {
    // الحصول على جميع المنتجات مع التصفية والبحث
    getProducts: async (params = {}) => {
        try {
            const response = await api.get('/products', { params });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // الحصول على منتج واحد
    getProduct: async (id) => {
        try {
            const response = await api.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // إنشاء منتج جديد
    createProduct: async (productData) => {
        try {
            const response = await api.post('/products', productData);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // تحديث منتج
    updateProduct: async (id, productData) => {
        try {
            const response = await api.put(`/products/${id}`, productData);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // حذف منتج
    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            return handleApiError(error);
        }
    },

    // تغيير حالة المنتج (تفعيل/إلغاء تفعيل)
    toggleProductStatus: async (id) => {
        try {
            const response = await api.patch(`/products/${id}/toggle-status`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // الحصول على إحصائيات المنتجات
    getProductStatistics: async () => {
        try {
            const response = await api.get('/products/stats');
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // البحث في المنتجات
    searchProducts: async (query) => {
        try {
            const response = await api.get('/products/search', {
                params: { q: query }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // الحصول على المنتجات النشطة فقط
    getActiveProducts: async () => {
        try {
            const response = await api.get('/products', {
                params: { is_active: true, limit: 1000 }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // حساب إجمالي السعر للكمية المحددة
    calculateTotal: (price, quantity) => {
        return Math.round(parseFloat(price) * parseInt(quantity) * 100) / 100;
    },

    // حساب الهامش الربحي
    calculateMargin: (price, cost) => {
        return Math.round((parseFloat(price) - parseFloat(cost)) * 100) / 100;
    },

    // حساب نسبة الهامش الربحي
    calculateMarginPercentage: (price, cost) => {
        if (parseFloat(cost) === 0) return 0;
        const marginPercentage = ((parseFloat(price) - parseFloat(cost)) / parseFloat(cost)) * 100;
        return Math.round(marginPercentage * 100) / 100;
    },

    // تنسيق السعر للعرض
    formatPrice: (price, currency = 'EUR') => {
        return `€${parseFloat(price).toFixed(2)}`;
    },

    // التحقق من صحة بيانات المنتج
    validateProduct: (productData) => {
        const errors = [];

        if (!productData.name || productData.name.trim().length < 2) {
            errors.push('اسم المنتج مطلوب ويجب أن يكون أكثر من حرفين');
        }

        if (!productData.unit || productData.unit.trim().length === 0) {
            errors.push('وحدة القياس مطلوبة');
        }

        if (productData.price === undefined || productData.price === null || productData.price < 0) {
            errors.push('السعر مطلوب ولا يمكن أن يكون سالباً');
        }

        if (productData.cost !== undefined && productData.cost !== null) {
            if (productData.cost < 0) {
                errors.push('التكلفة لا يمكن أن تكون سالبة');
            }

            if (parseFloat(productData.price) < parseFloat(productData.cost)) {
                errors.push('السعر لا يمكن أن يكون أقل من التكلفة');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

// دالة مساعدة للتعامل مع أخطاء API
const handleApiError = (error) => {
    if (error.response) {
        // الخطأ من الخادم مع response
        const { status, data } = error.response;

        if (status === 401) {
            // إزالة التوكن في حالة انتهاء الصلاحية
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        return {
            success: false,
            message: data.message || 'حدث خطأ غير متوقع',
            errors: data.errors || [],
            status
        };
    } else if (error.request) {
        // لا يوجد response من الخادم
        return {
            success: false,
            message: 'لا يمكن الاتصال بالخادم. تأكد من اتصال الإنترنت.',
            errors: [],
            status: 0
        };
    } else {
        // خطأ في إعداد الطلب
        return {
            success: false,
            message: error.message || 'حدث خطأ غير متوقع',
            errors: [],
            status: 0
        };
    }
};

export default productService; 
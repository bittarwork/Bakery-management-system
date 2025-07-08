import apiClient from './apiClient.js';

/**
 * خدمة API للطلبات
 * تحتوي على جميع العمليات المطلوبة لإدارة الطلبات
 */

// الحصول على جميع الطلبات مع التصفية والبحث
export const getOrders = async (params = {}) => {
    try {
        const response = await apiClient.get('/orders', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// الحصول على طلب واحد بالتفصيل
export const getOrder = async (id) => {
    try {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// إنشاء طلب جديد
export const createOrder = async (orderData) => {
    try {
        const response = await apiClient.post('/orders', orderData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// تحديث طلب موجود
export const updateOrder = async (id, orderData) => {
    try {
        const response = await apiClient.put(`/orders/${id}`, orderData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// حذف طلب
export const deleteOrder = async (id) => {
    try {
        const response = await apiClient.delete(`/orders/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// تحديث حالة الطلب
export const updateOrderStatus = async (id, status) => {
    try {
        const response = await apiClient.patch(`/orders/${id}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// تحديث حالة الدفع
export const updatePaymentStatus = async (id, paymentStatus) => {
    try {
        const response = await apiClient.patch(`/orders/${id}/payment-status`, {
            payment_status: paymentStatus
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// الحصول على طلبات اليوم
export const getTodayOrders = async () => {
    try {
        const response = await apiClient.get('/orders/today');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// الحصول على إحصائيات الطلبات
export const getOrderStatistics = async (params = {}) => {
    try {
        const response = await apiClient.get('/orders/statistics', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// دوال مساعدة للفلترة والبحث
export const buildOrdersParams = (filters) => {
    const params = {};

    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.storeId) params.store_id = filters.storeId;
    if (filters.dateFrom) params.date_from = filters.dateFrom;
    if (filters.dateTo) params.date_to = filters.dateTo;
    if (filters.status) params.status = filters.status;
    if (filters.paymentStatus) params.payment_status = filters.paymentStatus;
    if (filters.search) params.search = filters.search;

    return params;
};

// دوال لمعالجة بيانات الطلبات
export const formatOrderData = (formData) => {
    return {
        store_id: parseInt(formData.storeId),
        order_date: formData.orderDate,
        delivery_date: formData.deliveryDate || null,
        items: formData.items.map(item => ({
            product_id: parseInt(item.productId),
            quantity: parseInt(item.quantity),
            unit_price: parseFloat(item.unitPrice),
            discount_amount: parseFloat(item.discountAmount) || 0,
            gift_quantity: parseInt(item.giftQuantity) || 0,
            gift_reason: item.giftReason || null,
            notes: item.notes || null
        })),
        discount_amount: parseFloat(formData.discountAmount) || 0,
        notes: formData.notes || null
    };
};

// دوال للحصول على خيارات القوائم المنسدلة
export const getOrderStatusOptions = () => [
    { value: 'draft', label: 'مسودة', color: 'gray' },
    { value: 'confirmed', label: 'مؤكد', color: 'blue' },
    { value: 'in_progress', label: 'قيد التنفيذ', color: 'yellow' },
    { value: 'delivered', label: 'مُسلم', color: 'green' },
    { value: 'cancelled', label: 'ملغي', color: 'red' }
];

export const getPaymentStatusOptions = () => [
    { value: 'pending', label: 'معلق', color: 'gray' },
    { value: 'partial', label: 'جزئي', color: 'yellow' },
    { value: 'paid', label: 'مدفوع', color: 'green' },
    { value: 'overdue', label: 'متأخر', color: 'red' }
];

// دوال للتحقق من الصلاحيات
export const canEditOrder = (order) => {
    return ['draft', 'confirmed'].includes(order.status);
};

export const canCancelOrder = (order) => {
    return ['draft', 'confirmed'].includes(order.status);
};

export const canDeleteOrder = (order) => {
    return order.status === 'draft';
};

// دوال لحساب المجاميع
export const calculateOrderItemTotal = (item) => {
    const total = parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0);
    const discount = parseFloat(item.discountAmount || 0);
    return Math.max(0, total - discount);
};

export const calculateOrderTotal = (items, orderDiscount = 0) => {
    const itemsTotal = items.reduce((sum, item) => sum + calculateOrderItemTotal(item), 0);
    return Math.max(0, itemsTotal - parseFloat(orderDiscount || 0));
};

// دوال للتنسيق والعرض
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(amount);
};

export const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date(date));
};

export const formatDateTime = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
};

// دوال للتحقق من صحة البيانات
export const validateOrderForm = (formData) => {
    const errors = {};

    if (!formData.storeId) {
        errors.storeId = 'يجب اختيار المتجر';
    }

    if (!formData.orderDate) {
        errors.orderDate = 'يجب تحديد تاريخ الطلب';
    }

    if (!formData.items || formData.items.length === 0) {
        errors.items = 'يجب إضافة منتج واحد على الأقل';
    } else {
        formData.items.forEach((item, index) => {
            if (!item.productId) {
                errors[`items.${index}.productId`] = 'يجب اختيار المنتج';
            }
            if (!item.quantity || parseInt(item.quantity) <= 0) {
                errors[`items.${index}.quantity`] = 'يجب إدخال كمية صحيحة';
            }
            if (!item.unitPrice || parseFloat(item.unitPrice) < 0) {
                errors[`items.${index}.unitPrice`] = 'يجب إدخال سعر صحيح';
            }
        });
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// دوال للعمليات المجمعة
export const bulkUpdateOrderStatus = async (orderIds, status) => {
    try {
        const promises = orderIds.map(id => updateOrderStatus(id, status));
        const results = await Promise.all(promises);
        return {
            success: true,
            results,
            message: `تم تحديث حالة ${orderIds.length} طلب بنجاح`
        };
    } catch (error) {
        throw {
            success: false,
            message: 'فشل في تحديث بعض الطلبات',
            error
        };
    }
};

// دوال لإنتاج التقارير السريعة
export const generateOrdersSummary = (orders) => {
    const summary = {
        totalOrders: orders.length,
        totalAmount: 0,
        statusDistribution: {},
        paymentDistribution: {}
    };

    orders.forEach(order => {
        // إجمالي المبلغ
        summary.totalAmount += parseFloat(order.final_amount || 0);

        // توزيع الحالات
        summary.statusDistribution[order.status] =
            (summary.statusDistribution[order.status] || 0) + 1;

        // توزيع الدفعات
        summary.paymentDistribution[order.payment_status] =
            (summary.paymentDistribution[order.payment_status] || 0) + 1;
    });

    return summary;
};

// الحصول على طلب واحد بالتفصيل (alias for getOrder)
export const getOrderById = async (id) => {
    return await getOrder(id);
};

// تصدير الطلبات
export const exportOrders = async (params = {}) => {
    try {
        // Remove pagination parameters for export
        const exportParams = { ...params };
        delete exportParams.page;
        delete exportParams.limit;

        const response = await apiClient.get('/orders/export', {
            params: exportParams,
            responseType: 'blob'
        });

        // Create download link
        const today = new Date();
        const filename = `orders_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.csv`;

        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Export error:', error);
        throw error.response?.data || error;
    }
};

// دالة لتنسيق الأرقام
export const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
};

// تصدير جميع الدوال
export default {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    updatePaymentStatus,
    getTodayOrders,
    getOrderStatistics,
    buildOrdersParams,
    formatOrderData,
    getOrderStatusOptions,
    getPaymentStatusOptions,
    canEditOrder,
    canCancelOrder,
    canDeleteOrder,
    calculateOrderItemTotal,
    calculateOrderTotal,
    formatCurrency,
    formatDate,
    formatDateTime,
    validateOrderForm,
    bulkUpdateOrderStatus,
    generateOrdersSummary,
    getOrderById,
    exportOrders,
    formatNumber
}; 
import { create } from 'zustand';
import { productService } from '../services/productService.js';

export const useProductStore = create((set, get) => ({
    // الحالة الأساسية
    products: [],
    currentProduct: null,
    statistics: null,
    loading: false,
    error: null,

    // حالة التصفية والبحث
    filters: {
        search: '',
        is_active: null,
        sortBy: 'name',
        sortOrder: 'ASC'
    },

    // حالة الصفحات
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    },

    // العمليات الأساسية

    // جلب المنتجات
    fetchProducts: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const { filters, pagination } = get();
            const requestParams = {
                ...filters,
                page: pagination.page,
                limit: pagination.limit,
                ...params
            };

            const response = await productService.getProducts(requestParams);

            if (response.success) {
                set({
                    products: response.data.products,
                    pagination: response.data.pagination,
                    statistics: response.data.stats,
                    loading: false
                });
            } else {
                set({ error: response.message, loading: false });
            }
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // جلب منتج واحد
    fetchProduct: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await productService.getProduct(id);

            if (response.success) {
                set({ currentProduct: response.data, loading: false });
                return response.data;
            } else {
                set({ error: response.message, loading: false });
                return null;
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    // إنشاء منتج جديد
    createProduct: async (productData) => {
        set({ loading: true, error: null });
        const response = await productService.createProduct(productData);

        if (response && response.success) {
            // إعادة جلب المنتجات بعد الإنشاء
            await get().fetchProducts();
            set({ loading: false });
            return response;
        } else {
            set({ error: response?.message || 'حدث خطأ في إنشاء المنتج', loading: false });
            return response || { success: false, message: 'حدث خطأ في إنشاء المنتج' };
        }
    },

    // تحديث منتج
    updateProduct: async (id, productData) => {
        set({ loading: true, error: null });
        const response = await productService.updateProduct(id, productData);

        if (response && response.success) {
            // تحديث المنتج في القائمة
            const { products } = get();
            const updatedProducts = products.map(product =>
                product.id === id ? response.data : product
            );

            set({
                products: updatedProducts,
                currentProduct: response.data,
                loading: false
            });
            return response;
        } else {
            set({ error: response?.message || 'حدث خطأ في تحديث المنتج', loading: false });
            return response || { success: false, message: 'حدث خطأ في تحديث المنتج' };
        }
    },

    // حذف منتج
    deleteProduct: async (id) => {
        set({ loading: true, error: null });
        const response = await productService.deleteProduct(id);

        if (response && response.success) {
            // إزالة المنتج من القائمة
            const { products } = get();
            const filteredProducts = products.filter(product => product.id !== id);

            set({
                products: filteredProducts,
                loading: false
            });
            return response;
        } else {
            set({ error: response?.message || 'حدث خطأ في حذف المنتج', loading: false });
            return response || { success: false, message: 'حدث خطأ في حذف المنتج' };
        }
    },

    // تغيير حالة المنتج
    toggleProductStatus: async (id) => {
        set({ loading: true, error: null });
        const response = await productService.toggleProductStatus(id);

        if (response && response.success) {
            // تحديث حالة المنتج في القائمة
            const { products } = get();
            const updatedProducts = products.map(product =>
                product.id === id ? { ...product, is_active: !product.is_active } : product
            );

            set({
                products: updatedProducts,
                loading: false
            });
            return response;
        } else {
            set({ error: response?.message || 'حدث خطأ في تغيير حالة المنتج', loading: false });
            return response || { success: false, message: 'حدث خطأ في تغيير حالة المنتج' };
        }
    },

    // جلب الإحصائيات
    fetchStatistics: async () => {
        try {
            const response = await productService.getProductStatistics();

            if (response.success) {
                set({ statistics: response.data });
                return response.data;
            } else {
                set({ error: response.message });
                return null;
            }
        } catch (error) {
            set({ error: error.message });
            return null;
        }
    },

    // البحث في المنتجات
    searchProducts: async (query) => {
        set({ loading: true, error: null });
        try {
            const response = await productService.searchProducts(query);

            if (response.success) {
                set({
                    products: response.data,
                    loading: false
                });
                return response.data;
            } else {
                set({ error: response.message, loading: false });
                return [];
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            return [];
        }
    },

    // إدارة التصفية والبحث

    // تحديث الفلاتر
    updateFilters: (newFilters) => {
        const { filters } = get();
        set({
            filters: { ...filters, ...newFilters },
            pagination: { ...get().pagination, page: 1 } // إعادة تعيين الصفحة للأولى
        });
    },

    // تحديث صفحة التصفح
    updatePagination: (newPagination) => {
        const { pagination } = get();
        set({ pagination: { ...pagination, ...newPagination } });
    },

    // الانتقال للصفحة التالية
    nextPage: () => {
        const { pagination } = get();
        if (pagination.page < pagination.pages) {
            set({
                pagination: { ...pagination, page: pagination.page + 1 }
            });
        }
    },

    // الانتقال للصفحة السابقة
    prevPage: () => {
        const { pagination } = get();
        if (pagination.page > 1) {
            set({
                pagination: { ...pagination, page: pagination.page - 1 }
            });
        }
    },

    // الانتقال لصفحة محددة
    goToPage: (page) => {
        const { pagination } = get();
        if (page >= 1 && page <= pagination.pages) {
            set({
                pagination: { ...pagination, page }
            });
        }
    },

    // إعادة تعيين الحالة
    resetState: () => {
        set({
            products: [],
            currentProduct: null,
            statistics: null,
            loading: false,
            error: null,
            filters: {
                search: '',
                is_active: null,
                sortBy: 'name',
                sortOrder: 'ASC'
            },
            pagination: {
                page: 1,
                limit: 10,
                total: 0,
                pages: 0
            }
        });
    },

    // مسح الأخطاء
    clearError: () => {
        set({ error: null });
    },

    // تعيين منتج حالي
    setCurrentProduct: (product) => {
        set({ currentProduct: product });
    },

    // مسح المنتج الحالي
    clearCurrentProduct: () => {
        set({ currentProduct: null });
    },

    // دوال مساعدة للعمليات

    // الحصول على المنتجات النشطة فقط
    getActiveProducts: () => {
        const { products } = get();
        return products.filter(product => product.is_active);
    },

    // الحصول على المنتجات غير النشطة
    getInactiveProducts: () => {
        const { products } = get();
        return products.filter(product => !product.is_active);
    },

    // البحث المحلي في المنتجات
    filterProductsLocally: (searchTerm) => {
        const { products } = get();
        if (!searchTerm) return products;

        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    },

    // ترتيب المنتجات محلياً
    sortProductsLocally: (sortBy, sortOrder = 'ASC') => {
        const { products } = get();
        const sortedProducts = [...products].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'price':
                case 'cost':
                    aValue = parseFloat(a[sortBy]) || 0;
                    bValue = parseFloat(b[sortBy]) || 0;
                    break;
                case 'created_at':
                case 'updated_at':
                    aValue = new Date(a[sortBy]);
                    bValue = new Date(b[sortBy]);
                    break;
                default:
                    aValue = a[sortBy];
                    bValue = b[sortBy];
            }

            if (sortOrder.toLowerCase() === 'desc') {
                return aValue < bValue ? 1 : -1;
            } else {
                return aValue > bValue ? 1 : -1;
            }
        });

        set({ products: sortedProducts });
    }
})); 
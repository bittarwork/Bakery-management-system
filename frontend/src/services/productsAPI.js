import apiClient from './apiClient.js';

/**
 * خدمة API للمنتجات
 */

// الحصول على جميع المنتجات
export const getProducts = async (params = {}) => {
    try {
        const response = await apiClient.get('/products', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// الحصول على منتج واحد
export const getProduct = async (id) => {
    try {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// إنشاء منتج جديد
export const createProduct = async (productData) => {
    try {
        const response = await apiClient.post('/products', productData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// تحديث منتج
export const updateProduct = async (id, productData) => {
    try {
        const response = await apiClient.put(`/products/${id}`, productData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// حذف منتج
export const deleteProduct = async (id) => {
    try {
        const response = await apiClient.delete(`/products/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export default {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
}; 
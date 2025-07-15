import { apiService } from './apiService';

/**
 * Product Service
 * Handles all product-related API operations
 */
class ProductService {
    constructor() {
        this.baseEndpoint = '/products';
    }

    /**
     * Get all products with filtering and pagination
     * @param {Object} params - Query parameters
     * @returns {Promise} API response
     */
    async getProducts(params = {}) {
        try {
            const queryParams = {
                page: params.page || 1,
                limit: params.limit || 10,
                search: params.search || '',
                status: params.status || null,
                category: params.category || null,
                is_featured: params.is_featured || null,
                sortBy: params.sortBy || 'name',
                sortOrder: params.sortOrder || 'ASC'
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(this.baseEndpoint, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch products: ${error.message}`);
        }
    }

    /**
     * Get single product by ID
     * @param {number} id - Product ID
     * @returns {Promise} API response
     */
    async getProduct(id) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${id}`);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch product: ${error.message}`);
        }
    }

    /**
     * Create new product
     * @param {Object} productData - Product data
     * @returns {Promise} API response
     */
    async createProduct(productData) {
        try {
            const response = await apiService.post(this.baseEndpoint, productData);
            return response;
        } catch (error) {
            throw new Error(`Failed to create product: ${error.message}`);
        }
    }

    /**
     * Update product
     * @param {number} id - Product ID
     * @param {Object} productData - Updated product data
     * @returns {Promise} API response
     */
    async updateProduct(id, productData) {
        try {
            const response = await apiService.put(`${this.baseEndpoint}/${id}`, productData);
            return response;
        } catch (error) {
            throw new Error(`Failed to update product: ${error.message}`);
        }
    }

    /**
     * Delete product
     * @param {number} id - Product ID
     * @returns {Promise} API response
     */
    async deleteProduct(id) {
        try {
            const response = await apiService.delete(`${this.baseEndpoint}/${id}`);
            return response;
        } catch (error) {
            throw new Error(`Failed to delete product: ${error.message}`);
        }
    }

    /**
     * Toggle product status (active/inactive)
     * @param {number} id - Product ID
     * @returns {Promise} API response
     */
    async toggleProductStatus(id) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/${id}/toggle-status`);
            return response;
        } catch (error) {
            throw new Error(`Failed to toggle product status: ${error.message}`);
        }
    }

    /**
     * Get product statistics
     * @returns {Promise} API response
     */
    async getProductStatistics() {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/stats`);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch product statistics: ${error.message}`);
        }
    }

    /**
     * Search products
     * @param {string} query - Search query
     * @param {Object} filters - Additional filters
     * @returns {Promise} API response
     */
    async searchProducts(query, filters = {}) {
        try {
            const params = {
                q: query,
                ...filters
            };

            const response = await apiService.get(`${this.baseEndpoint}/search`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to search products: ${error.message}`);
        }
    }

    /**
     * Get product categories
     * @returns {Promise} API response
     */
    async getCategories() {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/categories`);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch categories: ${error.message}`);
        }
    }

    /**
     * Upload product image
     * @param {File} file - Image file
     * @param {number} productId - Product ID
     * @returns {Promise} API response
     */
    async uploadProductImage(file, productId) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await apiService.uploadFile(`${this.baseEndpoint}/${productId}/image`, formData);
            return response;
        } catch (error) {
            throw new Error(`Failed to upload product image: ${error.message}`);
        }
    }

    /**
     * Delete product image
     * @param {number} productId - Product ID
     * @returns {Promise} API response
     */
    async deleteProductImage(productId) {
        try {
            const response = await apiService.delete(`${this.baseEndpoint}/${productId}/image`);
            return response;
        } catch (error) {
            throw new Error(`Failed to delete product image: ${error.message}`);
        }
    }

    /**
     * Get product analytics
     * @param {number} productId - Product ID
     * @param {Object} params - Analytics parameters
     * @returns {Promise} API response
     */
    async getProductAnalytics(productId, params = {}) {
        try {
            const queryParams = {
                date_from: params.dateFrom || null,
                date_to: params.dateTo || null,
                period: params.period || 'month'
            };

            // Remove null values
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null) {
                    delete queryParams[key];
                }
            });

            const response = await apiService.get(`${this.baseEndpoint}/${productId}/analytics`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch product analytics: ${error.message}`);
        }
    }

    /**
     * Bulk operations on products
     * @param {Array} productIds - Array of product IDs
     * @param {string} action - Bulk action (delete, activate, deactivate)
     * @returns {Promise} API response
     */
    async bulkAction(productIds, action) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/bulk`, {
                product_ids: productIds,
                action: action
            });
            return response;
        } catch (error) {
            throw new Error(`Failed to perform bulk action: ${error.message}`);
        }
    }

    /**
     * Export products data
     * @param {Object} params - Export parameters
     * @returns {Promise} API response
     */
    async exportProducts(params = {}) {
        try {
            const response = await apiService.exportData(`${this.baseEndpoint}/export`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to export products: ${error.message}`);
        }
    }
}

// Create and export service instance
export const productService = new ProductService();

// Export specific methods for convenience
export const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getProductStatistics,
    searchProducts,
    getCategories,
    uploadProductImage,
    deleteProductImage,
    getProductAnalytics,
    bulkAction,
    exportProducts
} = productService;

export default productService; 
import { apiService } from './apiService';

/**
 * Product Service
 * Handles all product-related API operations with advanced features
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
                sortOrder: params.sortOrder || 'ASC',
                minPrice: params.minPrice || null,
                maxPrice: params.maxPrice || null,
                lowStock: params.lowStock || null
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
            // Log the data being sent for debugging
            console.log('[FRONTEND] Sending product data:', JSON.stringify(productData, null, 2));

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
     * Toggle product featured status
     * @param {number} id - Product ID
     * @returns {Promise} API response
     */
    async toggleProductFeatured(id) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/${id}/toggle-featured`);
            return response;
        } catch (error) {
            throw new Error(`Failed to toggle product featured status: ${error.message}`);
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
     * Get product categories with statistics
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
     * Create new category
     * @param {Object} categoryData - Category data
     * @returns {Promise} API response
     */
    async createCategory(categoryData) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/categories`, categoryData);
            return response;
        } catch (error) {
            throw new Error(`Failed to create category: ${error.message}`);
        }
    }

    /**
     * Update category
     * @param {number} id - Category ID
     * @param {Object} categoryData - Updated category data
     * @returns {Promise} API response
     */
    async updateCategory(id, categoryData) {
        try {
            const response = await apiService.put(`${this.baseEndpoint}/categories/${id}`, categoryData);
            return response;
        } catch (error) {
            throw new Error(`Failed to update category: ${error.message}`);
        }
    }

    /**
     * Delete category
     * @param {number} id - Category ID
     * @returns {Promise} API response
     */
    async deleteCategory(id) {
        try {
            const response = await apiService.delete(`${this.baseEndpoint}/categories/${id}`);
            return response;
        } catch (error) {
            throw new Error(`Failed to delete category: ${error.message}`);
        }
    }

    /**
     * Get category analytics
     * @param {number} categoryId - Category ID
     * @param {Object} params - Analytics parameters
     * @returns {Promise} API response
     */
    async getCategoryAnalytics(categoryId, params = {}) {
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

            const response = await apiService.get(`${this.baseEndpoint}/categories/${categoryId}/analytics`, queryParams);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch category analytics: ${error.message}`);
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

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            const response = await apiService.post(`${this.baseEndpoint}/${productId}/image`, formData, config);
            return response;
        } catch (error) {
            throw new Error(`Failed to upload product image: ${error.message}`);
        }
    }

    /**
     * Upload multiple product images
     * @param {FileList} files - Image files
     * @param {number} productId - Product ID
     * @returns {Promise} API response
     */
    async uploadProductImages(files, productId) {
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            const response = await apiService.post(`${this.baseEndpoint}/${productId}/images`, formData, config);
            return response;
        } catch (error) {
            throw new Error(`Failed to upload product images: ${error.message}`);
        }
    }

    /**
     * Delete product image
     * @param {number} productId - Product ID
     * @param {number} imageId - Image ID
     * @returns {Promise} API response
     */
    async deleteProductImage(productId, imageId) {
        try {
            const response = await apiService.delete(`${this.baseEndpoint}/${productId}/images/${imageId}`);
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
     * Get product performance metrics
     * @param {number} productId - Product ID
     * @param {Object} params - Performance parameters
     * @returns {Promise} API response
     */
    async getProductPerformance(productId, params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${productId}/performance`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch product performance: ${error.message}`);
        }
    }

    /**
     * Get product sales history
     * @param {number} productId - Product ID
     * @param {Object} params - Sales parameters
     * @returns {Promise} API response
     */
    async getProductSalesHistory(productId, params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${productId}/sales`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch product sales history: ${error.message}`);
        }
    }

    /**
     * Get product inventory tracking
     * @param {number} productId - Product ID
     * @param {Object} params - Inventory parameters
     * @returns {Promise} API response
     */
    async getProductInventory(productId, params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${productId}/inventory`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch product inventory: ${error.message}`);
        }
    }

    /**
     * Update product stock
     * @param {number} productId - Product ID
     * @param {Object} stockData - Stock update data
     * @returns {Promise} API response
     */
    async updateProductStock(productId, stockData) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/${productId}/stock`, stockData);
            return response;
        } catch (error) {
            throw new Error(`Failed to update product stock: ${error.message}`);
        }
    }

    /**
     * Bulk operations on products
     * @param {Array} productIds - Array of product IDs
     * @param {string} action - Bulk action (delete, activate, deactivate, feature, unfeature)
     * @param {Object} additionalData - Additional data for bulk action
     * @returns {Promise} API response
     */
    async bulkAction(productIds, action, additionalData = {}) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/bulk`, {
                product_ids: productIds,
                action: action,
                ...additionalData
            });
            return response;
        } catch (error) {
            throw new Error(`Failed to perform bulk action: ${error.message}`);
        }
    }

    /**
     * Bulk update product prices
     * @param {Array} productIds - Array of product IDs
     * @param {Object} priceData - Price update data
     * @returns {Promise} API response
     */
    async bulkUpdatePrices(productIds, priceData) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/bulk/prices`, {
                product_ids: productIds,
                ...priceData
            });
            return response;
        } catch (error) {
            throw new Error(`Failed to bulk update prices: ${error.message}`);
        }
    }

    /**
     * Bulk update product categories
     * @param {Array} productIds - Array of product IDs
     * @param {string} categoryId - New category ID
     * @returns {Promise} API response
     */
    async bulkUpdateCategory(productIds, categoryId) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/bulk/category`, {
                product_ids: productIds,
                category_id: categoryId
            });
            return response;
        } catch (error) {
            throw new Error(`Failed to bulk update category: ${error.message}`);
        }
    }

    /**
     * Export products data
     * @param {Object} params - Export parameters
     * @returns {Promise} API response
     */
    async exportProducts(params = {}) {
        try {
            const { format = 'csv', filters = {}, ...otherParams } = params;

            // Combine format and filters into query parameters
            const queryParams = {
                format,
                ...filters,
                ...otherParams
            };

            const queryString = new URLSearchParams(queryParams).toString();
            const response = await apiService.exportData(`${this.baseEndpoint}/export?${queryString}`, format, 'products');
            return response;
        } catch (error) {
            throw new Error(`Failed to export products: ${error.message}`);
        }
    }

    /**
     * Import products data
     * @param {File} file - Import file
     * @param {Object} options - Import options
     * @returns {Promise} API response
     */
    async importProducts(file, options = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('options', JSON.stringify(options));

            const response = await apiService.uploadFile(`${this.baseEndpoint}/import`, formData);
            return response;
        } catch (error) {
            throw new Error(`Failed to import products: ${error.message}`);
        }
    }

    /**
     * Get low stock products
     * @param {Object} params - Filter parameters
     * @returns {Promise} API response
     */
    async getLowStockProducts(params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/low-stock`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch low stock products: ${error.message}`);
        }
    }

    /**
     * Get popular products
     * @param {Object} params - Filter parameters
     * @returns {Promise} API response
     */
    async getPopularProducts(params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/popular`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch popular products: ${error.message}`);
        }
    }

    /**
     * Get product recommendations
     * @param {number} productId - Product ID
     * @param {Object} params - Recommendation parameters
     * @returns {Promise} API response
     */
    async getProductRecommendations(productId, params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${productId}/recommendations`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch product recommendations: ${error.message}`);
        }
    }

    /**
     * Get product pricing history
     * @param {number} productId - Product ID
     * @param {Object} params - Price history parameters
     * @returns {Promise} API response
     */
    async getProductPriceHistory(productId, params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${productId}/price-history`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch product price history: ${error.message}`);
        }
    }

    /**
     * Duplicate product
     * @param {number} productId - Product ID to duplicate
     * @param {Object} newData - New product data
     * @returns {Promise} API response
     */
    async duplicateProduct(productId, newData = {}) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/${productId}/duplicate`, newData);
            return response;
        } catch (error) {
            throw new Error(`Failed to duplicate product: ${error.message}`);
        }
    }

    /**
     * Get product variants (if any)
     * @param {number} productId - Product ID
     * @returns {Promise} API response
     */
    async getProductVariants(productId) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${productId}/variants`);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch product variants: ${error.message}`);
        }
    }

    /**
     * Create product variant
     * @param {number} productId - Product ID
     * @param {Object} variantData - Variant data
     * @returns {Promise} API response
     */
    async createProductVariant(productId, variantData) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/${productId}/variants`, variantData);
            return response;
        } catch (error) {
            throw new Error(`Failed to create product variant: ${error.message}`);
        }
    }

    /**
     * Archive product (soft delete)
     * @param {number} productId - Product ID
     * @returns {Promise} API response
     */
    async archiveProduct(productId) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/${productId}/archive`);
            return response;
        } catch (error) {
            throw new Error(`Failed to archive product: ${error.message}`);
        }
    }

    /**
     * Restore archived product
     * @param {number} productId - Product ID
     * @returns {Promise} API response
     */
    async restoreProduct(productId) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/${productId}/restore`);
            return response;
        } catch (error) {
            throw new Error(`Failed to restore product: ${error.message}`);
        }
    }

    /**
     * Get product reviews (if integrated)
     * @param {number} productId - Product ID
     * @param {Object} params - Review parameters
     * @returns {Promise} API response
     */
    async getProductReviews(productId, params = {}) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${productId}/reviews`, params);
            return response;
        } catch (error) {
            throw new Error(`Failed to fetch product reviews: ${error.message}`);
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
    toggleProductFeatured,
    getProductStatistics,
    searchProducts,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryAnalytics,
    uploadProductImage,
    uploadProductImages,
    deleteProductImage,
    getProductAnalytics,
    getProductPerformance,
    getProductSalesHistory,
    getProductInventory,
    updateProductStock,
    bulkAction,
    bulkUpdatePrices,
    bulkUpdateCategory,
    exportProducts,
    importProducts,
    getLowStockProducts,
    getPopularProducts,
    getProductRecommendations,
    getProductPriceHistory,
    duplicateProduct,
    getProductVariants,
    createProductVariant,
    archiveProduct,
    restoreProduct,
    getProductReviews
} = productService;

export default productService; 
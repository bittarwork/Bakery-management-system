import { apiService } from './apiService';

class StoreService {
    constructor() {
        this.apiService = apiService;
    }

    // Get all stores with optional filters
    async getStores(params = {}) {
        const queryParams = new URLSearchParams();

        if (params.status) queryParams.append('status', params.status);
        if (params.region) queryParams.append('region', params.region);
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        const url = `/stores${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return this.apiService.get(url);
    }

    // Get single store by ID
    async getStore(id) {
        return this.apiService.get(`/stores/${id}`);
    }

    // Create new store
    async createStore(storeData) {
        return this.apiService.post('/stores', storeData);
    }

    // Update store
    async updateStore(id, storeData) {
        return this.apiService.put(`/stores/${id}`, storeData);
    }

    // Delete store
    async deleteStore(id) {
        return this.apiService.delete(`/stores/${id}`);
    }

    // Get store statistics
    async getStoreStatistics(id) {
        return this.apiService.get(`/stores/${id}/statistics`);
    }

    // Get stores map data
    async getStoresMap() {
        return this.apiService.get('/stores/map');
    }

    // Get nearby stores
    async getNearbyStores(latitude, longitude, radius = 10) {
        const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            radius: radius.toString()
        });
        return this.apiService.get(`/stores/nearby?${params.toString()}`);
    }

    // Get store orders
    async getStoreOrders(storeId, params = {}) {
        const queryParams = new URLSearchParams();

        if (params.status) queryParams.append('status', params.status);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const url = `/stores/${storeId}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return this.apiService.get(url);
    }

    // Get store payments
    async getStorePayments(storeId, params = {}) {
        const queryParams = new URLSearchParams();

        if (params.status) queryParams.append('status', params.status);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        const url = `/stores/${storeId}/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return this.apiService.get(url);
    }

    // Get store analytics
    async getStoreAnalytics(storeId, period = 'month') {
        return this.apiService.get(`/stores/${storeId}/analytics?period=${period}`);
    }

    // Update store status
    async updateStoreStatus(id, status) {
        return this.apiService.patch(`/stores/${id}/status`, { status });
    }

    // Get store performance metrics
    async getStorePerformance(storeId, dateRange = {}) {
        const params = new URLSearchParams();

        if (dateRange.startDate) params.append('startDate', dateRange.startDate);
        if (dateRange.endDate) params.append('endDate', dateRange.endDate);

        const url = `/stores/${storeId}/performance${params.toString() ? `?${params.toString()}` : ''}`;
        return this.apiService.get(url);
    }

    // Validate store data
    validateStoreData(data) {
        const errors = {};

        if (!data.name || data.name.trim().length < 2) {
            errors.name = 'Store name must be at least 2 characters long';
        }

        if (data.phone && !/^\+?[0-9\s\-\(\)]{7,20}$/.test(data.phone)) {
            errors.phone = 'Invalid phone number format';
        }

        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'Invalid email format';
        }

        if (data.latitude && (isNaN(data.latitude) || data.latitude < -90 || data.latitude > 90)) {
            errors.latitude = 'Invalid latitude value';
        }

        if (data.longitude && (isNaN(data.longitude) || data.longitude < -180 || data.longitude > 180)) {
            errors.longitude = 'Invalid longitude value';
        }

        if (data.credit_limit && (isNaN(data.credit_limit) || data.credit_limit < 0)) {
            errors.credit_limit = 'Credit limit must be a positive number';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Format store data for API
    formatStoreData(data) {
        return {
            name: data.name?.trim(),
            address: data.address?.trim(),
            phone: data.phone?.trim() || null,
            email: data.email?.trim() || null,
            contact_person: data.contact_person?.trim() || null,
            region: data.region || null,
            payment_method: data.payment_method || 'cash',
            credit_limit: data.credit_limit ? parseFloat(data.credit_limit) : null,
            latitude: data.latitude ? parseFloat(data.latitude) : null,
            longitude: data.longitude ? parseFloat(data.longitude) : null,
            notes: data.notes?.trim() || null,
            status: data.status || 'active'
        };
    }
}

export default new StoreService(); 
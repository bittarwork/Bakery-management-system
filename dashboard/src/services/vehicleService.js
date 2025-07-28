import apiService from './apiService';

class VehicleService {
    constructor() {
        this.baseEndpoint = '/vehicles';
    }

    // Get all vehicles with filters and pagination
    async getAllVehicles(filters = {}) {
        try {
            const params = new URLSearchParams();
            
            // Add filters to params
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);
            if (filters.status) params.append('status', filters.status);
            if (filters.vehicle_type) params.append('vehicle_type', filters.vehicle_type);
            if (filters.assigned !== undefined) params.append('assigned', filters.assigned);
            if (filters.search) params.append('search', filters.search);

            const queryString = params.toString();
            const endpoint = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;
            
            const response = await apiService.get(endpoint);
            return response;
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            return { success: false, error: error.message };
        }
    }

    // Get vehicle by ID
    async getVehicleById(id) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching vehicle details:', error);
            return { success: false, error: error.message };
        }
    }

    // Create new vehicle
    async createVehicle(vehicleData) {
        try {
            // Validate required fields
            const requiredFields = ['vehicle_type', 'vehicle_model', 'vehicle_plate', 'vehicle_year'];
            for (const field of requiredFields) {
                if (!vehicleData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            const response = await apiService.post(this.baseEndpoint, vehicleData);
            return response;
        } catch (error) {
            console.error('Error creating vehicle:', error);
            return { success: false, error: error.message };
        }
    }

    // Update vehicle
    async updateVehicle(id, vehicleData) {
        try {
            const response = await apiService.put(`${this.baseEndpoint}/${id}`, vehicleData);
            return response;
        } catch (error) {
            console.error('Error updating vehicle:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete vehicle
    async deleteVehicle(id) {
        try {
            const response = await apiService.delete(`${this.baseEndpoint}/${id}`);
            return response;
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            return { success: false, error: error.message };
        }
    }

    // Assign vehicle to distributor
    async assignVehicle(vehicleId, distributorId) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/${vehicleId}/assign`, {
                distributor_id: distributorId
            });
            return response;
        } catch (error) {
            console.error('Error assigning vehicle:', error);
            return { success: false, error: error.message };
        }
    }

    // Unassign vehicle from distributor
    async unassignVehicle(vehicleId) {
        try {
            const response = await apiService.post(`${this.baseEndpoint}/${vehicleId}/unassign`);
            return response;
        } catch (error) {
            console.error('Error unassigning vehicle:', error);
            return { success: false, error: error.message };
        }
    }

    // Get available vehicles
    async getAvailableVehicles() {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/available`);
            return response;
        } catch (error) {
            console.error('Error fetching available vehicles:', error);
            return { success: false, error: error.message };
        }
    }

    // Get vehicles by distributor
    async getVehiclesByDistributor(distributorId) {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/distributor/${distributorId}`);
            return response;
        } catch (error) {
            console.error('Error fetching distributor vehicles:', error);
            return { success: false, error: error.message };
        }
    }

    // Get vehicle statistics
    async getVehicleStatistics() {
        try {
            const response = await apiService.get(`${this.baseEndpoint}/statistics`);
            return response;
        } catch (error) {
            console.error('Error fetching vehicle statistics:', error);
            return { success: false, error: error.message };
        }
    }

    // Update vehicle status
    async updateVehicleStatus(id, status) {
        try {
            const response = await apiService.patch(`${this.baseEndpoint}/${id}/status`, { status });
            return response;
        } catch (error) {
            console.error('Error updating vehicle status:', error);
            return { success: false, error: error.message };
        }
    }

    // Record vehicle expense (using existing distribution API)
    async recordVehicleExpense(expenseData) {
        try {
            const response = await apiService.post('/distribution/expense/record', expenseData);
            return response;
        } catch (error) {
            console.error('Error recording vehicle expense:', error);
            return { success: false, error: error.message };
        }
    }

    // Helper methods for vehicle info
    getVehicleTypeInfo(vehicleType) {
        const vehicleTypes = {
            car: { 
                label: 'سيارة', 
                icon: '🚗', 
                capacity: 'صغيرة',
                description: 'مناسبة للتوزيع السريع والمساحات الضيقة'
            },
            van: { 
                label: 'فان', 
                icon: '🚐', 
                capacity: 'متوسطة',
                description: 'الخيار الأمثل لتوزيع المخبوزات'
            },
            truck: { 
                label: 'شاحنة', 
                icon: '🚛', 
                capacity: 'كبيرة',
                description: 'للطلبات الكبيرة والمسافات الطويلة'
            },
            motorcycle: { 
                label: 'دراجة نارية', 
                icon: '🏍️', 
                capacity: 'محدودة جداً',
                description: 'للتوصيل السريع والطرق الضيقة'
            }
        };

        return vehicleTypes[vehicleType] || { 
            label: vehicleType, 
            icon: '🚐', 
            capacity: 'غير محدد',
            description: 'نوع مركبة غير معروف'
        };
    }

    getStatusInfo(status) {
        const statusMap = {
            active: { 
                label: 'نشطة', 
                color: 'green', 
                icon: '✅',
                description: 'جاهزة للعمل'
            },
            maintenance: { 
                label: 'صيانة', 
                color: 'yellow', 
                icon: '🔧',
                description: 'تحت الصيانة'
            },
            inactive: { 
                label: 'غير نشطة', 
                color: 'gray', 
                icon: '⏸️',
                description: 'متوقفة مؤقتاً'
            },
            retired: { 
                label: 'متقاعدة', 
                color: 'red', 
                icon: '🚫',
                description: 'خارج الخدمة نهائياً'
            }
        };

        return statusMap[status] || { 
            label: status, 
            color: 'gray', 
            icon: '❓',
            description: 'حالة غير معروفة'
        };
    }

    getFuelTypeInfo(fuelType) {
        const fuelTypes = {
            gasoline: { 
                label: 'بنزين', 
                icon: '⛽', 
                color: 'blue',
                avgConsumption: '8-12 لتر/100كم'
            },
            diesel: { 
                label: 'ديزل', 
                icon: '🛢️', 
                color: 'orange',
                avgConsumption: '6-9 لتر/100كم'
            },
            electric: { 
                label: 'كهربائي', 
                icon: '🔋', 
                color: 'green',
                avgConsumption: '15-25 كيلوواط/100كم'
            },
            hybrid: { 
                label: 'هجين', 
                icon: '⚡', 
                color: 'purple',
                avgConsumption: '4-7 لتر/100كم'
            }
        };

        return fuelTypes[fuelType] || { 
            label: fuelType, 
            icon: '⛽', 
            color: 'gray',
            avgConsumption: 'غير محدد'
        };
    }
}

const vehicleService = new VehicleService();
export default vehicleService; 
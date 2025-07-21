/**
 * Distributor Service
 * Handles distributor management, assignments, and analytics
 * Phase 6 - Complete Order Management
 */

import apiService from './apiService';

class DistributorService {
    /**
     * Get all distributors with pagination and filtering
     */
    async getDistributors(params = {}) {
        const {
            page = 1,
            limit = 10,
            status = 'active',
            search
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            status
        });

        if (search) {
            queryParams.append('search', search);
        }

        return await apiService.get(`/distributors?${queryParams}`);
    }

    /**
     * Get available distributors for assignment
     */
    async getAvailableDistributors(params = {}) {
        const { date, exclude_order_id } = params;

        const queryParams = new URLSearchParams();
        if (date) {
            queryParams.append('date', date);
        }
        if (exclude_order_id) {
            queryParams.append('exclude_order_id', exclude_order_id.toString());
        }

        return await apiService.get(`/distributors/available?${queryParams}`);
    }

    /**
     * Assign distributor to order(s)
     */
    async assignDistributor(assignmentData) {
        return await apiService.post('/distributors/assign', assignmentData);
    }

    /**
     * Bulk assign distributors to multiple orders
     */
    async bulkAssignDistributors(assignments) {
        return await apiService.post('/distributors/assign-bulk', {
            assignments
        });
    }

    /**
     * Get distributor assignments
     */
    async getDistributorAssignments(params = {}) {
        const {
            distributor_id,
            order_id,
            status,
            date_from,
            date_to,
            page = 1,
            limit = 10
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });

        if (distributor_id) {
            queryParams.append('distributor_id', distributor_id.toString());
        }
        if (order_id) {
            queryParams.append('order_id', order_id.toString());
        }
        if (status) {
            queryParams.append('status', status);
        }
        if (date_from) {
            queryParams.append('date_from', date_from);
        }
        if (date_to) {
            queryParams.append('date_to', date_to);
        }

        return await apiService.get(`/distributors/assignments?${queryParams}`);
    }

    /**
     * Update assignment status
     */
    async updateAssignmentStatus(assignmentId, statusData) {
        return await apiService.put(`/distributors/assignments/${assignmentId}/status`, statusData);
    }

    /**
     * Cancel distributor assignment
     */
    async cancelAssignment(assignmentId, reason) {
        return await apiService.delete(`/distributors/assignments/${assignmentId}`, {
            data: { reason }
        });
    }

    /**
     * Get distributor performance analytics
     */
    async getDistributorAnalytics(distributorId, params = {}) {
        const { date_from, date_to } = params;

        const queryParams = new URLSearchParams();
        if (date_from) {
            queryParams.append('date_from', date_from);
        }
        if (date_to) {
            queryParams.append('date_to', date_to);
        }

        return await apiService.get(`/distributors/${distributorId}/analytics?${queryParams}`);
    }

    /**
     * Get distributor assignment history
     */
    async getDistributorHistory(distributorId, params = {}) {
        const {
            page = 1,
            limit = 10,
            status,
            date_from,
            date_to
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });

        if (status) {
            queryParams.append('status', status);
        }
        if (date_from) {
            queryParams.append('date_from', date_from);
        }
        if (date_to) {
            queryParams.append('date_to', date_to);
        }

        return await apiService.get(`/distributors/${distributorId}/history?${queryParams}`);
    }

    /**
     * Get distributor workload calendar
     */
    async getDistributorCalendar(distributorId, params = {}) {
        const { month, year } = params;

        const queryParams = new URLSearchParams();
        if (month) {
            queryParams.append('month', month.toString());
        }
        if (year) {
            queryParams.append('year', year.toString());
        }

        return await apiService.get(`/distributors/${distributorId}/calendar?${queryParams}`);
    }

    /**
     * Helper method to format assignment status
     */
    getAssignmentStatusInfo(status) {
        const statusMap = {
            'assigned': {
                label: 'معين',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200'
            },
            'in_progress': {
                label: 'قيد التنفيذ',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200'
            },
            'completed': {
                label: 'مكتمل',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200'
            },
            'cancelled': {
                label: 'ملغي',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200'
            }
        };

        return statusMap[status] || {
            label: status,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
        };
    }

    /**
     * Helper method to format delivery priority
     */
    getDeliveryPriorityInfo(priority) {
        const priorityMap = {
            'low': {
                label: 'منخفضة',
                color: 'text-gray-600',
                bgColor: 'bg-gray-50',
                icon: '⬇'
            },
            'normal': {
                label: 'عادية',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                icon: '➡'
            },
            'high': {
                label: 'عالية',
                color: 'text-orange-600',
                bgColor: 'bg-orange-50',
                icon: '⬆'
            },
            'urgent': {
                label: 'عاجلة',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                icon: '🚨'
            }
        };

        return priorityMap[priority] || priorityMap['normal'];
    }

    /**
     * Helper method to calculate performance score color
     */
    getPerformanceScoreColor(score) {
        if (score >= 90) {
            return 'text-green-600';
        } else if (score >= 80) {
            return 'text-blue-600';
        } else if (score >= 70) {
            return 'text-yellow-600';
        } else if (score >= 60) {
            return 'text-orange-600';
        } else {
            return 'text-red-600';
        }
    }

    /**
     * Helper method to format availability status
     */
    getAvailabilityStatusInfo(status) {
        const statusMap = {
            'available': {
                label: 'متاح',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                icon: '✅'
            },
            'busy': {
                label: 'مشغول',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                icon: '⏳'
            },
            'overloaded': {
                label: 'محمل بالزيادة',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                icon: '⚠️'
            }
        };

        return statusMap[status] || statusMap['available'];
    }

    /**
     * Helper method to format delay information
     */
    getDelayInfo(delayDays) {
        if (delayDays === null || delayDays === undefined) {
            return {
                status: 'unknown',
                text: 'غير محدد',
                color: 'text-gray-600'
            };
        }

        if (delayDays <= 0) {
            return {
                status: 'on_time',
                text: 'في الوقت المحدد',
                color: 'text-green-600'
            };
        } else if (delayDays <= 1) {
            return {
                status: 'slight_delay',
                text: `تأخير ${delayDays} يوم`,
                color: 'text-yellow-600'
            };
        } else {
            return {
                status: 'major_delay',
                text: `تأخير ${delayDays} أيام`,
                color: 'text-red-600'
            };
        }
    }

    /**
     * Validate assignment data
     */
    validateAssignmentData(assignmentData) {
        const errors = [];

        if (!assignmentData.order_ids || assignmentData.order_ids.length === 0) {
            errors.push('يجب تحديد طلب واحد على الأقل');
        }

        if (!assignmentData.distributor_id) {
            errors.push('يجب اختيار موزع');
        }

        if (assignmentData.estimated_delivery) {
            const deliveryDate = new Date(assignmentData.estimated_delivery);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (deliveryDate < today) {
                errors.push('تاريخ التسليم المتوقع لا يمكن أن يكون في الماضي');
            }
        }

        return errors;
    }

    /**
     * Generate assignment summary text
     */
    generateAssignmentSummary(assignment) {
        const priorityInfo = this.getDeliveryPriorityInfo(assignment.delivery_priority);
        const statusInfo = this.getAssignmentStatusInfo(assignment.status);

        return `${assignment.distributor_name} - ${statusInfo.label} - أولوية ${priorityInfo.label}`;
    }

    /**
     * Format assignment data for display
     */
    formatAssignmentForDisplay(assignment) {
        return {
            ...assignment,
            statusInfo: this.getAssignmentStatusInfo(assignment.status),
            priorityInfo: this.getDeliveryPriorityInfo(assignment.delivery_priority),
            delayInfo: this.getDelayInfo(assignment.delivery_delay_days),
            vehicle_info: assignment.vehicle_info ?
                (typeof assignment.vehicle_info === 'string' ?
                    JSON.parse(assignment.vehicle_info) : assignment.vehicle_info) : null,
            route_info: assignment.route_info ?
                (typeof assignment.route_info === 'string' ?
                    JSON.parse(assignment.route_info) : assignment.route_info) : null
        };
    }

    /**
     * Calculate estimated delivery time based on distance and traffic
     */
    calculateEstimatedDelivery(baseTime, distance = 0, trafficFactor = 1.0) {
        // Basic calculation: base time + travel time
        const travelMinutes = Math.round(distance * 2 * trafficFactor); // 2 minutes per km with traffic factor
        const estimatedTime = new Date(baseTime.getTime() + (travelMinutes * 60 * 1000));

        return estimatedTime;
    }

    /**
     * Get suggested distributors based on workload and location
     */
    getSuggestedDistributors(distributors, orderLocation = null) {
        return distributors
            .filter(d => d.availability.status !== 'overloaded')
            .sort((a, b) => {
                // Sort by availability status first
                const availabilityOrder = { 'available': 0, 'busy': 1, 'overloaded': 2 };
                const statusDiff = availabilityOrder[a.availability.status] - availabilityOrder[b.availability.status];

                if (statusDiff !== 0) return statusDiff;

                // Then by current assignments (lower is better)
                const assignmentDiff = a.availability.current_assignments - b.availability.current_assignments;

                if (assignmentDiff !== 0) return assignmentDiff;

                // Then by performance score (higher is better)
                return b.performance_score - a.performance_score;
            });
    }

    /**
     * Export report as PDF
     */
    async exportReport(reportId) {
        return await apiService.get(`/distributors/reports/${reportId}/export`, {
            responseType: 'blob'
        });
    }

    /**
     * Generate new report
     */
    async generateReport(reportData) {
        return await apiService.post('/distributors/reports/generate', reportData);
    }

    /**
     * Get distributor performance comparison
     */
    async getPerformanceComparison(params = {}) {
        const {
            date_from,
            date_to,
            distributor_ids
        } = params;

        const queryParams = new URLSearchParams();
        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (distributor_ids) queryParams.append('distributor_ids', distributor_ids.join(','));

        return await apiService.get(`/distributors/performance/comparison?${queryParams}`);
    }

    /**
     * Get distribution route optimization
     */
    async getRouteOptimization(params = {}) {
        const {
            orders,
            distributor_id,
            vehicle_capacity
        } = params;

        return await apiService.post('/distributors/routes/optimize', {
            orders,
            distributor_id,
            vehicle_capacity
        });
    }

    /**
     * Update distributor location
     */
    async updateLocation(distributorId, locationData) {
        return await apiService.post(`/distributors/${distributorId}/location`, locationData);
    }

    /**
     * Get distributor availability
     */
    async getAvailability(distributorId, params = {}) {
        const {
            date,
            time_slot
        } = params;

        const queryParams = new URLSearchParams();
        if (date) queryParams.append('date', date);
        if (time_slot) queryParams.append('time_slot', time_slot);

        return await apiService.get(`/distributors/${distributorId}/availability?${queryParams}`);
    }

    /**
     * Set distributor availability
     */
    async setAvailability(distributorId, availabilityData) {
        return await apiService.post(`/distributors/${distributorId}/availability`, availabilityData);
    }

    /**
     * Get delivery predictions
     */
    async getDeliveryPredictions(params = {}) {
        const {
            order_id,
            distributor_id,
            route_data
        } = params;

        return await apiService.post('/distributors/delivery/predictions', {
            order_id,
            distributor_id,
            route_data
        });
    }

    /**
     * Get real-time tracking data
     */
    async getRealTimeTracking(distributorId) {
        return await apiService.get(`/distributors/${distributorId}/tracking/realtime`);
    }

    /**
     * Send notification to distributor
     */
    async sendNotification(distributorId, notificationData) {
        return await apiService.post(`/distributors/${distributorId}/notifications`, notificationData);
    }

    /**
     * Get distributor workload analysis
     */
    async getWorkloadAnalysis(distributorId, params = {}) {
        const {
            date_from,
            date_to,
            include_details
        } = params;

        const queryParams = new URLSearchParams();
        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (include_details) queryParams.append('include_details', include_details);

        return await apiService.get(`/distributors/${distributorId}/workload/analysis?${queryParams}`);
    }

    /**
     * Get distribution efficiency metrics
     */
    async getEfficiencyMetrics(params = {}) {
        const {
            date_from,
            date_to,
            distributor_id,
            metric_type
        } = params;

        const queryParams = new URLSearchParams();
        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (distributor_id) queryParams.append('distributor_id', distributor_id);
        if (metric_type) queryParams.append('metric_type', metric_type);

        return await apiService.get(`/distributors/efficiency/metrics?${queryParams}`);
    }

    /**
     * Get customer satisfaction data
     */
    async getCustomerSatisfaction(params = {}) {
        const {
            distributor_id,
            date_from,
            date_to,
            rating_min
        } = params;

        const queryParams = new URLSearchParams();
        if (distributor_id) queryParams.append('distributor_id', distributor_id);
        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (rating_min) queryParams.append('rating_min', rating_min);

        return await apiService.get(`/distributors/satisfaction?${queryParams}`);
    }

    /**
     * Get delivery time analytics
     */
    async getDeliveryTimeAnalytics(params = {}) {
        const {
            distributor_id,
            date_from,
            date_to,
            time_unit
        } = params;

        const queryParams = new URLSearchParams();
        if (distributor_id) queryParams.append('distributor_id', distributor_id);
        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (time_unit) queryParams.append('time_unit', time_unit);

        return await apiService.get(`/distributors/delivery-time/analytics?${queryParams}`);
    }

    /**
     * Get cost analysis
     */
    async getCostAnalysis(params = {}) {
        const {
            distributor_id,
            date_from,
            date_to,
            cost_type
        } = params;

        const queryParams = new URLSearchParams();
        if (distributor_id) queryParams.append('distributor_id', distributor_id);
        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (cost_type) queryParams.append('cost_type', cost_type);

        return await apiService.get(`/distributors/cost/analysis?${queryParams}`);
    }

    /**
     * Get route optimization suggestions
     */
    async getRouteSuggestions(params = {}) {
        const {
            orders,
            current_location,
            vehicle_type,
            constraints
        } = params;

        return await apiService.post('/distributors/routes/suggestions', {
            orders,
            current_location,
            vehicle_type,
            constraints
        });
    }

    /**
     * Get weather impact analysis
     */
    async getWeatherImpact(params = {}) {
        const {
            location,
            date,
            delivery_type
        } = params;

        const queryParams = new URLSearchParams();
        if (location) queryParams.append('location', location);
        if (date) queryParams.append('date', date);
        if (delivery_type) queryParams.append('delivery_type', delivery_type);

        return await apiService.get(`/distributors/weather/impact?${queryParams}`);
    }

    /**
     * Get traffic analysis
     */
    async getTrafficAnalysis(params = {}) {
        const {
            route,
            time_slot,
            day_of_week
        } = params;

        return await apiService.post('/distributors/traffic/analysis', {
            route,
            time_slot,
            day_of_week
        });
    }

    /**
     * Get fuel consumption analysis
     */
    async getFuelConsumptionAnalysis(distributorId, params = {}) {
        const {
            date_from,
            date_to,
            vehicle_id
        } = params;

        const queryParams = new URLSearchParams();
        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (vehicle_id) queryParams.append('vehicle_id', vehicle_id);

        return await apiService.get(`/distributors/${distributorId}/fuel/consumption?${queryParams}`);
    }

    /**
     * Get maintenance schedule
     */
    async getMaintenanceSchedule(distributorId, params = {}) {
        const {
            vehicle_id,
            include_history
        } = params;

        const queryParams = new URLSearchParams();
        if (vehicle_id) queryParams.append('vehicle_id', vehicle_id);
        if (include_history) queryParams.append('include_history', include_history);

        return await apiService.get(`/distributors/${distributorId}/maintenance/schedule?${queryParams}`);
    }

    /**
     * Get insurance and compliance data
     */
    async getInsuranceCompliance(distributorId) {
        return await apiService.get(`/distributors/${distributorId}/insurance/compliance`);
    }

    /**
     * Get training and certification status
     */
    async getTrainingStatus(distributorId) {
        return await apiService.get(`/distributors/${distributorId}/training/status`);
    }

    /**
     * Get equipment and tools inventory
     */
    async getEquipmentInventory(distributorId) {
        return await apiService.get(`/distributors/${distributorId}/equipment/inventory`);
    }

    /**
     * Get communication history
     */
    async getCommunicationHistory(distributorId, params = {}) {
        const {
            date_from,
            date_to,
            communication_type
        } = params;

        const queryParams = new URLSearchParams();
        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (communication_type) queryParams.append('communication_type', communication_type);

        return await apiService.get(`/distributors/${distributorId}/communication/history?${queryParams}`);
    }

    /**
     * Get emergency contacts
     */
    async getEmergencyContacts(distributorId) {
        return await apiService.get(`/distributors/${distributorId}/emergency/contacts`);
    }

    /**
     * Get backup distributor suggestions
     */
    async getBackupDistributors(params = {}) {
        const {
            area,
            availability_time,
            required_skills
        } = params;

        return await apiService.post('/distributors/backup/suggestions', {
            area,
            availability_time,
            required_skills
        });
    }

    /**
     * Get quality assurance metrics
     */
    async getQualityAssuranceMetrics(distributorId, params = {}) {
        const {
            date_from,
            date_to,
            quality_type
        } = params;

        const queryParams = new URLSearchParams();
        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (quality_type) queryParams.append('quality_type', quality_type);

        return await apiService.get(`/distributors/${distributorId}/quality/assurance?${queryParams}`);
    }

    /**
     * Get sustainability metrics
     */
    async getSustainabilityMetrics(distributorId, params = {}) {
        const {
            date_from,
            date_to,
            metric_type
        } = params;

        const queryParams = new URLSearchParams();
        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (metric_type) queryParams.append('metric_type', metric_type);

        return await apiService.get(`/distributors/${distributorId}/sustainability/metrics?${queryParams}`);
    }
}

export default new DistributorService(); 
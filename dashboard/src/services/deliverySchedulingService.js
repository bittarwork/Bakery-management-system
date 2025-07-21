/**
 * Enhanced Delivery Scheduling Service  
 * Handles advanced delivery scheduling with calendar integration, live tracking, and capacity management
 * Updated to use the new comprehensive delivery scheduling API
 */

import apiService from './apiService';

class DeliverySchedulingService {
    /**
     * Get delivery schedules (list or calendar view)
     */
    async getDeliverySchedules(params = {}) {
        const {
            page = 1,
            limit = 10,
            date_from,
            date_to,
            status,
            time_slot,
            delivery_type,
            view = 'list',
            search,
            distributor_id
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            view
        });

        // Add optional parameters
        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (status) queryParams.append('status', status);
        if (time_slot) queryParams.append('time_slot', time_slot);
        if (delivery_type) queryParams.append('delivery_type', delivery_type);
        if (search) queryParams.append('search', search);
        if (distributor_id) queryParams.append('distributor_id', distributor_id);

        return await apiService.request('GET', `/delivery/schedules?${queryParams}`);
    }

    /**
     * Create new delivery schedule
     */
    async createDeliverySchedule(scheduleData) {
        return await apiService.request('POST', '/delivery/schedules', scheduleData);
    }

    /**
     * Update existing delivery schedule
     */
    async updateDeliverySchedule(id, scheduleData) {
        return await apiService.request('PUT', `/delivery/schedules/${id}`, scheduleData);
    }

    /**
     * Reschedule delivery
     */
    async rescheduleDelivery(id, rescheduleData) {
        return await apiService.request('POST', `/delivery/schedules/${id}/reschedule`, rescheduleData);
    }

    /**
     * Cancel delivery schedule
     */
    async cancelDeliverySchedule(id, reason) {
        return await apiService.request('DELETE', `/delivery/schedules/${id}`, { reason });
    }

    /**
     * Get delivery capacity information
     */
    async getDeliveryCapacity(params = {}) {
        const {
            start_date,
            end_date,
            time_slot,
            include_suggestions = true
        } = params;

        const queryParams = new URLSearchParams();
        if (start_date) queryParams.append('start_date', start_date);
        if (end_date) queryParams.append('end_date', end_date);
        if (time_slot) queryParams.append('time_slot', time_slot);
        if (include_suggestions) queryParams.append('include_suggestions', include_suggestions.toString());

        return await apiService.request('GET', `/delivery/capacity?${queryParams}`);
    }

    /**
     * Update delivery capacity
     */
    async updateDeliveryCapacity(capacityData) {
        return await apiService.request('POST', '/delivery/capacity', capacityData);
    }

    /**
     * Check time slot availability
     */
    async checkTimeSlotAvailability(params = {}) {
        const {
            date,
            time_start,
            time_end,
            exclude_id
        } = params;

        const queryParams = new URLSearchParams();
        if (date) queryParams.append('date', date);
        if (time_start) queryParams.append('time_start', time_start);
        if (time_end) queryParams.append('time_end', time_end);
        if (exclude_id) queryParams.append('exclude_id', exclude_id.toString());

        return await apiService.request('GET', `/delivery/schedules/availability?${queryParams}`);
    }

    /**
     * Get live delivery tracking
     */
    async getLiveDeliveryTracking(params = {}) {
        const {
            distributor_id,
            date,
            active_only = true
        } = params;

        const queryParams = new URLSearchParams();
        if (distributor_id) queryParams.append('distributor_id', distributor_id);
        if (date) queryParams.append('date', date);
        if (active_only) queryParams.append('active_only', active_only.toString());

        return await apiService.request('GET', `/delivery/tracking/live?${queryParams}`);
    }

    /**
     * Update delivery tracking status
     */
    async updateDeliveryTrackingStatus(id, statusData) {
        return await apiService.request('PUT', `/delivery/tracking/${id}/status`, statusData);
    }

    /**
     * Update delivery tracking location
     */
    async updateDeliveryTrackingLocation(id, locationData) {
        return await apiService.request('POST', `/delivery/tracking/${id}/location`, locationData);
    }

    /**
     * Get delivery analytics
     */
    async getDeliveryAnalytics(params = {}) {
        const {
            start_date,
            end_date,
            distributor_id,
            include_trends = true,
            include_performance = true
        } = params;

        const queryParams = new URLSearchParams();
        if (start_date) queryParams.append('start_date', start_date);
        if (end_date) queryParams.append('end_date', end_date);
        if (distributor_id) queryParams.append('distributor_id', distributor_id);
        if (include_trends) queryParams.append('include_trends', include_trends.toString());
        if (include_performance) queryParams.append('include_performance', include_performance.toString());

        return await apiService.request('GET', `/delivery/schedules/analytics?${queryParams}`);
    }

    /**
     * Export delivery schedules
     */
    async exportDeliverySchedules(params = {}) {
        const {
            format = 'excel',
            date_from,
            date_to,
            status,
            distributor_id
        } = params;

        const queryParams = new URLSearchParams({ format });
        if (date_from) queryParams.append('date_from', date_from);
        if (date_to) queryParams.append('date_to', date_to);
        if (status) queryParams.append('status', status);
        if (distributor_id) queryParams.append('distributor_id', distributor_id);

        return await apiService.request('GET', `/delivery/schedules/export?${queryParams}`, null, {
            responseType: 'blob'
        });
    }

    /**
     * Confirm delivery with token
     */
    async confirmDelivery(token) {
        return await apiService.request('POST', `/delivery/schedules/confirm/${token}`);
    }

    /**
     * Get delivery schedule by ID
     */
    async getDeliveryScheduleById(id) {
        return await apiService.request('GET', `/delivery/schedules/${id}`);
    }

    /**
     * Bulk update delivery schedules
     */
    async bulkUpdateSchedules(updates) {
        return await apiService.request('POST', '/delivery/schedules/bulk-update', { updates });
    }

    /**
     * Helper method to format schedule status
     */
    getScheduleStatusInfo(status) {
        const statusMap = {
            'scheduled': {
                label: 'مجدول',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                icon: '📅'
            },
            'confirmed': {
                label: 'مؤكد',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                icon: '✅'
            },
            'in_progress': {
                label: 'قيد التنفيذ',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                icon: '🚚'
            },
            'delivered': {
                label: 'تم التسليم',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                icon: '✅'
            },
            'missed': {
                label: 'فائت',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                icon: '❌'
            },
            'rescheduled': {
                label: 'معاد جدولته',
                color: 'text-orange-600',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                icon: '🔄'
            }
        };

        return statusMap[status] || {
            label: status,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            icon: '❓'
        };
    }

    /**
     * Helper method to format time slot info
     */
    getTimeSlotInfo(timeSlot) {
        const slotMap = {
            'morning': {
                label: 'صباحي',
                time: '9:00 - 12:00',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                icon: '🌅'
            },
            'afternoon': {
                label: 'مسائي',
                time: '14:00 - 17:00',
                color: 'text-orange-600',
                bgColor: 'bg-orange-50',
                icon: '☀️'
            },
            'evening': {
                label: 'مسائي متأخر',
                time: '18:00 - 21:00',
                color: 'text-purple-600',
                bgColor: 'bg-purple-50',
                icon: '🌇'
            },
            'custom': {
                label: 'مخصص',
                time: 'حسب التحديد',
                color: 'text-gray-600',
                bgColor: 'bg-gray-50',
                icon: '⏰'
            }
        };

        return slotMap[timeSlot] || slotMap['custom'];
    }

    /**
     * Helper method to format delivery type info
     */
    getDeliveryTypeInfo(deliveryType) {
        const typeMap = {
            'standard': {
                label: 'عادي',
                description: 'تسليم عادي خلال ساعات العمل',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                icon: '📦'
            },
            'express': {
                label: 'سريع',
                description: 'تسليم سريع خلال ساعتين',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                icon: '⚡'
            },
            'scheduled': {
                label: 'مجدول',
                description: 'تسليم في وقت محدد',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                icon: '📅'
            },
            'pickup': {
                label: 'استلام',
                description: 'استلام من المحل',
                color: 'text-purple-600',
                bgColor: 'bg-purple-50',
                icon: '🏪'
            }
        };

        return typeMap[deliveryType] || typeMap['standard'];
    }

    /**
     * Helper method to calculate capacity percentage color
     */
    getCapacityColor(percentage) {
        if (percentage >= 90) {
            return 'text-red-600';
        } else if (percentage >= 75) {
            return 'text-orange-600';
        } else if (percentage >= 50) {
            return 'text-yellow-600';
        } else {
            return 'text-green-600';
        }
    }

    /**
     * Helper function to format schedule data for calendar display
     */
    formatScheduleForCalendar(schedule) {
        return {
            id: schedule.id,
            title: `${schedule.order?.order_number || schedule.order_id} - ${schedule.contact_person || 'غير محدد'}`,
            date: schedule.scheduled_date,
            start: schedule.scheduled_time_start,
            end: schedule.scheduled_time_end,
            status: schedule.status,
            color: this.getStatusColor(schedule.status),
            backgroundColor: this.getStatusBackgroundColor(schedule.status),
            borderColor: this.getStatusBorderColor(schedule.status),
            data: schedule
        };
    }

    /**
     * Helper function to get status color
     */
    getStatusColor(status) {
        const colors = {
            'scheduled': 'text-blue-600',
            'confirmed': 'text-green-600',
            'in_progress': 'text-yellow-600',
            'delivered': 'text-emerald-600',
            'missed': 'text-red-600',
            'cancelled': 'text-gray-600',
            'rescheduled': 'text-purple-600'
        };
        return colors[status] || 'text-gray-600';
    }

    /**
     * Helper function to get status background color
     */
    getStatusBackgroundColor(status) {
        const colors = {
            'scheduled': 'bg-blue-50',
            'confirmed': 'bg-green-50',
            'in_progress': 'bg-yellow-50',
            'delivered': 'bg-emerald-50',
            'missed': 'bg-red-50',
            'cancelled': 'bg-gray-50',
            'rescheduled': 'bg-purple-50'
        };
        return colors[status] || 'bg-gray-50';
    }

    /**
     * Helper function to get status border color
     */
    getStatusBorderColor(status) {
        const colors = {
            'scheduled': 'border-blue-200',
            'confirmed': 'border-green-200',
            'in_progress': 'border-yellow-200',
            'delivered': 'border-emerald-200',
            'missed': 'border-red-200',
            'cancelled': 'border-gray-200',
            'rescheduled': 'border-purple-200'
        };
        return colors[status] || 'border-gray-200';
    }

    /**
     * Helper function to format status for display
     */
    formatStatusForDisplay(status) {
        const statusLabels = {
            'scheduled': 'مجدول',
            'confirmed': 'مؤكد',
            'in_progress': 'جاري التسليم',
            'delivered': 'تم التسليم',
            'missed': 'فات الموعد',
            'cancelled': 'ملغي',
            'rescheduled': 'معاد جدولته'
        };
        return statusLabels[status] || status;
    }

    /**
     * Helper function to format time slot for display
     */
    formatTimeSlotForDisplay(timeSlot) {
        const slotLabels = {
            'morning': 'صباحي (9:00-12:00)',
            'afternoon': 'بعد الظهر (12:00-17:00)',
            'evening': 'مسائي (17:00-20:00)',
            'custom': 'مخصص'
        };
        return slotLabels[timeSlot] || timeSlot;
    }

    /**
     * Helper function to format delivery type for display
     */
    formatDeliveryTypeForDisplay(deliveryType) {
        const typeLabels = {
            'standard': 'عادي',
            'express': 'سريع',
            'scheduled': 'مجدول',
            'pickup': 'استلام'
        };
        return typeLabels[deliveryType] || deliveryType;
    }

    /**
     * Helper function to format priority for display
     */
    formatPriorityForDisplay(priority) {
        const priorityLabels = {
            'low': 'منخفض',
            'normal': 'عادي',
            'high': 'عالي',
            'urgent': 'عاجل'
        };
        return priorityLabels[priority] || priority;
    }

    /**
     * Helper function to calculate delivery metrics
     */
    calculateDeliveryMetrics(schedules) {
        const total = schedules.length;
        const completed = schedules.filter(s => s.status === 'delivered').length;
        const pending = schedules.filter(s => ['scheduled', 'confirmed', 'in_progress'].includes(s.status)).length;
        const missed = schedules.filter(s => s.status === 'missed').length;
        const cancelled = schedules.filter(s => s.status === 'cancelled').length;

        return {
            total,
            completed,
            pending,
            missed,
            cancelled,
            completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
            missedRate: total > 0 ? ((missed / total) * 100).toFixed(1) : 0
        };
    }

    /**
     * Helper function to validate schedule data
     */
    validateScheduleData(scheduleData) {
        const errors = [];

        if (!scheduleData.order_id) {
            errors.push('معرف الطلب مطلوب');
        }

        if (!scheduleData.scheduled_date) {
            errors.push('تاريخ التسليم مطلوب');
        }

        if (!scheduleData.scheduled_time_start) {
            errors.push('وقت بداية التسليم مطلوب');
        }

        if (scheduleData.scheduled_date && new Date(scheduleData.scheduled_date) < new Date().setHours(0, 0, 0, 0)) {
            errors.push('تاريخ التسليم لا يمكن أن يكون في الماضي');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Helper method to generate suggested time slots
     */
    generateSuggestedTimeSlots(date, existingSchedules = []) {
        const baseSlots = [
            { slot: 'morning', start: '09:00', end: '12:00' },
            { slot: 'afternoon', start: '14:00', end: '17:00' },
            { slot: 'evening', start: '18:00', end: '21:00' }
        ];

        return baseSlots.map(slot => {
            const occupiedCount = existingSchedules.filter(s =>
                s.time_slot === slot.slot &&
                s.scheduled_date === date
            ).length;

            return {
                ...slot,
                occupied_count: occupiedCount,
                availability: occupiedCount < 10 ? 'available' : 'full',
                suggested: occupiedCount < 5
            };
        }).sort((a, b) => a.occupied_count - b.occupied_count);
    }

    /**
     * Helper method to format schedule for calendar display
     */
    formatScheduleForCalendar(schedule) {
        const statusInfo = this.getScheduleStatusInfo(schedule.status);
        const typeInfo = this.getDeliveryTypeInfo(schedule.delivery_type);

        return {
            id: schedule.id,
            title: `${schedule.order_number}`,
            date: schedule.scheduled_date,
            start: schedule.scheduled_time_start,
            end: schedule.scheduled_time_end,
            color: statusInfo.color,
            backgroundColor: statusInfo.bgColor,
            borderColor: statusInfo.borderColor,
            extendedProps: {
                order_id: schedule.order_id,
                order_number: schedule.order_number,
                status: schedule.status,
                delivery_type: schedule.delivery_type,
                contact_person: schedule.contact_person,
                contact_phone: schedule.contact_phone,
                delivery_address: schedule.delivery_address,
                delivery_fee: schedule.delivery_fee_eur,
                statusInfo,
                typeInfo
            }
        };
    }

    /**
     * Helper method to calculate delivery statistics summary
     */
    calculateStatisticsSummary(statistics) {
        const overall = statistics.overall_stats || {};

        return {
            total_schedules: overall.total_schedules || 0,
            completion_rate: overall.completion_rate || 0,
            missed_rate: overall.missed_rate || 0,
            total_revenue: overall.total_delivery_revenue || 0,
            avg_fee: overall.avg_delivery_fee || 0,
            performance_score: Math.round(
                ((overall.completion_rate || 0) * 0.7) +
                (((100 - (overall.missed_rate || 0)) * 0.3))
            )
        };
    }

    /**
     * Helper method to get next available time slots
     */
    getNextAvailableSlots(capacityData, maxSlots = 5) {
        if (!capacityData.suggested_slots) return [];

        return capacityData.suggested_slots
            .slice(0, maxSlots)
            .map(slot => ({
                date: slot.suggested_date,
                time_slot: slot.suggested_time_slot,
                start_time: slot.start_time,
                end_time: slot.end_time,
                available_capacity: slot.available_capacity,
                label: `${slot.suggested_date} - ${this.getTimeSlotInfo(slot.suggested_time_slot).label}`,
                formatted_date: new Date(slot.suggested_date).toLocaleDateString('ar-AE'),
                is_today: slot.suggested_date === new Date().toISOString().split('T')[0],
                is_tomorrow: slot.suggested_date === new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }));
    }

    /**
     * Helper method to generate confirmation URL
     */
    generateConfirmationUrl(token, baseUrl = window.location.origin) {
        return `${baseUrl}/delivery/confirm/${token}`;
    }

    /**
     * Helper method to format duration in minutes to hours and minutes
     */
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} دقيقة`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (remainingMinutes === 0) {
            return `${hours} ساعة`;
        }

        return `${hours} ساعة و ${remainingMinutes} دقيقة`;
    }
}

export default new DeliverySchedulingService(); 
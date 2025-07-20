/**
 * Delivery Scheduling Service
 * Handles advanced delivery scheduling with calendar integration
 * Phase 6 - Complete Order Management
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
            view = 'list'
        } = params;

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            view
        });

        if (date_from) {
            queryParams.append('date_from', date_from);
        }
        if (date_to) {
            queryParams.append('date_to', date_to);
        }
        if (status) {
            queryParams.append('status', status);
        }
        if (time_slot) {
            queryParams.append('time_slot', time_slot);
        }
        if (delivery_type) {
            queryParams.append('delivery_type', delivery_type);
        }

        return await apiService.get(`/delivery/schedules?${queryParams}`);
    }

    /**
     * Create delivery schedule
     */
    async createDeliverySchedule(scheduleData) {
        return await apiService.post('/delivery/schedules', scheduleData);
    }

    /**
     * Update delivery schedule
     */
    async updateDeliverySchedule(scheduleId, scheduleData) {
        return await apiService.put(`/delivery/schedules/${scheduleId}`, scheduleData);
    }

    /**
     * Reschedule delivery
     */
    async rescheduleDelivery(scheduleId, rescheduleData) {
        return await apiService.post(`/delivery/schedules/${scheduleId}/reschedule`, rescheduleData);
    }

    /**
     * Cancel delivery schedule
     */
    async cancelDeliverySchedule(scheduleId, reason) {
        return await apiService.delete(`/delivery/schedules/${scheduleId}`, {
            data: { cancellation_reason: reason }
        });
    }

    /**
     * Get delivery capacity and availability
     */
    async getDeliveryCapacity(params = {}) {
        const {
            date_from,
            date_to,
            time_slot,
            max_deliveries_per_slot = 10
        } = params;

        const queryParams = new URLSearchParams({
            max_deliveries_per_slot: max_deliveries_per_slot.toString()
        });

        if (date_from) {
            queryParams.append('date_from', date_from);
        }
        if (date_to) {
            queryParams.append('date_to', date_to);
        }
        if (time_slot) {
            queryParams.append('time_slot', time_slot);
        }

        return await apiService.get(`/delivery/capacity?${queryParams}`);
    }

    /**
     * Check time slot availability
     */
    async checkTimeSlotAvailability(availabilityData) {
        return await apiService.post('/delivery/check-availability', availabilityData);
    }

    /**
     * Confirm delivery schedule by customer
     */
    async confirmDeliverySchedule(token, customerNotes = '') {
        return await apiService.post(`/delivery/schedules/confirm/${token}`, {
            customer_notes: customerNotes
        });
    }

    /**
     * Get delivery schedule by confirmation token (for customer view)
     */
    async getDeliveryScheduleByToken(token) {
        return await apiService.get(`/delivery/schedules/confirm/${token}`);
    }

    /**
     * Get delivery schedule statistics
     */
    async getDeliveryStatistics(params = {}) {
        const { date_from, date_to } = params;

        const queryParams = new URLSearchParams();
        if (date_from) {
            queryParams.append('date_from', date_from);
        }
        if (date_to) {
            queryParams.append('date_to', date_to);
        }

        return await apiService.get(`/delivery/schedules/statistics?${queryParams}`);
    }

    /**
     * Get delivery performance metrics
     */
    async getDeliveryPerformance(params = {}) {
        const { date_from, date_to, time_slot, delivery_type } = params;

        const queryParams = new URLSearchParams();
        if (date_from) {
            queryParams.append('date_from', date_from);
        }
        if (date_to) {
            queryParams.append('date_to', date_to);
        }
        if (time_slot) {
            queryParams.append('time_slot', time_slot);
        }
        if (delivery_type) {
            queryParams.append('delivery_type', delivery_type);
        }

        return await apiService.get(`/delivery/performance?${queryParams}`);
    }

    /**
     * Bulk create delivery schedules
     */
    async bulkCreateSchedules(schedulesData) {
        return await apiService.post('/delivery/schedules/bulk-create', {
            schedules_data: schedulesData
        });
    }

    /**
     * Bulk reschedule deliveries
     */
    async bulkRescheduleDeliveries(scheduleUpdates) {
        return await apiService.post('/delivery/schedules/bulk-reschedule', {
            schedule_updates: scheduleUpdates
        });
    }

    /**
     * Get optimized delivery routes for a date
     */
    async getOptimizedDeliveryRoutes(params = {}) {
        const { date, distributor_id } = params;

        const queryParams = new URLSearchParams();
        if (date) {
            queryParams.append('date', date);
        }
        if (distributor_id) {
            queryParams.append('distributor_id', distributor_id.toString());
        }

        return await apiService.get(`/delivery/routes/optimize?${queryParams}`);
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
     * Helper method to validate schedule data
     */
    validateScheduleData(scheduleData) {
        const errors = [];

        if (!scheduleData.order_id) {
            errors.push('معرف الطلب مطلوب');
        }

        if (!scheduleData.scheduled_date) {
            errors.push('تاريخ التسليم مطلوب');
        } else {
            const scheduleDate = new Date(scheduleData.scheduled_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (scheduleDate < today) {
                errors.push('تاريخ التسليم لا يمكن أن يكون في الماضي');
            }
        }

        if (!scheduleData.scheduled_time_start) {
            errors.push('وقت بداية التسليم مطلوب');
        }

        if (scheduleData.scheduled_time_end && scheduleData.scheduled_time_start) {
            if (scheduleData.scheduled_time_end <= scheduleData.scheduled_time_start) {
                errors.push('وقت نهاية التسليم يجب أن يكون بعد وقت البداية');
            }
        }

        if (scheduleData.delivery_fee_eur && scheduleData.delivery_fee_eur < 0) {
            errors.push('رسوم التسليم لا يمكن أن تكون سالبة');
        }

        return errors;
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
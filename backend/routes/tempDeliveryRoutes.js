/**
 * Temporary Delivery Routes
 * Simplified routes that work with current database structure
 */

import express from 'express';
import TempDeliveryController from '../controllers/tempDeliveryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==============================================
// BASIC DELIVERY SCHEDULE ROUTES
// ==============================================

// @desc    Get delivery schedules
// @route   GET /api/delivery/schedules
// @access  Private
router.get('/schedules', protect, TempDeliveryController.getDeliverySchedules);

// @desc    Create delivery schedule
// @route   POST /api/delivery/schedules
// @access  Private (Admin/Manager only)
router.post('/schedules',
    protect,
    authorize(['admin', 'manager']),
    TempDeliveryController.createDeliverySchedule
);

// @desc    Update delivery schedule
// @route   PUT /api/delivery/schedules/:id
// @access  Private (Admin/Manager only)
router.put('/schedules/:id',
    protect,
    authorize(['admin', 'manager']),
    TempDeliveryController.updateDeliverySchedule
);

// @desc    Reschedule delivery
// @route   POST /api/delivery/schedules/:id/reschedule
// @access  Private (Admin/Manager only)
router.post('/schedules/:id/reschedule',
    protect,
    authorize(['admin', 'manager']),
    TempDeliveryController.rescheduleDelivery
);

// @desc    Cancel delivery schedule
// @route   DELETE /api/delivery/schedules/:id
// @access  Private (Admin/Manager only)
router.delete('/schedules/:id',
    protect,
    authorize(['admin', 'manager']),
    TempDeliveryController.cancelDeliverySchedule
);

// @desc    Get delivery schedule by ID
// @route   GET /api/delivery/schedules/:id
// @access  Private
router.get('/schedules/:id',
    protect,
    TempDeliveryController.getDeliveryScheduleById
);

// ==============================================
// CAPACITY AND AVAILABILITY ROUTES
// ==============================================

// @desc    Get delivery capacity
// @route   GET /api/delivery/capacity
// @access  Private (Admin/Manager only)
router.get('/capacity',
    protect,
    authorize(['admin', 'manager']),
    TempDeliveryController.getDeliveryCapacity
);

// @desc    Update delivery capacity
// @route   POST /api/delivery/capacity
// @access  Private (Admin/Manager only)
router.post('/capacity',
    protect,
    authorize(['admin', 'manager']),
    TempDeliveryController.updateDeliveryCapacity
);

// @desc    Check time slot availability
// @route   GET /api/delivery/schedules/availability
// @access  Private (Admin/Manager only)
router.get('/schedules/availability',
    protect,
    authorize(['admin', 'manager']),
    TempDeliveryController.checkTimeSlotAvailability
);

// ==============================================
// TRACKING AND ANALYTICS ROUTES
// ==============================================

// @desc    Get live delivery tracking
// @route   GET /api/delivery/tracking/live
// @access  Private
router.get('/tracking/live',
    protect,
    TempDeliveryController.getLiveDeliveryTracking
);

// @desc    Update delivery tracking status
// @route   PUT /api/delivery/tracking/:id/status
// @access  Private (Admin/Manager/Distributor only)
router.put('/tracking/:id/status',
    protect,
    authorize(['admin', 'manager', 'distributor']),
    TempDeliveryController.updateDeliveryTrackingStatus
);

// @desc    Update delivery tracking location
// @route   POST /api/delivery/tracking/:id/location
// @access  Private (Admin/Manager/Distributor only)
router.post('/tracking/:id/location',
    protect,
    authorize(['admin', 'manager', 'distributor']),
    TempDeliveryController.updateDeliveryTrackingLocation
);

// @desc    Get delivery analytics
// @route   GET /api/delivery/schedules/analytics
// @access  Private (Admin/Manager only)
router.get('/schedules/analytics',
    protect,
    authorize(['admin', 'manager']),
    TempDeliveryController.getDeliveryAnalytics
);

// ==============================================
// BULK AND EXPORT ROUTES
// ==============================================

// @desc    Export delivery schedules
// @route   GET /api/delivery/schedules/export
// @access  Private (Admin/Manager only)
router.get('/schedules/export',
    protect,
    authorize(['admin', 'manager']),
    TempDeliveryController.exportDeliverySchedules
);

// @desc    Bulk update schedules
// @route   POST /api/delivery/schedules/bulk-update
// @access  Private (Admin/Manager only)
router.post('/schedules/bulk-update',
    protect,
    authorize(['admin', 'manager']),
    TempDeliveryController.bulkUpdateSchedules
);

// ==============================================
// CONFIRMATION ROUTES
// ==============================================

// @desc    Confirm delivery with token
// @route   POST /api/delivery/schedules/confirm/:token
// @access  Public (token-based)
router.post('/schedules/confirm/:token',
    TempDeliveryController.confirmDelivery
);

export default router; 
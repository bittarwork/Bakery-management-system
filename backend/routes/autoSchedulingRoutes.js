import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import AutoSchedulingController from '../controllers/autoSchedulingController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// ==========================================
// 🧠 AUTO-SCHEDULING ROUTES (الجدولة التلقائية)
// ==========================================

/**
 * @desc    Get pending scheduling drafts for admin review
 * @route   GET /api/auto-scheduling/pending-reviews
 * @access  Private (Admin/Manager)
 */
router.get('/pending-reviews',
    authorize('admin', 'manager'),
    AutoSchedulingController.getPendingReviews
);

/**
 * @desc    Get scheduling draft details by ID
 * @route   GET /api/auto-scheduling/drafts/:id
 * @access  Private (Admin/Manager)
 */
router.get('/drafts/:id',
    authorize('admin', 'manager'),
    AutoSchedulingController.getSchedulingDraft
);

/**
 * @desc    Approve scheduling draft (with or without modifications)
 * @route   POST /api/auto-scheduling/drafts/:id/approve
 * @access  Private (Admin/Manager)
 */
router.post('/drafts/:id/approve',
    authorize('admin', 'manager'),
    AutoSchedulingController.approveSchedulingDraft
);

/**
 * @desc    Reject scheduling draft
 * @route   POST /api/auto-scheduling/drafts/:id/reject
 * @access  Private (Admin/Manager)
 */
router.post('/drafts/:id/reject',
    authorize('admin', 'manager'),
    AutoSchedulingController.rejectSchedulingDraft
);

/**
 * @desc    Get scheduling statistics for dashboard
 * @route   GET /api/auto-scheduling/statistics
 * @access  Private (Admin/Manager)
 */
router.get('/statistics',
    authorize('admin', 'manager'),
    AutoSchedulingController.getSchedulingStatistics
);

/**
 * @desc    Trigger manual scheduling for an order
 * @route   POST /api/auto-scheduling/manual-schedule
 * @access  Private (Admin/Manager)
 */
router.post('/manual-schedule',
    authorize('admin', 'manager'),
    AutoSchedulingController.triggerManualScheduling
);

export default router; 
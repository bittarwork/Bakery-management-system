import express from 'express';
import DistributionController from '../controllers/distributionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ===== DASHBOARD ROUTES =====
router.get('/dashboard', authorize('admin', 'manager'), DistributionController.getDashboardData);

// ===== MANAGER SPECIFIC ROUTES =====
router.get('/manager/tracking/live', authorize('admin', 'manager'), DistributionController.getLiveTracking);
router.get('/manager/orders/daily', authorize('admin', 'manager'), DistributionController.getDailyOrders);
router.get('/manager/analytics', authorize('admin', 'manager'), DistributionController.getDistributionAnalytics);

// ===== ORDER MANAGEMENT ROUTES =====
router.get('/orders', authorize('admin', 'manager'), DistributionController.getOrdersWithDistribution);
router.post('/assign', authorize('admin', 'manager'), DistributionController.assignOrderToDistributor);
router.post('/unassign', authorize('admin', 'manager'), DistributionController.unassignDistributor);
router.post('/auto-assign', authorize('admin', 'manager'), DistributionController.autoAssignOrders);

// ===== STATISTICS & REPORTS ROUTES =====
router.get('/stats', authorize('admin', 'manager'), DistributionController.getDistributionStats);
router.get('/reports/daily', authorize('admin', 'manager'), DistributionController.getDailyReports);
router.get('/reports/weekly', authorize('admin', 'manager'), DistributionController.getWeeklyReports);
router.get('/reports/monthly', authorize('admin', 'manager'), DistributionController.getMonthlyReports);

// ===== DISTRIBUTOR ROUTES =====
router.get('/distributors', authorize('admin', 'manager'), DistributionController.getAvailableDistributors);
router.get('/distributor/:id/orders', DistributionController.getDistributorOrders);

// ===== MAPS & ROUTES =====
router.get('/maps/distributors', authorize('admin', 'manager'), DistributionController.getDistributorLocations);
router.get('/maps/routes', authorize('admin', 'manager'), DistributionController.getRoutes);
router.get('/maps/traffic', authorize('admin', 'manager'), DistributionController.getTrafficData);

// ===== ARCHIVE ROUTES =====
router.get('/archive', authorize('admin', 'manager'), DistributionController.getArchiveData);
router.get('/archive/reports', authorize('admin', 'manager'), DistributionController.getArchivedReports);

// ===== STORE ANALYTICS ROUTES =====
router.get('/stores/analytics', authorize('admin', 'manager'), DistributionController.getStoreAnalytics);

export default router; 
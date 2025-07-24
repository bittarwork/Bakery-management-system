import express from 'express';
import DistributionController from '../controllers/distributionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin/Manager routes
router.get('/orders', authorize('admin', 'manager'), DistributionController.getOrdersWithDistribution);
router.post('/assign', authorize('admin', 'manager'), DistributionController.assignOrderToDistributor);
router.post('/unassign', authorize('admin', 'manager'), DistributionController.unassignDistributor);
router.post('/auto-assign', authorize('admin', 'manager'), DistributionController.autoAssignOrders);
router.get('/stats', authorize('admin', 'manager'), DistributionController.getDistributionStats);
router.get('/distributors', authorize('admin', 'manager'), DistributionController.getAvailableDistributors);

// Distributor routes (can access their own orders)
router.get('/distributor/:id/orders', DistributionController.getDistributorOrders);

export default router; 
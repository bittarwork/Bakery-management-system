import express from 'express';
import DistributionController from '../controllers/distributionController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Admin/Manager routes
router.get('/orders', requireRole(['admin', 'manager']), DistributionController.getOrdersWithDistribution);
router.post('/assign', requireRole(['admin', 'manager']), DistributionController.assignOrderToDistributor);
router.post('/unassign', requireRole(['admin', 'manager']), DistributionController.unassignDistributor);
router.post('/auto-assign', requireRole(['admin', 'manager']), DistributionController.autoAssignOrders);
router.get('/stats', requireRole(['admin', 'manager']), DistributionController.getDistributionStats);
router.get('/distributors', requireRole(['admin', 'manager']), DistributionController.getAvailableDistributors);

// Distributor routes (can access their own orders)
router.get('/distributor/:id/orders', DistributionController.getDistributorOrders);

export default router; 
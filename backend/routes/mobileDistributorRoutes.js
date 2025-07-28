import express from 'express';
import MobileDistributorController from '../controllers/mobileDistributorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Authentication Routes
router.post('/auth/login', MobileDistributorController.login);

// Protected Routes (require authentication)
router.use(protect); // Apply authentication middleware to all routes below

// Dashboard Routes
router.get('/dashboard/summary', MobileDistributorController.getDashboardSummary);

// Orders Routes
router.get('/orders/today', MobileDistributorController.getTodayOrders);
router.put('/orders/:orderId/status', MobileDistributorController.updateOrderStatus);

// Payments Routes
router.post('/payments', MobileDistributorController.recordPayment);

// Profile Routes
router.get('/profile', MobileDistributorController.getProfile);

export default router; 
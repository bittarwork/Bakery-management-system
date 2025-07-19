import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getProductPriceHistory,
    recordPriceChange,
    getPriceAnalytics,
    getPriceTrends,
    bulkUpdatePrices,
    getPriceAlerts
} from '../controllers/priceHistoryController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get price history for a product
// @route   GET /api/price-history/products/:productId
// @access  Private
router.get('/products/:productId', getProductPriceHistory);

// @desc    Record a price change
// @route   POST /api/price-history/record
// @access  Private (Admin/Manager only)
router.post('/record', authorize('admin', 'manager'), recordPriceChange);

// @desc    Get price analytics
// @route   GET /api/price-history/analytics
// @access  Private
router.get('/analytics', getPriceAnalytics);

// @desc    Get price trends
// @route   GET /api/price-history/trends
// @access  Private
router.get('/trends', getPriceTrends);

// @desc    Bulk update prices
// @route   POST /api/price-history/bulk-update
// @access  Private (Admin/Manager only)
router.post('/bulk-update', authorize('admin', 'manager'), bulkUpdatePrices);

// @desc    Get price alerts
// @route   GET /api/price-history/alerts
// @access  Private
router.get('/alerts', getPriceAlerts);

export default router; 
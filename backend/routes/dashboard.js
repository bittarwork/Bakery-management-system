import express from 'express';
import DashboardAPI from '../services/dashboardAPI.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get comprehensive dashboard statistics
 * GET /api/dashboard/stats
 */
router.get('/stats',
    protect,
    authorize('admin', 'manager'),
    async (req, res) => {
        try {
            const stats = await DashboardAPI.getDashboardStats(req.query);

            res.json({
                success: true,
                message: 'Dashboard statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Get daily overview
 * GET /api/dashboard/overview
 */
router.get('/overview',
    protect,
    authorize('admin', 'manager'),
    async (req, res) => {
        try {
            const { dateFrom, dateTo, currency } = req.query;
            const overview = await DashboardAPI.getDailyOverview(dateFrom, dateTo, currency);

            res.json({
                success: true,
                data: overview
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Get sales metrics
 * GET /api/dashboard/sales
 */
router.get('/sales',
    protect,
    authorize('admin', 'manager'),
    async (req, res) => {
        try {
            const { dateFrom, dateTo, currency } = req.query;
            const metrics = await DashboardAPI.getSalesMetrics(dateFrom, dateTo, currency);

            res.json({
                success: true,
                data: metrics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Get distribution metrics
 * GET /api/dashboard/distribution
 */
router.get('/distribution',
    protect,
    authorize('admin', 'manager'),
    async (req, res) => {
        try {
            const { dateFrom, dateTo } = req.query;
            const metrics = await DashboardAPI.getDistributionMetrics(dateFrom, dateTo);

            res.json({
                success: true,
                data: metrics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Get payment metrics
 * GET /api/dashboard/payments
 */
router.get('/payments',
    protect,
    authorize('admin', 'manager'),
    async (req, res) => {
        try {
            const { dateFrom, dateTo, currency } = req.query;
            const metrics = await DashboardAPI.getPaymentMetrics(dateFrom, dateTo, currency);

            res.json({
                success: true,
                data: metrics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Get top performers
 * GET /api/dashboard/top-performers
 */
router.get('/top-performers',
    protect,
    authorize('admin', 'manager'),
    async (req, res) => {
        try {
            const { dateFrom, dateTo, currency } = req.query;
            const performers = await DashboardAPI.getTopPerformers(dateFrom, dateTo, currency);

            res.json({
                success: true,
                data: performers
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

/**
 * Get system health
 * GET /api/dashboard/health
 */
router.get('/health',
    protect,
    authorize('admin', 'manager'),
    async (req, res) => {
        try {
            const health = await DashboardAPI.getSystemHealth();

            res.json({
                success: true,
                data: health
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

export default router; 
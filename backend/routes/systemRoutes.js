import express from 'express';
import systemController from '../controllers/systemController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/system/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     dbHost:
 *                       type: string
 *                     dbPort:
 *                       type: string
 *                     dbName:
 *                       type: string
 *                     dbUser:
 *                       type: string
 *                     emailHost:
 *                       type: string
 *                     emailPort:
 *                       type: string
 *                     emailUser:
 *                       type: string
 *                     jwtSecret:
 *                       type: string
 *                     sessionTimeout:
 *                       type: string
 *                     systemName:
 *                       type: string
 *                     version:
 *                       type: string
 *                     maintenanceMode:
 *                       type: boolean
 *                     debugMode:
 *                       type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get('/settings', protect, systemController.getSettings);

/**
 * @swagger
 * /api/system/settings:
 *   put:
 *     summary: Update system settings
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dbHost:
 *                 type: string
 *               dbPort:
 *                 type: string
 *               dbName:
 *                 type: string
 *               dbUser:
 *                 type: string
 *               dbPassword:
 *                 type: string
 *               emailHost:
 *                 type: string
 *               emailPort:
 *                 type: string
 *               emailUser:
 *                 type: string
 *               emailPassword:
 *                 type: string
 *               jwtSecret:
 *                 type: string
 *               sessionTimeout:
 *                 type: string
 *     responses:
 *       200:
 *         description: System settings updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put('/settings', protect, systemController.updateSettings);

/**
 * @swagger
 * /api/system/info:
 *   get:
 *     summary: Get system information
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     version:
 *                       type: string
 *                     environment:
 *                       type: string
 *                     nodeVersion:
 *                       type: string
 *                     platform:
 *                       type: string
 *                     uptime:
 *                       type: number
 *                     memoryUsage:
 *                       type: object
 *                     cpuUsage:
 *                       type: object
 *                     timestamp:
 *                       type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get('/info', protect, systemController.getInfo);

/**
 * @swagger
 * /api/system/statistics:
 *   get:
 *     summary: Get system statistics
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: number
 *                     totalUsers:
 *                       type: number
 *                     totalProducts:
 *                       type: number
 *                     totalStores:
 *                       type: number
 *                     activeDistributors:
 *                       type: number
 *                     systemUptime:
 *                       type: number
 *                     memoryUsage:
 *                       type: object
 *                     timestamp:
 *                       type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get('/statistics', protect, systemController.getStatistics);

export default router; 
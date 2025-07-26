import express from 'express';
import { body, param, query } from 'express-validator';
import EnhancedDistributorController from '../controllers/enhancedDistributorController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

/**
 * @route GET /api/distributors/active
 * @desc Get all active distributors with current status
 * @access Admin/Manager
 */
router.get('/active',
    authorize(['admin', 'manager']),
    [
        query('include_location').optional().isBoolean(),
        query('include_performance').optional().isBoolean()
    ],
    validateRequest,
    EnhancedDistributorController.getActiveDistributors
);

/**
 * @route GET /api/distributors/live-tracking
 * @desc Get live tracking data for all active distributors
 * @access Admin/Manager
 */
router.get('/live-tracking',
    authorize(['admin', 'manager']),
    [
        query('date').optional().isISO8601().toDate()
    ],
    validateRequest,
    EnhancedDistributorController.getLiveTracking
);

/**
 * @route GET /api/distributors/:id/details
 * @desc Get comprehensive distributor details
 * @access Admin/Manager
 */
router.get('/:id/details',
    authorize(['admin', 'manager']),
    [
        param('id').isInt({ min: 1 }).withMessage('Invalid distributor ID'),
        query('date').optional().isISO8601().toDate()
    ],
    validateRequest,
    EnhancedDistributorController.getDistributorDetails
);

/**
 * @route POST /api/distributors/:id/location
 * @desc Update distributor location (from mobile app)
 * @access Distributor (own data only) or Admin/Manager
 */
router.post('/:id/location',
    [
        param('id').isInt({ min: 1 }).withMessage('Invalid distributor ID'),
        body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
        body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
        body('accuracy').optional().isFloat({ min: 0 }),
        body('speed').optional().isFloat({ min: 0 }),
        body('heading').optional().isFloat({ min: 0, max: 360 }),
        body('address').optional().isString().trim(),
        body('activity_type').optional().isIn(['moving', 'stopped', 'delivering', 'break']),
        body('order_id').optional().isInt({ min: 1 }),
        body('battery_level').optional().isInt({ min: 0, max: 100 })
    ],
    validateRequest,
    // Custom authorization: distributors can only update their own location
    (req, res, next) => {
        const { id } = req.params;
        const user = req.user;
        
        if (user.role === 'distributor' && user.id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own location'
            });
        }
        
        if (!['admin', 'manager', 'distributor'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        next();
    },
    EnhancedDistributorController.updateDistributorLocation
);

/**
 * @route PATCH /api/distributors/:id/work-status
 * @desc Update distributor work status
 * @access Distributor (own data only) or Admin/Manager
 */
router.patch('/:id/work-status',
    [
        param('id').isInt({ min: 1 }).withMessage('Invalid distributor ID'),
        body('work_status').isIn(['available', 'busy', 'offline', 'break']).withMessage('Invalid work status'),
        body('notes').optional().isString().trim()
    ],
    validateRequest,
    // Custom authorization: distributors can only update their own status
    (req, res, next) => {
        const { id } = req.params;
        const user = req.user;
        
        if (user.role === 'distributor' && user.id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own work status'
            });
        }
        
        if (!['admin', 'manager', 'distributor'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        next();
    },
    EnhancedDistributorController.updateWorkStatus
);

/**
 * @route POST /api/distributors/:id/start-work
 * @desc Start work day for distributor
 * @access Distributor (own data only) or Admin/Manager
 */
router.post('/:id/start-work',
    [
        param('id').isInt({ min: 1 }).withMessage('Invalid distributor ID'),
        body('location').optional().isObject(),
        body('location.lat').optional().isFloat({ min: -90, max: 90 }),
        body('location.lng').optional().isFloat({ min: -180, max: 180 }),
        body('location.address').optional().isString().trim()
    ],
    validateRequest,
    // Custom authorization: distributors can only start their own work day
    (req, res, next) => {
        const { id } = req.params;
        const user = req.user;
        
        if (user.role === 'distributor' && user.id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                message: 'You can only start your own work day'
            });
        }
        
        if (!['admin', 'manager', 'distributor'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        next();
    },
    EnhancedDistributorController.startWorkDay
);

/**
 * @route POST /api/distributors/:id/end-work
 * @desc End work day for distributor
 * @access Distributor (own data only) or Admin/Manager
 */
router.post('/:id/end-work',
    [
        param('id').isInt({ min: 1 }).withMessage('Invalid distributor ID'),
        body('notes').optional().isString().trim()
    ],
    validateRequest,
    // Custom authorization: distributors can only end their own work day
    (req, res, next) => {
        const { id } = req.params;
        const user = req.user;
        
        if (user.role === 'distributor' && user.id !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                message: 'You can only end your own work day'
            });
        }
        
        if (!['admin', 'manager', 'distributor'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        next();
    },
    EnhancedDistributorController.endWorkDay
);

export default router; 
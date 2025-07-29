import express from 'express';
import { body } from 'express-validator';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserStatistics,
    exportUsers,
    getDistributorDetails,
    getAllDistributors,
    updateDistributorStatus,
    getAdminDetails,
    getAllAdmins,
    updateUserPassword
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Enhanced validation rules
const createUserValidation = [
    body('username')
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain lowercase, uppercase, and number'),

    body('full_name')
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),

    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('Invalid phone number format'),

    body('role')
        .isIn(['admin', 'manager', 'distributor', 'cashier', 'accountant'])
        .withMessage('Invalid role'),

    body('salary')
        .optional()
        .isNumeric()
        .withMessage('Salary must be a number'),

    body('license_number')
        .custom((value, { req }) => {
            // If the role is distributor, license_number is required
            if (req.body.role === 'distributor') {
                if (!value || value.trim() === '') {
                    throw new Error('License number is required for distributors');
                }
                if (value.length < 5 || value.length > 50) {
                    throw new Error('License number must be between 5 and 50 characters');
                }
            }
            // For other roles, license_number should be empty or null
            else if (value && value.trim() !== '') {
                throw new Error('License number is only allowed for distributors');
            }
            return true;
        })
];

const updateUserValidation = [
    body('username')
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format'),

    body('full_name')
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),

    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('Invalid phone number format'),

    body('role')
        .isIn(['admin', 'manager', 'distributor', 'cashier', 'accountant'])
        .withMessage('Invalid role'),

    body('status')
        .isIn(['active', 'inactive', 'suspended'])
        .withMessage('Invalid status')
];

const toggleStatusValidation = [
    body('status')
        .isIn(['active', 'inactive', 'suspended'])
        .withMessage('Invalid status')
];

const passwordUpdateValidation = [
    body('new_password')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),

    body('current_password')
        .optional()
        .notEmpty()
        .withMessage('Current password is required when provided')
];

const distributorStatusValidation = [
    body('work_status')
        .optional()
        .isIn(['available', 'busy', 'offline', 'break'])
        .withMessage('Invalid work status'),

    body('location')
        .optional()
        .isObject()
        .withMessage('Location must be an object'),

    body('location.latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Invalid latitude'),

    body('location.longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Invalid longitude')
];

// ===== GENERAL USER ROUTES =====

// @desc    Get all users with enhanced filtering
// @route   GET /api/users
// @access  Private (Admin/Manager)
router.get('/', authorize('admin', 'manager'), getUsers);

// @desc    Get user statistics
// @route   GET /api/users/statistics
// @access  Private (Admin/Manager)
router.get('/statistics', authorize('admin', 'manager'), getUserStatistics);

// @desc    Export users data
// @route   GET /api/users/export
// @access  Private (Admin/Manager)
router.get('/export', authorize('admin', 'manager'), exportUsers);

// ===== DISTRIBUTOR SPECIFIC ROUTES =====

// @desc    Get all distributors with performance data
// @route   GET /api/users/distributors
// @access  Private (Admin/Manager)
router.get('/distributors', authorize('admin', 'manager'), getAllDistributors);

// @desc    Get distributor details with performance metrics
// @route   GET /api/users/distributors/:id/details
// @access  Private (Admin/Manager)
router.get('/distributors/:id/details', authorize('admin', 'manager'), getDistributorDetails);

// @desc    Update distributor work status and location
// @route   PATCH /api/users/distributors/:id/status
// @access  Private (Admin/Manager/Self)
router.patch('/distributors/:id/status', authorize('admin', 'manager', 'distributor'), distributorStatusValidation, updateDistributorStatus);

// ===== ADMIN SPECIFIC ROUTES =====

// @desc    Get all admins and managers
// @route   GET /api/users/admins
// @access  Private (Admin)
router.get('/admins', authorize('admin'), getAllAdmins);

// @desc    Get admin details with permissions
// @route   GET /api/users/admins/:id/details
// @access  Private (Admin)  
router.get('/admins/:id/details', authorize('admin'), getAdminDetails);

// ===== INDIVIDUAL USER ROUTES =====

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin)
router.post('/', authorize('admin'), createUserValidation, createUser);

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin/Manager)
router.get('/:id', authorize('admin', 'manager'), getUser);

// @desc    Update user data
// @route   PUT /api/users/:id
// @access  Private (Admin)
router.put('/:id', authorize('admin'), updateUserValidation, updateUser);

// @desc    Update user password
// @route   PATCH /api/users/:id/password
// @access  Private (Admin/Self)
router.patch('/:id/password', passwordUpdateValidation, updateUserPassword);

// @desc    Toggle user status
// @route   PATCH /api/users/:id/status
// @access  Private (Admin)
router.patch('/:id/status', authorize('admin'), toggleStatusValidation, toggleUserStatus);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
router.delete('/:id', authorize('admin'), deleteUser);

export default router; 
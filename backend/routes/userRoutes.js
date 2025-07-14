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
    exportUsers
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// تطبيق middleware المصادقة على جميع المسارات
router.use(protect);

// قواعد التحقق من صحة البيانات
const createUserValidation = [
    body('username')
        .notEmpty()
        .withMessage('اسم المستخدم مطلوب')
        .isLength({ min: 3, max: 50 })
        .withMessage('اسم المستخدم يجب أن يكون بين 3 و 50 حرف')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('اسم المستخدم يجب أن يحتوي على أحرف وأرقام وشرطة سفلية فقط'),

    body('email')
        .notEmpty()
        .withMessage('البريد الإلكتروني مطلوب')
        .isEmail()
        .withMessage('البريد الإلكتروني غير صحيح'),

    body('password')
        .notEmpty()
        .withMessage('كلمة المرور مطلوبة')
        .isLength({ min: 8 })
        .withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('كلمة المرور يجب أن تحتوي على حرف صغير وحرف كبير ورقم'),

    body('full_name')
        .notEmpty()
        .withMessage('الاسم الكامل مطلوب')
        .isLength({ min: 2, max: 100 })
        .withMessage('الاسم الكامل يجب أن يكون بين 2 و 100 حرف'),

    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('رقم الهاتف غير صحيح'),

    body('role')
        .isIn(['admin', 'manager', 'distributor', 'cashier', 'accountant'])
        .withMessage('الدور غير صحيح')
];

const updateUserValidation = [
    body('username')
        .notEmpty()
        .withMessage('اسم المستخدم مطلوب')
        .isLength({ min: 3, max: 50 })
        .withMessage('اسم المستخدم يجب أن يكون بين 3 و 50 حرف')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('اسم المستخدم يجب أن يحتوي على أحرف وأرقام وشرطة سفلية فقط'),

    body('email')
        .notEmpty()
        .withMessage('البريد الإلكتروني مطلوب')
        .isEmail()
        .withMessage('البريد الإلكتروني غير صحيح'),

    body('full_name')
        .notEmpty()
        .withMessage('الاسم الكامل مطلوب')
        .isLength({ min: 2, max: 100 })
        .withMessage('الاسم الكامل يجب أن يكون بين 2 و 100 حرف'),

    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('رقم الهاتف غير صحيح'),

    body('role')
        .isIn(['admin', 'manager', 'distributor', 'cashier', 'accountant'])
        .withMessage('الدور غير صحيح'),

    body('status')
        .isIn(['active', 'inactive', 'suspended'])
        .withMessage('الحالة غير صحيحة')
];

const toggleStatusValidation = [
    body('status')
        .isIn(['active', 'inactive', 'suspended'])
        .withMessage('الحالة غير صحيحة')
];

// @desc    الحصول على جميع الموظفين
// @route   GET /api/users
// @access  Private (Admin/Manager)
router.get('/', authorize('admin', 'manager'), getUsers);

// @desc    الحصول على موظف واحد
// @route   GET /api/users/:id
// @access  Private (Admin/Manager)
router.get('/:id', authorize('admin', 'manager'), getUser);

// @desc    إنشاء موظف جديد
// @route   POST /api/users
// @access  Private (Admin)
router.post('/', authorize('admin'), createUserValidation, createUser);

// @desc    تحديث بيانات موظف
// @route   PUT /api/users/:id
// @access  Private (Admin)
router.put('/:id', authorize('admin'), updateUserValidation, updateUser);

// @desc    حذف موظف
// @route   DELETE /api/users/:id
// @access  Private (Admin)
router.delete('/:id', authorize('admin'), deleteUser);

// @desc    تغيير حالة موظف
// @route   PATCH /api/users/:id/status
// @access  Private (Admin)
router.patch('/:id/status', authorize('admin'), toggleStatusValidation, toggleUserStatus);

// @desc    الحصول على إحصائيات الموظفين
// @route   GET /api/users/statistics
// @access  Private (Admin/Manager)
router.get('/statistics', authorize('admin', 'manager'), getUserStatistics);

// @desc    تصدير بيانات الموظفين
// @route   GET /api/users/export
// @access  Private (Admin/Manager)
router.get('/export', authorize('admin', 'manager'), exportUsers);

export default router; 
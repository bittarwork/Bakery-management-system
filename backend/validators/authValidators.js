import { body, validationResult } from 'express-validator';
import { USER_ROLES } from '../constants/index.js';

// Helper function to handle validation results
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'بيانات غير صحيحة',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

// Registration validation
export const validateRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('اسم المستخدم يجب أن يكون بين 3 و 50 حرف')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('اسم المستخدم يجب أن يحتوي على أحرف وأرقام و _ فقط'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('البريد الإلكتروني غير صحيح')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 8 })
        .withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'),

    body('full_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('الاسم الكامل يجب أن يكون بين 2 و 100 حرف')
        .matches(/^[\u0600-\u06FFa-zA-Z\s]+$/)
        .withMessage('الاسم الكامل يجب أن يحتوي على أحرف عربية أو إنجليزية فقط'),

    body('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('رقم الهاتف غير صحيح'),

    body('role')
        .optional()
        .isIn(Object.values(USER_ROLES))
        .withMessage('الدور غير صحيح'),

    handleValidationErrors
];

// Login validation
export const validateLogin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('اسم المستخدم مطلوب'),

    body('password')
        .notEmpty()
        .withMessage('كلمة المرور مطلوبة'),

    handleValidationErrors
];

// Password change validation
export const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('كلمة المرور الحالية مطلوبة'),

    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('كلمة المرور الجديدة يجب أن تحتوي على حرف كبير وصغير ورقم'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('تأكيد كلمة المرور غير متطابق');
            }
            return true;
        }),

    handleValidationErrors
];

// Profile update validation
export const validateProfileUpdate = [
    body('full_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('الاسم الكامل يجب أن يكون بين 2 و 100 حرف')
        .matches(/^[\u0600-\u06FFa-zA-Z\s]+$/)
        .withMessage('الاسم الكامل يجب أن يحتوي على أحرف عربية أو إنجليزية فقط'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('البريد الإلكتروني غير صحيح')
        .normalizeEmail(),

    body('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('رقم الهاتف غير صحيح'),

    handleValidationErrors
];

// Admin user management validation
export const validateUserManagement = [
    body('role')
        .optional()
        .isIn(Object.values(USER_ROLES))
        .withMessage('الدور غير صحيح'),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('حالة النشاط يجب أن تكون true أو false'),

    handleValidationErrors
]; 
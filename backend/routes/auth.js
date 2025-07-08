import express from 'express';
import { body } from 'express-validator';
import { login, logout, getMe, refreshToken, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    تسجيل الدخول
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
    body('username').notEmpty().withMessage('اسم المستخدم مطلوب'),
    body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
], login);

// @desc    تسجيل الخروج
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, logout);

// @desc    الحصول على بيانات المستخدم الحالي
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, getMe);

// @desc    تجديد الـ Access Token
// @route   POST /api/auth/refresh
// @access  Public (but needs refresh token)
router.post('/refresh', refreshToken);

// @desc    تغيير كلمة المرور
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', [
    body('currentPassword').isLength({ min: 6 }).withMessage('كلمة المرور الحالية مطلوبة'),
    body('newPassword').isLength({ min: 6 }).withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
], protect, changePassword);

export default router; 
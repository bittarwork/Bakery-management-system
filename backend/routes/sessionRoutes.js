import express from 'express';
import { body } from 'express-validator';
import sessionController from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';
import { sessionProtect } from '../middleware/sessionMiddleware.js';

const router = express.Router();

// Validation rules
const loginValidation = [
    body('username')
        .notEmpty()
        .withMessage('اسم المستخدم مطلوب')
        .isLength({ min: 3, max: 50 })
        .withMessage('اسم المستخدم يجب أن يكون بين 3 و 50 حرف'),
    body('password')
        .notEmpty()
        .withMessage('كلمة المرور مطلوبة')
        .isLength({ min: 6 })
        .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    body('remember_me')
        .optional()
        .isBoolean()
        .withMessage('قيمة تذكرني يجب أن تكون true أو false')
];

const extendSessionValidation = [
    body('hours')
        .optional()
        .isInt({ min: 1, max: 720 })
        .withMessage('عدد الساعات يجب أن يكون بين 1 و 720')
];

// Public routes
router.post('/login', loginValidation, sessionController.createSession);

// Protected routes
router.post('/logout', sessionProtect, sessionController.logout);
router.post('/logout-all', sessionProtect, sessionController.logoutAll);
router.get('/active', sessionProtect, sessionController.getActiveSessions);
router.delete('/:sessionId', sessionProtect, sessionController.terminateSession);
router.post('/extend', sessionProtect, extendSessionValidation, sessionController.extendSession);
router.post('/validate', sessionProtect, sessionController.validateSession);

// Admin routes for cleanup (can be called by cron jobs)
router.post('/cleanup', sessionController.cleanupExpiredSessions);

export default router; 
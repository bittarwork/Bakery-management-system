import { UserSession, User } from '../models/index.js';
import jwt from 'jsonwebtoken';

// Middleware لتحديث آخر نشاط في الجلسة
export const updateSessionActivity = async (req, res, next) => {
    try {
        // استخراج الـ token من الكوكيز
        const token = req.cookies.token;

        if (token) {
            // فك تشفير الـ token للحصول على sessionId
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.sessionId) {
                // تحديث آخر نشاط في الجلسة
                await UserSession.update(
                    { last_activity: new Date() },
                    {
                        where: {
                            id: decoded.sessionId,
                            is_active: true
                        }
                    }
                );

                // إضافة sessionId للـ request للاستخدام في controllers أخرى
                req.sessionId = decoded.sessionId;
            }
        }

        next();
    } catch (error) {
        // في حالة وجود خطأ، نتجاهله ونكمل
        // لأن هذا الـ middleware يجب ألا يوقف الطلب
        next();
    }
};

// Middleware للتحقق من انتهاء صلاحية الجلسة
export const checkSessionExpiry = async (req, res, next) => {
    try {
        const sessionId = req.sessionId;

        if (sessionId) {
            const session = await UserSession.findByPk(sessionId);

            if (session && session.isExpired()) {
                // إنهاء الجلسة المنتهية الصلاحية
                await session.terminate('timeout');

                // مسح الكوكيز
                res.clearCookie('token');
                res.clearCookie('sessionId');

                return res.status(401).json({
                    success: false,
                    message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
                    error_code: 'SESSION_EXPIRED'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Session expiry check error:', error);
        next();
    }
};

// Middleware لتنظيف الجلسات المنتهية الصلاحية (يمكن استخدامها في cron job)
export const cleanupExpiredSessions = async () => {
    try {
        const result = await UserSession.cleanupExpired();
        console.log(`Cleaned up ${result[0]} expired sessions`);
        return result[0];
    } catch (error) {
        console.error('Error cleaning up expired sessions:', error);
        return 0;
    }
};

// Middleware لتحديد الجهاز والموقع
export const detectDevice = (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const platform = req.headers['sec-ch-ua-platform'] || 'Unknown';
    const browser = req.headers['sec-ch-ua'] || 'Unknown';

    req.deviceInfo = {
        userAgent,
        platform,
        browser,
        isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
        isDesktop: !/Mobile|Android|iPhone|iPad/.test(userAgent)
    };

    next();
};

// Middleware لإحصائيات الجلسة
export const sessionStats = async (req, res, next) => {
    try {
        const userId = req.userId;

        if (userId) {
            const activeSessionsCount = await UserSession.count({
                where: {
                    user_id: userId,
                    is_active: true
                }
            });

            req.sessionStats = {
                activeSessionsCount,
                currentSessionId: req.sessionId
            };
        }

        next();
    } catch (error) {
        console.error('Session stats error:', error);
        next();
    }
};

// Middleware للتحقق من JWT Token واستخراج معلومات الجلسة
export const sessionProtect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح لك بالوصول إلى هذا المورد'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists and is active
        const user = await User.findOne({
            where: {
                id: decoded.userId,
                is_active: true
            },
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'المستخدم المرتبط بهذا الرمز غير موجود'
            });
        }

        // Check if session exists and is active (if sessionId is provided)
        if (decoded.sessionId) {
            const session = await UserSession.findByPk(decoded.sessionId);
            if (!session || !session.is_active || session.isExpired()) {
                return res.status(401).json({
                    success: false,
                    message: 'الجلسة غير صحيحة أو منتهية الصلاحية'
                });
            }
            req.sessionId = decoded.sessionId;
        }

        // Grant access to protected route
        req.user = user;
        req.userId = user.id;
        next();

    } catch (error) {
        console.error('Session auth middleware error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'رمز غير صحيح'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'انتهت صلاحية الرمز'
            });
        }

        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
};

export default {
    updateSessionActivity,
    checkSessionExpiry,
    cleanupExpiredSessions,
    detectDevice,
    sessionStats,
    sessionProtect
}; 
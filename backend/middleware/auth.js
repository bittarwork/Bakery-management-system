import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware للتحقق من JWT Token
export const protect = async (req, res, next) => {
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

        // Grant access to protected route
        req.user = user;
        req.userId = user.id;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);

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

// Middleware للتحقق من الأدوار المحددة
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'يجب تسجيل الدخول أولاً'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بالوصول إلى هذا المورد'
            });
        }

        next();
    };
};

// Middleware للتحقق من أن المستخدم مدير أو مدير التوزيع
export const requireManagerOrAdmin = authorize('admin', 'manager');

// Middleware للتحقق من أن المستخدم مدير فقط
export const requireAdmin = authorize('admin');

// Middleware للتحقق من أن المستخدم موزع أو أعلى
export const requireDistributorOrHigher = authorize('admin', 'manager', 'distributor');

// Middleware اختياري للمصادقة (لا يتطلب تسجيل دخول ولكن يضيف معلومات المستخدم إذا كان متاحاً)
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findOne({
                    where: {
                        id: decoded.userId,
                        is_active: true
                    },
                    attributes: { exclude: ['password'] }
                });

                if (user) {
                    req.user = user;
                    req.userId = user.id;
                }
            } catch (error) {
                // If token is invalid, just continue without user info
                // Only log in development
                if (process.env.NODE_ENV === 'development') {
                    console.log('🔓 Optional auth failed:', error.message);
                }
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next(); // Continue even if there's an error
    }
};

// Middleware للتحقق من ملكية المورد (للموزعين)
export const checkResourceOwnership = (resourceType) => {
    return async (req, res, next) => {
        try {
            // If user is admin or manager, allow access
            if (['admin', 'manager'].includes(req.user.role)) {
                return next();
            }

            // For distributors, check if they own the resource
            if (req.user.role === 'distributor') {
                const resourceId = req.params.id;

                // This would need to be customized based on the resource type
                // For example, checking if a distribution schedule belongs to the logged-in distributor

                // Placeholder logic - customize based on actual resource
                switch (resourceType) {
                    case 'distribution_schedule':
                        // Check if the distribution schedule belongs to this distributor
                        // const schedule = await DistributionSchedule.findByPk(resourceId);
                        // if (schedule && schedule.distributor_id === req.user.id) {
                        //   return next();
                        // }
                        break;
                    default:
                        break;
                }
            }

            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بالوصول إلى هذا المورد'
            });

        } catch (error) {
            console.error('Resource ownership check error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في الخادم'
            });
        }
    };
};

export default {
    protect,
    authorize,
    requireManagerOrAdmin,
    requireAdmin,
    requireDistributorOrHigher,
    optionalAuth,
    checkResourceOwnership
}; 
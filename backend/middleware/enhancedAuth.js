import jwt from 'jsonwebtoken';
import EnhancedUser from '../models/EnhancedUser.js';
import EnhancedStore from '../models/EnhancedStore.js';

// Enhanced Token Authentication
export const enhancedAuthenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'رمز الوصول مطلوب'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user with enhanced model
        const user = await EnhancedUser.findByPk(decoded.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'الحساب غير نشط'
            });
        }

        // Check if account is locked
        if (user.isLocked()) {
            return res.status(401).json({
                success: false,
                message: 'الحساب مقفل مؤقتاً'
            });
        }

        // Update last activity
        await user.updateLastActivity();

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'رمز الوصول منتهي الصلاحية'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'رمز الوصول غير صحيح'
            });
        }

        console.error('Enhanced auth error:', error);
        return res.status(500).json({
            success: false,
            message: 'خطأ في التحقق من الهوية'
        });
    }
};

// Enhanced Role Authorization
export const enhancedAuthorizeRoles = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'يجب تسجيل الدخول أولاً'
                });
            }

            const userRole = req.user.role;

            // Check if user role is allowed
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'غير مصرح لك بالوصول لهذا المورد'
                });
            }

            // Additional checks for store_owner role
            if (userRole === 'store_owner') {
                const storeId = req.params.store_id || req.params.id;

                if (storeId) {
                    // Check if store owner has access to this specific store
                    const store = await EnhancedStore.findByPk(storeId);

                    if (!store) {
                        return res.status(404).json({
                            success: false,
                            message: 'المحل غير موجود'
                        });
                    }

                    // For now, we'll allow access. In a full implementation,
                    // we'd check if the user is the actual owner of this store
                    // This would require a store_owner_id field in the stores table
                }
            }

            next();
        } catch (error) {
            console.error('Enhanced authorization error:', error);
            return res.status(500).json({
                success: false,
                message: 'خطأ في التحقق من الصلاحيات'
            });
        }
    };
};

// Check if user can access specific store
export const checkStoreAccess = async (req, res, next) => {
    try {
        const storeId = req.params.store_id || req.params.id;
        const user = req.user;

        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: 'معرف المحل مطلوب'
            });
        }

        // Admin and Manager have access to all stores
        if (user.role === 'admin' || user.role === 'manager') {
            return next();
        }

        // Store owner can only access their own store
        if (user.role === 'store_owner') {
            const store = await EnhancedStore.findByPk(storeId);

            if (!store) {
                return res.status(404).json({
                    success: false,
                    message: 'المحل غير موجود'
                });
            }

            // In a full implementation, check if user owns this store
            // For now, we'll allow access
            return next();
        }

        // Distributor can access stores in their assigned routes
        if (user.role === 'distributor') {
            // In a full implementation, check if store is in distributor's route
            // For now, we'll allow access
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'غير مصرح لك بالوصول لهذا المحل'
        });

    } catch (error) {
        console.error('Store access check error:', error);
        return res.status(500).json({
            success: false,
            message: 'خطأ في التحقق من صلاحية الوصول للمحل'
        });
    }
};

// Check if user can access specific distributor data
export const checkDistributorAccess = async (req, res, next) => {
    try {
        const distributorId = req.params.distributor_id;
        const user = req.user;

        if (!distributorId) {
            return res.status(400).json({
                success: false,
                message: 'معرف الموزع مطلوب'
            });
        }

        // Admin and Manager have access to all distributors
        if (user.role === 'admin' || user.role === 'manager') {
            return next();
        }

        // Distributor can only access their own data
        if (user.role === 'distributor') {
            if (user.id.toString() !== distributorId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'غير مصرح لك بالوصول لبيانات هذا الموزع'
                });
            }
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'غير مصرح لك بالوصول لبيانات الموزعين'
        });

    } catch (error) {
        console.error('Distributor access check error:', error);
        return res.status(500).json({
            success: false,
            message: 'خطأ في التحقق من صلاحية الوصول لبيانات الموزع'
        });
    }
};

// Rate limiting middleware
export const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();

    return (req, res, next) => {
        const key = req.ip + ':' + (req.user?.id || 'anonymous');
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old requests
        if (requests.has(key)) {
            const userRequests = requests.get(key).filter(time => time > windowStart);
            requests.set(key, userRequests);
        }

        const userRequests = requests.get(key) || [];

        if (userRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'تم تجاوز الحد المسموح من الطلبات'
            });
        }

        userRequests.push(now);
        requests.set(key, userRequests);

        next();
    };
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
};

// Log security events
export const logSecurityEvent = (eventType, details) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        event_type: eventType,
        details,
        severity: getSeverityLevel(eventType)
    };

    // In a production environment, you'd want to log this to a security system
    console.log('🔒 Security Event:', JSON.stringify(logEntry, null, 2));
};

const getSeverityLevel = (eventType) => {
    const severityMap = {
        'failed_login': 'medium',
        'account_locked': 'high',
        'unauthorized_access': 'high',
        'rate_limit_exceeded': 'medium',
        'suspicious_activity': 'high'
    };

    return severityMap[eventType] || 'low';
};

// Audit trail middleware
export const auditTrail = (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
        // Log the request and response for audit purposes
        const auditLog = {
            timestamp: new Date().toISOString(),
            user_id: req.user?.id,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            user_agent: req.get('User-Agent'),
            status_code: res.statusCode,
            response_size: Buffer.byteLength(data)
        };

        // In a production environment, you'd want to store this in a database
        if (process.env.NODE_ENV === 'development') {
            console.log('📋 Audit Log:', JSON.stringify(auditLog, null, 2));
        }

        originalSend.call(this, data);
    };

    next();
}; 
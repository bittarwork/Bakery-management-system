import { UserSession, User } from '../models/index.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';

const sessionController = {
    // إنشاء جلسة جديدة عند تسجيل الدخول
    async createSession(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'بيانات غير صحيحة',
                    errors: errors.array()
                });
            }

            const { username, password, remember_me = false } = req.body;

            // العثور على المستخدم والتحقق من كلمة المرور
            const user = await User.findByCredentials(username, password);

            // إنشاء session token فريد
            const sessionToken = crypto.randomBytes(64).toString('hex');

            // تحديد مدة انتهاء الصلاحية
            const expirationHours = remember_me ? 720 : 24; // 30 يوم أو 24 ساعة
            const expiresAt = new Date(Date.now() + (expirationHours * 60 * 60 * 1000));

            // جمع معلومات الجهاز والموقع
            const deviceInfo = {
                userAgent: req.headers['user-agent'],
                browser: req.headers['sec-ch-ua'] || 'Unknown',
                platform: req.headers['sec-ch-ua-platform'] || 'Unknown'
            };

            const ipAddress = req.ip || req.connection.remoteAddress;

            // إنشاء الجلسة في قاعدة البيانات
            const session = await UserSession.create({
                user_id: user.id,
                session_token: sessionToken,
                device_info: deviceInfo,
                ip_address: ipAddress,
                expires_at: expiresAt
            });

            // تحديث وقت آخر تسجيل دخول للمستخدم
            await user.update({ last_login: new Date() });

            // إنشاء JWT token
            const jwtToken = jwt.sign(
                {
                    userId: user.id,
                    sessionId: session.id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: remember_me ? '30d' : '24h' }
            );

            // إعداد الكوكيز
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: expirationHours * 60 * 60 * 1000
            };

            res.cookie('token', jwtToken, cookieOptions);
            res.cookie('sessionId', session.id, cookieOptions);

            res.status(200).json({
                success: true,
                message: 'تم تسجيل الدخول بنجاح',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        full_name: user.full_name,
                        email: user.email,
                        role: user.role
                    },
                    session: {
                        id: session.id,
                        expires_at: session.expires_at,
                        last_activity: session.last_activity
                    }
                }
            });

        } catch (error) {
            console.error('Login error:', error);

            if (error.message === 'Invalid credentials') {
                return res.status(401).json({
                    success: false,
                    message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
                });
            }

            res.status(500).json({
                success: false,
                message: 'خطأ في الخادم',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // تسجيل الخروج وإنهاء الجلسة
    async logout(req, res) {
        try {
            const sessionId = req.sessionId;

            if (sessionId) {
                const session = await UserSession.findByPk(sessionId);
                if (session) {
                    await session.terminate('manual');
                }
            }

            // مسح الكوكيز
            res.clearCookie('token');
            res.clearCookie('sessionId');

            res.status(200).json({
                success: true,
                message: 'تم تسجيل الخروج بنجاح'
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ أثناء تسجيل الخروج'
            });
        }
    },

    // تسجيل الخروج من جميع الأجهزة
    async logoutAll(req, res) {
        try {
            const userId = req.userId;

            // إنهاء جميع الجلسات النشطة للمستخدم
            await UserSession.update(
                {
                    is_active: false,
                    logout_time: new Date(),
                    logout_reason: 'forced'
                },
                {
                    where: {
                        user_id: userId,
                        is_active: true
                    }
                }
            );

            // مسح الكوكيز
            res.clearCookie('token');
            res.clearCookie('sessionId');

            res.status(200).json({
                success: true,
                message: 'تم تسجيل الخروج من جميع الأجهزة بنجاح'
            });

        } catch (error) {
            console.error('Logout all error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ أثناء تسجيل الخروج من جميع الأجهزة'
            });
        }
    },

    // الحصول على الجلسات النشطة للمستخدم
    async getActiveSessions(req, res) {
        try {
            const userId = req.userId;

            const sessions = await UserSession.findUserActiveSessions(userId);

            // تنسيق البيانات للعرض
            const formattedSessions = sessions.map(session => ({
                id: session.id,
                device_info: session.device_info,
                ip_address: session.ip_address,
                location: session.location,
                login_time: session.login_time,
                last_activity: session.last_activity,
                is_current: session.id === req.sessionId
            }));

            res.status(200).json({
                success: true,
                data: formattedSessions
            });

        } catch (error) {
            console.error('Get active sessions error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في استرجاع الجلسات النشطة'
            });
        }
    },

    // إنهاء جلسة محددة
    async terminateSession(req, res) {
        try {
            const { sessionId } = req.params;
            const currentUserId = req.userId;

            const session = await UserSession.findByPk(sessionId);

            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'الجلسة غير موجودة'
                });
            }

            // التأكد من أن المستخدم يملك هذه الجلسة
            if (session.user_id !== currentUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'غير مصرح لك بإنهاء هذه الجلسة'
                });
            }

            await session.terminate('forced');

            res.status(200).json({
                success: true,
                message: 'تم إنهاء الجلسة بنجاح'
            });

        } catch (error) {
            console.error('Terminate session error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في إنهاء الجلسة'
            });
        }
    },

    // تمديد الجلسة الحالية
    async extendSession(req, res) {
        try {
            const sessionId = req.sessionId;
            const { hours = 24 } = req.body;

            const session = await UserSession.findByPk(sessionId);

            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'الجلسة غير موجودة'
                });
            }

            await session.extend(hours);

            res.status(200).json({
                success: true,
                message: 'تم تمديد الجلسة بنجاح',
                data: {
                    expires_at: session.expires_at
                }
            });

        } catch (error) {
            console.error('Extend session error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تمديد الجلسة'
            });
        }
    },

    // تنظيف الجلسات المنتهية الصلاحية (مهمة مجدولة)
    async cleanupExpiredSessions(req, res) {
        try {
            const result = await UserSession.cleanupExpired();

            res.status(200).json({
                success: true,
                message: `تم تنظيف ${result[0]} جلسة منتهية الصلاحية`
            });

        } catch (error) {
            console.error('Cleanup expired sessions error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في تنظيف الجلسات المنتهية'
            });
        }
    },

    // التحقق من صحة الجلسة الحالية
    async validateSession(req, res) {
        try {
            const sessionId = req.sessionId;
            const userId = req.userId;

            // إذا لم يكن هناك sessionId، فهذا يعني أن الـ token صحيح لكن بدون جلسة
            if (!sessionId) {
                // إرجاع معلومات المستخدم فقط
                const user = await User.findByPk(userId, {
                    attributes: { exclude: ['password_hash'] }
                });

                return res.status(200).json({
                    success: true,
                    message: 'الرمز صحيح',
                    data: {
                        user: user,
                        session: null
                    }
                });
            }

            const session = await UserSession.findByPk(sessionId, {
                include: [{
                    model: User,
                    as: 'user'
                }]
            });

            if (!session || !session.is_active || session.isExpired()) {
                return res.status(401).json({
                    success: false,
                    message: 'الجلسة غير صحيحة أو منتهية الصلاحية'
                });
            }

            // تحديث وقت آخر نشاط
            await session.update({ last_activity: new Date() });

            res.status(200).json({
                success: true,
                message: 'الجلسة صحيحة',
                data: {
                    user: session.user,
                    session: {
                        id: session.id,
                        expires_at: session.expires_at,
                        last_activity: session.last_activity
                    }
                }
            });

        } catch (error) {
            console.error('Validate session error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في التحقق من الجلسة'
            });
        }
    }
};

export default sessionController; 
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';


// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        }
    );
};

// Helper function to generate refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
        }
    );
};

// @desc    تسجيل المستخدم الجديد
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const { username, email, password, full_name, phone, role = 'distributor' } = req.body;

        // Check if user already exists
        const { Op } = await import('sequelize');
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'اسم المستخدم أو البريد الإلكتروني مُستخدم بالفعل'
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password: password, // Will be hashed by the model
            full_name,
            phone,
            role,
            status: 'active'
        });



        // Generate tokens
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Set refresh token as httpOnly cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        };

        res.cookie('refreshToken', refreshToken, cookieOptions);

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح',
            data: {
                user: user.toJSON(),
                token,
                expiresIn: process.env.JWT_EXPIRE || '7d'
            }
        });

    } catch (error) {
        console.error('[AUTH] User registration failed:', error.message);
        if (process.env.NODE_ENV === 'development') {
            console.error('[AUTH] Full error:', error);
        }
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
};

// @desc    تسجيل الدخول
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const { username, email, password } = req.body;

        // Use username or email for login
        const usernameOrEmail = username || email;

        if (!usernameOrEmail || !password) {
            return res.status(400).json({
                success: false,
                message: 'اسم المستخدم/البريد الإلكتروني وكلمة المرور مطلوبان'
            });
        }

        // Find user and validate credentials
        const user = await User.findByCredentials(usernameOrEmail, password);

        // Update last login
        user.last_login = new Date();
        await user.save();

        // Generate tokens
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Set refresh token as httpOnly cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        };

        res.cookie('refreshToken', refreshToken, cookieOptions);

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            data: {
                user: user.toJSON(),
                token,
                expiresIn: process.env.JWT_EXPIRE || '7d'
            }
        });

    } catch (error) {
        console.error('[AUTH] User login failed:', error.message);
        if (process.env.NODE_ENV === 'development') {
            console.error('[AUTH] Full error:', error);
        }

        if (error.message === 'Invalid credentials') {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
};

// @desc    تسجيل الخروج
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    try {
        // Clear refresh token cookie
        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'تم تسجيل الخروج بنجاح'
        });
    } catch (error) {
        console.error('[AUTH] User logout failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
};

// @desc    الحصول على بيانات المستخدم الحالي
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('[AUTH] Get user profile failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
};

// @desc    تجديد الـ Access Token
// @route   POST /api/auth/refresh
// @access  Public (but needs refresh token)
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        // Debug logging in development only
        if (process.env.NODE_ENV === 'development') {
            console.log('[AUTH] Refresh token request - cookies:', Object.keys(req.cookies));
        }

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not provided'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type'
            });
        }

        // Check if user still exists and is active
        const user = await User.findOne({
            where: {
                id: decoded.userId,
                status: 'active'
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        // Generate new access token
        const newToken = generateToken(user.id);

        res.json({
            success: true,
            data: {
                token: newToken,
                expiresIn: process.env.JWT_EXPIRE || '7d'
            }
        });

    } catch (error) {
        console.error('[AUTH] Refresh token failed:', error.message);

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
};

// @desc    تغيير كلمة المرور
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findByPk(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'كلمة المرور الحالية غير صحيحة'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'تم تغيير كلمة المرور بنجاح'
        });

    } catch (error) {
        console.error('[AUTH] Change password failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
};

// @desc    الحصول على الملف الشخصي
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        res.json({
            success: true,
            data: {
                user: user.toJSON()
            }
        });
    } catch (error) {
        console.error('[AUTH] Get profile failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
};

// @desc    تحديث الملف الشخصي
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const { full_name, email, phone } = req.body;

        const user = await User.findByPk(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        // Check if email is being changed and is unique
        if (email && email !== user.email) {
            const { Op } = await import('sequelize');
            const existingUser = await User.findOne({
                where: { email, id: { [Op.ne]: req.userId } }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'البريد الإلكتروني مُستخدم بالفعل'
                });
            }
        }

        // Update user data
        const updateData = {};
        if (full_name !== undefined) updateData.full_name = full_name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;

        await user.update(updateData);

        res.json({
            success: true,
            message: 'تم تحديث الملف الشخصي بنجاح',
            data: user.toJSON()
        });

    } catch (error) {
        console.error('[AUTH] Update profile failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
}; 
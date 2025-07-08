import express from 'express';
import {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import {
    validateRegistration,
    validateLogin,
    validatePasswordChange,
    validateProfileUpdate
} from '../validators/authValidators.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validateRegistration, register);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getMe);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', optionalAuth, refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, validateProfileUpdate, updateProfile);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', protect, validatePasswordChange, changePassword);

export default router; 
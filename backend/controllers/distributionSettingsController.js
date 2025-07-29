import { validationResult } from 'express-validator';
import DistributionSettings from '../models/DistributionSettings.js';
import logger from '../config/logger.js';

// @desc    Get all distribution settings
// @route   GET /api/distribution/settings
// @access  Private (Admin only)
export const getSettings = async (req, res) => {
    try {
        const settings = await DistributionSettings.findAll({
            order: [['setting_key', 'ASC']]
        });

        res.status(200).json({
            success: true,
            message: 'Distribution settings retrieved successfully',
            data: { settings }
        });

    } catch (error) {
        logger.error('Error getting distribution settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving distribution settings',
            error: error.message
        });
    }
};

// @desc    Get specific setting
// @route   GET /api/distribution/settings/:key
// @access  Private
export const getSetting = async (req, res) => {
    try {
        const { key } = req.params;

        const setting = await DistributionSettings.getSetting(key);

        res.status(200).json({
            success: true,
            message: 'Setting retrieved successfully',
            data: { 
                key,
                value: setting
            }
        });

    } catch (error) {
        logger.error('Error getting setting:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving setting',
            error: error.message
        });
    }
};

// @desc    Update setting
// @route   PUT /api/distribution/settings/:key
// @access  Private (Admin only)
export const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;

        // Only admins can update settings
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can update settings'
            });
        }

        await DistributionSettings.setSetting(key, value, description);

        res.status(200).json({
            success: true,
            message: 'Setting updated successfully',
            data: { key, value }
        });

    } catch (error) {
        logger.error('Error updating setting:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating setting',
            error: error.message
        });
    }
};
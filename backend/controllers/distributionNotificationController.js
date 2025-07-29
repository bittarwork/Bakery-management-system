import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import DistributionNotification from '../models/DistributionNotification.js';
import { User } from '../models/index.js';
import logger from '../config/logger.js';

// @desc    Get notifications for distributor
// @route   GET /api/distribution/notifications
// @access  Private
export const getNotifications = async (req, res) => {
    try {
        const {
            distributor_id,
            is_read,
            notification_type,
            page = 1,
            limit = 20
        } = req.query;

        // Build where clause
        const whereClause = {};
        
        if (distributor_id) {
            whereClause.distributor_id = distributor_id;
        }
        
        if (is_read !== undefined) {
            whereClause.is_read = is_read === 'true';
        }
        
        if (notification_type) {
            whereClause.notification_type = notification_type;
        }

        // Get notifications with pagination
        const offset = (page - 1) * limit;
        const { count, rows: notifications } = await DistributionNotification.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'distributor',
                    attributes: ['id', 'full_name', 'phone']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: {
                notifications,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_records: count,
                    per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        logger.error('Error getting notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving notifications',
            error: error.message
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/distribution/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await DistributionNotification.findByPk(id);
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await notification.markAsRead();

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: { notification }
        });

    } catch (error) {
        logger.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read',
            error: error.message
        });
    }
};

// @desc    Get unread count for distributor
// @route   GET /api/distribution/notifications/unread-count/:distributorId
// @access  Private
export const getUnreadCount = async (req, res) => {
    try {
        const { distributorId } = req.params;

        const unreadCount = await DistributionNotification.getUnreadCount(distributorId);

        res.status(200).json({
            success: true,
            message: 'Unread count retrieved successfully',
            data: { unread_count: unreadCount }
        });

    } catch (error) {
        logger.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving unread count',
            error: error.message
        });
    }
};
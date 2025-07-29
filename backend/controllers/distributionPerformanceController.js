import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import DistributionPerformance from '../models/DistributionPerformance.js';
import DistributionTrip from '../models/DistributionTrip.js';
import DailyDistributionSchedule from '../models/DailyDistributionSchedule.js';
import { User } from '../models/index.js';
import logger from '../config/logger.js';

// @desc    Get performance metrics for distributors
// @route   GET /api/distribution/performance
// @access  Private
export const getPerformanceMetrics = async (req, res) => {
    try {
        const {
            distributor_id,
            start_date,
            end_date,
            page = 1,
            limit = 20
        } = req.query;

        // Build where clause
        const whereClause = {};
        
        if (distributor_id) {
            whereClause.distributor_id = distributor_id;
        }
        
        if (start_date && end_date) {
            whereClause.performance_date = {
                [Op.between]: [start_date, end_date]
            };
        }

        // Get performance records with pagination
        const offset = (page - 1) * limit;
        const { count, rows: performances } = await DistributionPerformance.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'distributor',
                    attributes: ['id', 'full_name', 'phone']
                }
            ],
            order: [['performance_date', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.status(200).json({
            success: true,
            message: 'Performance metrics retrieved successfully',
            data: {
                performances,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_records: count,
                    per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        logger.error('Error getting performance metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving performance metrics',
            error: error.message
        });
    }
};

// @desc    Calculate daily performance for distributor
// @route   POST /api/distribution/performance/calculate
// @access  Private
export const calculateDailyPerformance = async (req, res) => {
    try {
        const { distributor_id, date } = req.body;

        const performance = await DistributionPerformance.calculateDailyPerformance(
            distributor_id,
            date
        );

        res.status(201).json({
            success: true,
            message: 'Daily performance calculated successfully',
            data: { performance }
        });

    } catch (error) {
        logger.error('Error calculating daily performance:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating daily performance',
            error: error.message
        });
    }
};

// @desc    Get performance summary
// @route   GET /api/distribution/performance/summary
// @access  Private
export const getPerformanceSummary = async (req, res) => {
    try {
        const { distributor_id, period = 'week' } = req.query;

        const summary = await DistributionPerformance.getPerformanceSummary(
            distributor_id,
            period
        );

        res.status(200).json({
            success: true,
            message: 'Performance summary retrieved successfully',
            data: { summary }
        });

    } catch (error) {
        logger.error('Error getting performance summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving performance summary',
            error: error.message
        });
    }
};
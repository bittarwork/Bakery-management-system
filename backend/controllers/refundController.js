import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Order, OrderItem, Product, Store, User } from '../models/index.js';
import sequelize from '../config/database.js';

// Mock refund data (in real app, this would be a database table)
let refundData = [];

// @desc    Create a refund request
// @route   POST /api/refunds
// @access  Private
export const createRefund = async (req, res) => {
    try {
        const {
            order_id,
            refund_type = 'partial',
            items = [],
            reason,
            amount_eur,
            amount_syp,
            currency = 'EUR',
            notes
        } = req.body;

        // Validate order exists
        const order = await Order.findByPk(order_id, {
            include: [
                { model: OrderItem, as: 'items' },
                { model: Store, as: 'store' }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Validate refund amount
        const maxRefundEur = parseFloat(order.final_amount_eur || 0);
        const maxRefundSyp = parseFloat(order.final_amount_syp || 0);

        if (currency === 'EUR' && amount_eur > maxRefundEur) {
            return res.status(400).json({
                success: false,
                message: `Refund amount cannot exceed €${maxRefundEur}`
            });
        }

        if (currency === 'SYP' && amount_syp > maxRefundSyp) {
            return res.status(400).json({
                success: false,
                message: `Refund amount cannot exceed ${maxRefundSyp} SYP`
            });
        }

        // Generate refund number
        const refundNumber = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        // Create refund record
        const refund = {
            id: Date.now(),
            refund_number: refundNumber,
            order_id: order_id,
            order_number: order.order_number,
            store_id: order.store_id,
            store_name: order.store_name,
            refund_type: refund_type,
            status: 'pending',
            amount_eur: parseFloat(amount_eur || 0),
            amount_syp: parseFloat(amount_syp || 0),
            currency: currency,
            reason: reason,
            notes: notes,
            items: items,
            requested_by: req.user.id,
            requested_by_name: req.user.full_name || req.user.username,
            created_at: new Date(),
            updated_at: new Date()
        };

        // Add to mock data
        refundData.push(refund);

        res.status(201).json({
            success: true,
            data: refund,
            message: 'Refund request created successfully'
        });

    } catch (error) {
        console.error('[REFUND] Failed to create refund:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create refund request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all refunds
// @route   GET /api/refunds
// @access  Private
export const getRefunds = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            refund_type,
            store_id,
            order_id,
            currency,
            date_from,
            date_to,
            search
        } = req.query;

        let filteredRefunds = refundData;

        // Apply filters
        if (status) {
            filteredRefunds = filteredRefunds.filter(refund => refund.status === status);
        }

        if (refund_type) {
            filteredRefunds = filteredRefunds.filter(refund => refund.refund_type === refund_type);
        }

        if (store_id) {
            filteredRefunds = filteredRefunds.filter(refund => refund.store_id === parseInt(store_id));
        }

        if (order_id) {
            filteredRefunds = filteredRefunds.filter(refund => refund.order_id === parseInt(order_id));
        }

        if (currency) {
            filteredRefunds = filteredRefunds.filter(refund => refund.currency === currency);
        }

        if (date_from || date_to) {
            filteredRefunds = filteredRefunds.filter(refund => {
                const refundDate = new Date(refund.created_at);
                if (date_from && refundDate < new Date(date_from)) return false;
                if (date_to && refundDate > new Date(date_to)) return false;
                return true;
            });
        }

        if (search) {
            filteredRefunds = filteredRefunds.filter(refund =>
                refund.refund_number.includes(search) ||
                refund.order_number.includes(search) ||
                refund.store_name.includes(search) ||
                refund.reason.includes(search)
            );
        }

        // Sort by created date (newest first)
        filteredRefunds.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Pagination
        const offset = (page - 1) * limit;
        const paginatedRefunds = filteredRefunds.slice(offset, offset + limit);

        const response = {
            refunds: paginatedRefunds,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: filteredRefunds.length,
                totalPages: Math.ceil(filteredRefunds.length / limit)
            }
        };

        res.json({
            success: true,
            data: response,
            message: 'Refunds retrieved successfully'
        });

    } catch (error) {
        console.error('[REFUND] Failed to get refunds:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get refunds',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get refund by ID
// @route   GET /api/refunds/:id
// @access  Private
export const getRefund = async (req, res) => {
    try {
        const { id } = req.params;

        const refund = refundData.find(r => r.id === parseInt(id));

        if (!refund) {
            return res.status(404).json({
                success: false,
                message: 'Refund not found'
            });
        }

        res.json({
            success: true,
            data: refund,
            message: 'Refund retrieved successfully'
        });

    } catch (error) {
        console.error('[REFUND] Failed to get refund:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get refund',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Process refund (approve/reject)
// @route   PATCH /api/refunds/:id/process
// @access  Private
export const processRefund = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, notes, payment_method = 'cash' } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be approve or reject'
            });
        }

        const refundIndex = refundData.findIndex(r => r.id === parseInt(id));

        if (refundIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Refund not found'
            });
        }

        const refund = refundData[refundIndex];

        if (refund.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Refund has already been processed'
            });
        }

        // Update refund status
        refund.status = action === 'approve' ? 'approved' : 'rejected';
        refund.processed_by = req.user.id;
        refund.processed_by_name = req.user.full_name || req.user.username;
        refund.processed_at = new Date();
        refund.processing_notes = notes;

        if (action === 'approve') {
            refund.payment_method = payment_method;
            refund.approved_amount_eur = refund.amount_eur;
            refund.approved_amount_syp = refund.amount_syp;
        }

        refund.updated_at = new Date();

        // Update the refund in the array
        refundData[refundIndex] = refund;

        res.json({
            success: true,
            data: refund,
            message: `Refund ${action}d successfully`
        });

    } catch (error) {
        console.error('[REFUND] Failed to process refund:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to process refund',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Complete refund payment
// @route   PATCH /api/refunds/:id/complete
// @access  Private
export const completeRefund = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_reference, actual_amount_eur, actual_amount_syp } = req.body;

        const refundIndex = refundData.findIndex(r => r.id === parseInt(id));

        if (refundIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Refund not found'
            });
        }

        const refund = refundData[refundIndex];

        if (refund.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Refund must be approved before completion'
            });
        }

        // Update refund to completed
        refund.status = 'completed';
        refund.payment_reference = payment_reference;
        refund.actual_amount_eur = actual_amount_eur || refund.approved_amount_eur;
        refund.actual_amount_syp = actual_amount_syp || refund.approved_amount_syp;
        refund.completed_by = req.user.id;
        refund.completed_by_name = req.user.full_name || req.user.username;
        refund.completed_at = new Date();
        refund.updated_at = new Date();

        // Update the refund in the array
        refundData[refundIndex] = refund;

        res.json({
            success: true,
            data: refund,
            message: 'Refund completed successfully'
        });

    } catch (error) {
        console.error('[REFUND] Failed to complete refund:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to complete refund',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get refund statistics
// @route   GET /api/refunds/statistics
// @access  Private
export const getRefundStatistics = async (req, res) => {
    try {
        const { date_from, date_to, store_id, currency = 'EUR' } = req.query;

        let filteredRefunds = refundData;

        // Apply filters
        if (date_from || date_to) {
            filteredRefunds = filteredRefunds.filter(refund => {
                const refundDate = new Date(refund.created_at);
                if (date_from && refundDate < new Date(date_from)) return false;
                if (date_to && refundDate > new Date(date_to)) return false;
                return true;
            });
        }

        if (store_id) {
            filteredRefunds = filteredRefunds.filter(refund => refund.store_id === parseInt(store_id));
        }

        // Calculate statistics
        const totalRefunds = filteredRefunds.length;
        const totalAmountEur = filteredRefunds.reduce((sum, refund) => sum + refund.amount_eur, 0);
        const totalAmountSyp = filteredRefunds.reduce((sum, refund) => sum + refund.amount_syp, 0);

        const statusCounts = {
            pending: filteredRefunds.filter(r => r.status === 'pending').length,
            approved: filteredRefunds.filter(r => r.status === 'approved').length,
            rejected: filteredRefunds.filter(r => r.status === 'rejected').length,
            completed: filteredRefunds.filter(r => r.status === 'completed').length
        };

        const typeCounts = {
            full: filteredRefunds.filter(r => r.refund_type === 'full').length,
            partial: filteredRefunds.filter(r => r.refund_type === 'partial').length,
            item_specific: filteredRefunds.filter(r => r.refund_type === 'item_specific').length
        };

        const averageProcessingTime = calculateAverageProcessingTime(filteredRefunds);

        const statistics = {
            total_refunds: totalRefunds,
            total_amount_eur: totalAmountEur,
            total_amount_syp: totalAmountSyp,
            status_breakdown: statusCounts,
            type_breakdown: typeCounts,
            average_processing_time_hours: averageProcessingTime,
            refund_rate: calculateRefundRate(filteredRefunds),
            most_common_reasons: getMostCommonReasons(filteredRefunds),
            monthly_trends: getMonthlyTrends(filteredRefunds),
            currency: currency,
            period: {
                from: date_from,
                to: date_to
            }
        };

        res.json({
            success: true,
            data: statistics,
            message: 'Refund statistics retrieved successfully'
        });

    } catch (error) {
        console.error('[REFUND] Failed to get refund statistics:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get refund statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Calculate refund amount
// @route   POST /api/refunds/calculate
// @access  Private
export const calculateRefundAmount = async (req, res) => {
    try {
        const { order_id, items, refund_type, currency = 'EUR' } = req.body;

        // Validate order exists
        const order = await Order.findByPk(order_id, {
            include: [{ model: OrderItem, as: 'items' }]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        let refundAmount = 0;
        let refundItems = [];

        switch (refund_type) {
            case 'full':
                refundAmount = currency === 'EUR' ?
                    parseFloat(order.final_amount_eur || 0) :
                    parseFloat(order.final_amount_syp || 0);
                refundItems = order.items.map(item => ({
                    id: item.id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    refund_amount: currency === 'EUR' ? item.total_price_eur : item.total_price_syp
                }));
                break;

            case 'partial':
                // Calculate based on percentage or fixed amount
                const partialPercentage = req.body.partial_percentage || 100;
                const baseAmount = currency === 'EUR' ?
                    parseFloat(order.final_amount_eur || 0) :
                    parseFloat(order.final_amount_syp || 0);
                refundAmount = baseAmount * (partialPercentage / 100);
                break;

            case 'item_specific':
                if (!items || !Array.isArray(items)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Items array is required for item-specific refunds'
                    });
                }

                for (const item of items) {
                    const orderItem = order.items.find(oi => oi.id === item.order_item_id);
                    if (orderItem) {
                        const itemRefundAmount = currency === 'EUR' ?
                            (orderItem.unit_price_eur * item.quantity) :
                            (orderItem.unit_price_syp * item.quantity);

                        refundAmount += itemRefundAmount;
                        refundItems.push({
                            id: orderItem.id,
                            product_name: orderItem.product_name,
                            quantity: item.quantity,
                            refund_amount: itemRefundAmount
                        });
                    }
                }
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid refund type'
                });
        }

        // Apply any fees or deductions
        const processingFee = calculateProcessingFee(refundAmount, refund_type);
        const finalRefundAmount = refundAmount - processingFee;

        const calculation = {
            order_id: order_id,
            order_number: order.order_number,
            refund_type: refund_type,
            currency: currency,
            original_amount: currency === 'EUR' ? order.final_amount_eur : order.final_amount_syp,
            gross_refund_amount: refundAmount,
            processing_fee: processingFee,
            net_refund_amount: finalRefundAmount,
            items: refundItems,
            calculated_at: new Date()
        };

        res.json({
            success: true,
            data: calculation,
            message: 'Refund amount calculated successfully'
        });

    } catch (error) {
        console.error('[REFUND] Failed to calculate refund amount:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate refund amount',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Export refund data
// @route   GET /api/refunds/export
// @access  Private
export const exportRefunds = async (req, res) => {
    try {
        const { format = 'csv', date_from, date_to, status } = req.query;

        let exportData = refundData;

        // Apply filters
        if (date_from || date_to) {
            exportData = exportData.filter(refund => {
                const refundDate = new Date(refund.created_at);
                if (date_from && refundDate < new Date(date_from)) return false;
                if (date_to && refundDate > new Date(date_to)) return false;
                return true;
            });
        }

        if (status) {
            exportData = exportData.filter(refund => refund.status === status);
        }

        // In a real application, this would generate actual file
        const exportInfo = {
            format: format,
            filename: `refunds_${new Date().toISOString().split('T')[0]}.${format}`,
            record_count: exportData.length,
            size: `${(exportData.length * 0.5).toFixed(1)}KB`,
            download_url: `/api/refunds/download/${Date.now()}`,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        };

        res.json({
            success: true,
            data: exportInfo,
            message: 'Refund data export prepared successfully'
        });

    } catch (error) {
        console.error('[REFUND] Failed to export refunds:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to export refunds',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper functions
const calculateAverageProcessingTime = (refunds) => {
    const processedRefunds = refunds.filter(r => r.processed_at);
    if (processedRefunds.length === 0) return 0;

    const totalTime = processedRefunds.reduce((sum, refund) => {
        const created = new Date(refund.created_at);
        const processed = new Date(refund.processed_at);
        return sum + (processed - created);
    }, 0);

    return totalTime / processedRefunds.length / (1000 * 60 * 60); // Convert to hours
};

const calculateRefundRate = (refunds) => {
    // This would normally calculate against total orders
    // For now, return a mock value
    return 2.5; // 2.5% refund rate
};

const getMostCommonReasons = (refunds) => {
    const reasonCounts = {};
    refunds.forEach(refund => {
        if (refund.reason) {
            reasonCounts[refund.reason] = (reasonCounts[refund.reason] || 0) + 1;
        }
    });

    return Object.entries(reasonCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([reason, count]) => ({ reason, count }));
};

const getMonthlyTrends = (refunds) => {
    const monthlyData = {};

    refunds.forEach(refund => {
        const month = new Date(refund.created_at).toISOString().slice(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = {
                month: month,
                count: 0,
                total_amount_eur: 0,
                total_amount_syp: 0
            };
        }

        monthlyData[month].count++;
        monthlyData[month].total_amount_eur += refund.amount_eur;
        monthlyData[month].total_amount_syp += refund.amount_syp;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
};

const calculateProcessingFee = (amount, refundType) => {
    // Mock processing fee calculation
    const feeRates = {
        full: 0.01,    // 1% for full refunds
        partial: 0.015, // 1.5% for partial refunds
        item_specific: 0.02 // 2% for item-specific refunds
    };

    return amount * (feeRates[refundType] || 0.01);
}; 
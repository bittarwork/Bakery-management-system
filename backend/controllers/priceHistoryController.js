import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Product, getSequelizeConnection } from '../models/index.js';

// Mock price history data (in real app, this would be a database table)
let priceHistoryData = [];

// @desc    Get price history for a product
// @route   GET /api/price-history/products/:productId
// @access  Private
export const getProductPriceHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        const {
            date_from,
            date_to,
            currency,
            limit = 50,
            page = 1
        } = req.query;

        // Validate product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Filter price history
        let filteredHistory = priceHistoryData.filter(
            history => history.product_id === parseInt(productId)
        );

        if (date_from) {
            filteredHistory = filteredHistory.filter(
                history => new Date(history.effective_date) >= new Date(date_from)
            );
        }

        if (date_to) {
            filteredHistory = filteredHistory.filter(
                history => new Date(history.effective_date) <= new Date(date_to)
            );
        }

        if (currency) {
            filteredHistory = filteredHistory.filter(
                history => history.currency === currency
            );
        }

        // Sort by date (newest first)
        filteredHistory.sort((a, b) => new Date(b.effective_date) - new Date(a.effective_date));

        // Pagination
        const offset = (page - 1) * limit;
        const paginatedHistory = filteredHistory.slice(offset, offset + limit);

        const response = {
            history: paginatedHistory,
            product: {
                id: product.id,
                name: product.name,
                current_price_eur: product.price_eur,
                current_price_syp: product.price_syp
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: filteredHistory.length,
                totalPages: Math.ceil(filteredHistory.length / limit)
            }
        };

        res.json({
            success: true,
            data: response,
            message: 'Price history retrieved successfully'
        });

    } catch (error) {
        console.error('[PRICE-HISTORY] Failed to get price history:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get price history',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Record a price change
// @route   POST /api/price-history/record
// @access  Private
export const recordPriceChange = async (req, res) => {
    try {
        const {
            product_id,
            old_price_eur,
            new_price_eur,
            old_price_syp,
            new_price_syp,
            currency = 'EUR',
            change_reason = 'Manual update',
            notes,
            effective_date
        } = req.body;

        // Validate product exists
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Create price history record
        const priceChange = {
            id: Date.now(),
            product_id: parseInt(product_id),
            product_name: product.name,
            old_price_eur: parseFloat(old_price_eur || 0),
            new_price_eur: parseFloat(new_price_eur || 0),
            old_price_syp: parseFloat(old_price_syp || 0),
            new_price_syp: parseFloat(new_price_syp || 0),
            currency: currency,
            change_reason: change_reason,
            change_percentage: currency === 'EUR' ?
                ((new_price_eur - old_price_eur) / old_price_eur * 100) :
                ((new_price_syp - old_price_syp) / old_price_syp * 100),
            changed_by: req.user.id,
            changed_by_name: req.user.full_name || req.user.username,
            effective_date: effective_date || new Date(),
            notes: notes,
            created_at: new Date()
        };

        // Add to mock data
        priceHistoryData.push(priceChange);

        // Update product price
        const updateData = {};
        if (new_price_eur !== undefined) updateData.price_eur = new_price_eur;
        if (new_price_syp !== undefined) updateData.price_syp = new_price_syp;

        await product.update(updateData);

        res.json({
            success: true,
            data: priceChange,
            message: 'Price change recorded successfully'
        });

    } catch (error) {
        console.error('[PRICE-HISTORY] Failed to record price change:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to record price change',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get price analytics
// @route   GET /api/price-history/analytics
// @access  Private
export const getPriceAnalytics = async (req, res) => {
    try {
        const {
            date_from,
            date_to,
            product_ids,
            currency = 'EUR',
            analysis_type = 'trends'
        } = req.query;

        let analyticsData = priceHistoryData;

        // Filter by date range
        if (date_from || date_to) {
            analyticsData = analyticsData.filter(record => {
                const recordDate = new Date(record.effective_date);
                if (date_from && recordDate < new Date(date_from)) return false;
                if (date_to && recordDate > new Date(date_to)) return false;
                return true;
            });
        }

        // Filter by product IDs
        if (product_ids) {
            const productIdArray = product_ids.split(',').map(id => parseInt(id));
            analyticsData = analyticsData.filter(record =>
                productIdArray.includes(record.product_id)
            );
        }

        // Filter by currency
        analyticsData = analyticsData.filter(record => record.currency === currency);

        // Calculate analytics
        const analytics = {
            total_price_changes: analyticsData.length,
            average_price_change: analyticsData.reduce((sum, record) =>
                sum + Math.abs(record.change_percentage), 0) / analyticsData.length || 0,
            price_increases: analyticsData.filter(record => record.change_percentage > 0).length,
            price_decreases: analyticsData.filter(record => record.change_percentage < 0).length,
            most_changed_products: getMostChangedProducts(analyticsData),
            price_trends: getPriceTrends(analyticsData),
            volatility_score: calculateVolatilityScore(analyticsData),
            change_frequency: getChangeFrequency(analyticsData),
            currency: currency,
            analysis_period: {
                from: date_from,
                to: date_to
            }
        };

        res.json({
            success: true,
            data: analytics,
            message: 'Price analytics retrieved successfully'
        });

    } catch (error) {
        console.error('[PRICE-HISTORY] Failed to get price analytics:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get price analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get price trends
// @route   GET /api/price-history/trends
// @access  Private
export const getPriceTrends = async (req, res) => {
    try {
        const {
            period = 'month',
            product_ids,
            currency = 'EUR',
            date_from,
            date_to
        } = req.query;

        let trendsData = priceHistoryData;

        // Filter data
        if (date_from || date_to) {
            trendsData = trendsData.filter(record => {
                const recordDate = new Date(record.effective_date);
                if (date_from && recordDate < new Date(date_from)) return false;
                if (date_to && recordDate > new Date(date_to)) return false;
                return true;
            });
        }

        if (product_ids) {
            const productIdArray = product_ids.split(',').map(id => parseInt(id));
            trendsData = trendsData.filter(record =>
                productIdArray.includes(record.product_id)
            );
        }

        trendsData = trendsData.filter(record => record.currency === currency);

        const trends = getPriceTrendsInternal(trendsData, period);

        res.json({
            success: true,
            data: trends,
            message: 'Price trends retrieved successfully'
        });

    } catch (error) {
        console.error('[PRICE-HISTORY] Failed to get price trends:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get price trends',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Bulk update prices
// @route   POST /api/price-history/bulk-update
// @access  Private
export const bulkUpdatePrices = async (req, res) => {
    try {
        const { updates } = req.body;

        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({
                success: false,
                message: 'Updates array is required'
            });
        }

        const results = [];
        const errors = [];

        for (const update of updates) {
            try {
                const product = await Product.findByPk(update.product_id);
                if (!product) {
                    errors.push({
                        product_id: update.product_id,
                        error: 'Product not found'
                    });
                    continue;
                }

                // Record price change
                const priceChange = {
                    id: Date.now() + Math.random(),
                    product_id: update.product_id,
                    product_name: product.name,
                    old_price_eur: product.price_eur,
                    new_price_eur: update.new_price_eur || product.price_eur,
                    old_price_syp: product.price_syp,
                    new_price_syp: update.new_price_syp || product.price_syp,
                    currency: update.currency || 'EUR',
                    change_reason: update.change_reason || 'Bulk update',
                    change_percentage: update.currency === 'EUR' ?
                        ((update.new_price_eur - product.price_eur) / product.price_eur * 100) :
                        ((update.new_price_syp - product.price_syp) / product.price_syp * 100),
                    changed_by: req.user.id,
                    changed_by_name: req.user.full_name || req.user.username,
                    effective_date: update.effective_date || new Date(),
                    notes: update.notes,
                    created_at: new Date()
                };

                priceHistoryData.push(priceChange);

                // Update product price
                const updateData = {};
                if (update.new_price_eur !== undefined) updateData.price_eur = update.new_price_eur;
                if (update.new_price_syp !== undefined) updateData.price_syp = update.new_price_syp;

                await product.update(updateData);

                results.push({
                    product_id: update.product_id,
                    success: true,
                    price_change: priceChange
                });

            } catch (error) {
                errors.push({
                    product_id: update.product_id,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            data: {
                successful_updates: results.length,
                failed_updates: errors.length,
                results: results,
                errors: errors
            },
            message: `Bulk price update completed: ${results.length} successful, ${errors.length} failed`
        });

    } catch (error) {
        console.error('[PRICE-HISTORY] Failed to bulk update prices:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to bulk update prices',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get price alerts
// @route   GET /api/price-history/alerts
// @access  Private
export const getPriceAlerts = async (req, res) => {
    try {
        const { product_ids, alert_type, is_active, currency } = req.query;

        // Mock alerts data
        const alerts = [
            {
                id: 1,
                product_id: 1,
                product_name: 'Bread',
                alert_type: 'price_change',
                threshold_value: 5,
                threshold_type: 'percentage',
                currency: 'EUR',
                is_active: true,
                created_at: new Date(),
                last_triggered: null
            },
            {
                id: 2,
                product_id: 2,
                product_name: 'Croissant',
                alert_type: 'threshold',
                threshold_value: 2.5,
                threshold_type: 'absolute',
                currency: 'EUR',
                is_active: true,
                created_at: new Date(),
                last_triggered: new Date()
            }
        ];

        let filteredAlerts = alerts;

        if (product_ids) {
            const productIdArray = product_ids.split(',').map(id => parseInt(id));
            filteredAlerts = filteredAlerts.filter(alert =>
                productIdArray.includes(alert.product_id)
            );
        }

        if (alert_type) {
            filteredAlerts = filteredAlerts.filter(alert => alert.alert_type === alert_type);
        }

        if (is_active !== undefined) {
            filteredAlerts = filteredAlerts.filter(alert => alert.is_active === (is_active === 'true'));
        }

        if (currency) {
            filteredAlerts = filteredAlerts.filter(alert => alert.currency === currency);
        }

        res.json({
            success: true,
            data: filteredAlerts,
            message: 'Price alerts retrieved successfully'
        });

    } catch (error) {
        console.error('[PRICE-HISTORY] Failed to get price alerts:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get price alerts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper functions
const getMostChangedProducts = (data) => {
    const productChanges = {};

    data.forEach(record => {
        if (!productChanges[record.product_id]) {
            productChanges[record.product_id] = {
                product_id: record.product_id,
                product_name: record.product_name,
                total_changes: 0,
                avg_change: 0,
                changes: []
            };
        }

        productChanges[record.product_id].total_changes++;
        productChanges[record.product_id].changes.push(record.change_percentage);
    });

    // Calculate average change for each product
    Object.values(productChanges).forEach(product => {
        product.avg_change = product.changes.reduce((sum, change) => sum + Math.abs(change), 0) / product.changes.length;
    });

    // Sort by average change (descending)
    return Object.values(productChanges)
        .sort((a, b) => b.avg_change - a.avg_change)
        .slice(0, 10);
};

const getPriceTrendsInternal = (data, period) => {
    const trends = {};

    data.forEach(record => {
        let periodKey;
        const date = new Date(record.effective_date);

        switch (period) {
            case 'day':
                periodKey = date.toISOString().split('T')[0];
                break;
            case 'week':
                const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
                periodKey = startOfWeek.toISOString().split('T')[0];
                break;
            case 'month':
                periodKey = date.toISOString().slice(0, 7);
                break;
            case 'year':
                periodKey = date.getFullYear().toString();
                break;
            default:
                periodKey = date.toISOString().slice(0, 7);
        }

        if (!trends[periodKey]) {
            trends[periodKey] = {
                period: periodKey,
                total_changes: 0,
                avg_change: 0,
                increases: 0,
                decreases: 0
            };
        }

        trends[periodKey].total_changes++;
        if (record.change_percentage > 0) {
            trends[periodKey].increases++;
        } else if (record.change_percentage < 0) {
            trends[periodKey].decreases++;
        }
    });

    return Object.values(trends).sort((a, b) => a.period.localeCompare(b.period));
};

const calculateVolatilityScore = (data) => {
    if (data.length === 0) return 0;

    const changes = data.map(record => Math.abs(record.change_percentage));
    const avg = changes.reduce((sum, change) => sum + change, 0) / changes.length;

    const variance = changes.reduce((sum, change) => sum + Math.pow(change - avg, 2), 0) / changes.length;

    return Math.sqrt(variance);
};

const getChangeFrequency = (data) => {
    const productFrequency = {};

    data.forEach(record => {
        if (!productFrequency[record.product_id]) {
            productFrequency[record.product_id] = {
                product_name: record.product_name,
                changes: 0,
                last_change: null
            };
        }

        productFrequency[record.product_id].changes++;
        if (!productFrequency[record.product_id].last_change ||
            new Date(record.effective_date) > new Date(productFrequency[record.product_id].last_change)) {
            productFrequency[record.product_id].last_change = record.effective_date;
        }
    });

    return Object.values(productFrequency);
}; 
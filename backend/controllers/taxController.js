import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Order, OrderItem, Product, Store } from '../models/index.js';
import sequelize from '../config/database.js';

// Default tax configuration
const DEFAULT_TAX_CONFIG = {
    defaultTaxRate: 0.0,
    taxRates: {
        EUR: 0.0,
        SYP: 0.0,
    },
    taxExemptions: [],
    taxRegions: [],
    isActive: true,
    lastUpdated: new Date(),
};

// @desc    Calculate tax for an order
// @route   POST /api/tax/calculate
// @access  Private
export const calculateTax = async (req, res) => {
    try {
        const { items, currency = 'EUR', customer_type = 'regular', region = 'default' } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Items are required for tax calculation'
            });
        }

        // Get tax configuration
        const taxConfig = await getTaxConfig();
        const taxRate = taxConfig.taxRates[currency] || DEFAULT_TAX_CONFIG.defaultTaxRate;

        let subtotal = 0;
        let taxableAmount = 0;
        let taxAmount = 0;
        let totalAmount = 0;

        const calculatedItems = [];

        for (const item of items) {
            const itemSubtotal = item.quantity * item.unit_price;
            const itemTax = itemSubtotal * (taxRate / 100);
            const itemTotal = itemSubtotal + itemTax;

            calculatedItems.push({
                ...item,
                subtotal: itemSubtotal,
                tax_amount: itemTax,
                total_amount: itemTotal,
                tax_rate: taxRate
            });

            subtotal += itemSubtotal;
            taxableAmount += itemSubtotal;
            taxAmount += itemTax;
            totalAmount += itemTotal;
        }

        const taxCalculation = {
            subtotal: subtotal,
            taxable_amount: taxableAmount,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            currency: currency,
            customer_type: customer_type,
            region: region,
            items: calculatedItems,
            calculation_date: new Date(),
            tax_config_version: taxConfig.version || '1.0'
        };

        res.json({
            success: true,
            data: taxCalculation,
            message: 'Tax calculated successfully'
        });

    } catch (error) {
        console.error('[TAX] Failed to calculate tax:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate tax',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get tax configuration
// @route   GET /api/tax/config
// @access  Private
export const getTaxConfig = async (req, res) => {
    try {
        // In a real application, this would come from database
        // For now, we'll use a default configuration
        const taxConfig = {
            ...DEFAULT_TAX_CONFIG,
            version: '1.0',
            created_at: new Date(),
            updated_at: new Date()
        };

        if (res) {
            res.json({
                success: true,
                data: taxConfig,
                message: 'Tax configuration retrieved successfully'
            });
        }

        return taxConfig;

    } catch (error) {
        console.error('[TAX] Failed to get tax config:', error.message);
        if (res) {
            res.status(500).json({
                success: false,
                message: 'Failed to get tax configuration',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
        return DEFAULT_TAX_CONFIG;
    }
};

// @desc    Update tax configuration
// @route   PUT /api/tax/config
// @access  Private (Admin only)
export const updateTaxConfig = async (req, res) => {
    try {
        const { defaultTaxRate, taxRates, taxExemptions, taxRegions, isActive } = req.body;

        // Validate tax rates
        if (taxRates) {
            for (const [currency, rate] of Object.entries(taxRates)) {
                if (rate < 0 || rate > 100) {
                    return res.status(400).json({
                        success: false,
                        message: `Tax rate for ${currency} must be between 0 and 100`
                    });
                }
            }
        }

        // In a real application, this would be saved to database
        const updatedConfig = {
            defaultTaxRate: defaultTaxRate || DEFAULT_TAX_CONFIG.defaultTaxRate,
            taxRates: taxRates || DEFAULT_TAX_CONFIG.taxRates,
            taxExemptions: taxExemptions || DEFAULT_TAX_CONFIG.taxExemptions,
            taxRegions: taxRegions || DEFAULT_TAX_CONFIG.taxRegions,
            isActive: isActive !== undefined ? isActive : DEFAULT_TAX_CONFIG.isActive,
            version: '1.0',
            updated_at: new Date(),
            updated_by: req.user.id
        };

        res.json({
            success: true,
            data: updatedConfig,
            message: 'Tax configuration updated successfully'
        });

    } catch (error) {
        console.error('[TAX] Failed to update tax config:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update tax configuration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get tax rates by region
// @route   GET /api/tax/rates/:region
// @access  Private
export const getTaxRatesByRegion = async (req, res) => {
    try {
        const { region } = req.params;

        const taxConfig = await getTaxConfig();
        const regionConfig = taxConfig.taxRegions.find(r => r.code === region);

        if (!regionConfig) {
            return res.status(404).json({
                success: false,
                message: `Tax rates for region ${region} not found`
            });
        }

        res.json({
            success: true,
            data: regionConfig,
            message: 'Tax rates retrieved successfully'
        });

    } catch (error) {
        console.error('[TAX] Failed to get tax rates:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get tax rates',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Generate tax report
// @route   GET /api/tax/report
// @access  Private
export const generateTaxReport = async (req, res) => {
    try {
        const {
            date_from,
            date_to,
            currency = 'EUR',
            report_type = 'summary'
        } = req.query;

        const whereClause = {};

        if (date_from || date_to) {
            whereClause.order_date = {};
            if (date_from) whereClause.order_date[Op.gte] = new Date(date_from);
            if (date_to) whereClause.order_date[Op.lte] = new Date(date_to);
        }

        const orders = await Order.findAll({
            where: whereClause,
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                },
                { model: Store, as: 'store' }
            ],
            order: [['order_date', 'DESC']]
        });

        const taxConfig = await getTaxConfig();
        const taxRate = taxConfig.taxRates[currency] || DEFAULT_TAX_CONFIG.defaultTaxRate;

        let totalOrders = 0;
        let totalRevenue = 0;
        let totalTaxCollected = 0;
        const taxByMonth = {};
        const taxByStore = {};

        for (const order of orders) {
            totalOrders++;
            const orderAmount = currency === 'EUR' ?
                parseFloat(order.total_amount_eur || 0) :
                parseFloat(order.total_amount_syp || 0);

            const taxAmount = orderAmount * (taxRate / 100);

            totalRevenue += orderAmount;
            totalTaxCollected += taxAmount;

            // Group by month
            const month = order.order_date.toISOString().slice(0, 7);
            if (!taxByMonth[month]) {
                taxByMonth[month] = {
                    orders: 0,
                    revenue: 0,
                    tax: 0
                };
            }
            taxByMonth[month].orders++;
            taxByMonth[month].revenue += orderAmount;
            taxByMonth[month].tax += taxAmount;

            // Group by store
            if (!taxByStore[order.store_id]) {
                taxByStore[order.store_id] = {
                    store_name: order.store_name,
                    orders: 0,
                    revenue: 0,
                    tax: 0
                };
            }
            taxByStore[order.store_id].orders++;
            taxByStore[order.store_id].revenue += orderAmount;
            taxByStore[order.store_id].tax += taxAmount;
        }

        const taxReport = {
            summary: {
                total_orders: totalOrders,
                total_revenue: totalRevenue,
                total_tax_collected: totalTaxCollected,
                tax_rate: taxRate,
                currency: currency,
                period: {
                    from: date_from,
                    to: date_to
                }
            },
            by_month: taxByMonth,
            by_store: taxByStore,
            generated_at: new Date(),
            generated_by: req.user.id
        };

        res.json({
            success: true,
            data: taxReport,
            message: 'Tax report generated successfully'
        });

    } catch (error) {
        console.error('[TAX] Failed to generate tax report:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to generate tax report',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get tax exemptions
// @route   GET /api/tax/exemptions
// @access  Private
export const getTaxExemptions = async (req, res) => {
    try {
        const taxConfig = await getTaxConfig();

        res.json({
            success: true,
            data: taxConfig.taxExemptions,
            message: 'Tax exemptions retrieved successfully'
        });

    } catch (error) {
        console.error('[TAX] Failed to get tax exemptions:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get tax exemptions',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Apply tax exemption
// @route   POST /api/tax/exemptions/apply
// @access  Private
export const applyTaxExemption = async (req, res) => {
    try {
        const {
            exemption_type,
            customer_id,
            order_id,
            exemption_amount,
            reason,
            valid_until
        } = req.body;

        const exemption = {
            id: Date.now(),
            type: exemption_type,
            customer_id: customer_id,
            order_id: order_id,
            amount: exemption_amount,
            reason: reason,
            valid_until: valid_until,
            applied_by: req.user.id,
            applied_at: new Date(),
            status: 'active'
        };

        // In a real application, this would be saved to database
        res.json({
            success: true,
            data: exemption,
            message: 'Tax exemption applied successfully'
        });

    } catch (error) {
        console.error('[TAX] Failed to apply tax exemption:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to apply tax exemption',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Calculate multi-currency tax
// @route   POST /api/tax/calculate/multi-currency
// @access  Private
export const calculateMultiCurrencyTax = async (req, res) => {
    try {
        const { items, sourceCurrency, targetCurrency, exchangeRate } = req.body;

        if (!items || !sourceCurrency || !targetCurrency) {
            return res.status(400).json({
                success: false,
                message: 'Items, source currency, and target currency are required'
            });
        }

        const taxConfig = await getTaxConfig();
        const sourceTaxRate = taxConfig.taxRates[sourceCurrency] || 0;
        const targetTaxRate = taxConfig.taxRates[targetCurrency] || 0;

        const calculations = {
            source_currency: sourceCurrency,
            target_currency: targetCurrency,
            exchange_rate: exchangeRate || 1,
            source_calculation: null,
            target_calculation: null,
            conversion_summary: null
        };

        // Calculate in source currency
        const sourceRequest = { ...req.body, currency: sourceCurrency };
        const sourceCalc = await calculateTaxInternal(sourceRequest);
        calculations.source_calculation = sourceCalc;

        // Convert to target currency
        const convertedItems = items.map(item => ({
            ...item,
            unit_price: item.unit_price * exchangeRate
        }));

        const targetRequest = {
            ...req.body,
            currency: targetCurrency,
            items: convertedItems
        };
        const targetCalc = await calculateTaxInternal(targetRequest);
        calculations.target_calculation = targetCalc;

        calculations.conversion_summary = {
            source_total: sourceCalc.total_amount,
            target_total: targetCalc.total_amount,
            tax_difference: targetCalc.tax_amount - (sourceCalc.tax_amount * exchangeRate)
        };

        res.json({
            success: true,
            data: calculations,
            message: 'Multi-currency tax calculated successfully'
        });

    } catch (error) {
        console.error('[TAX] Failed to calculate multi-currency tax:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate multi-currency tax',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Internal function for tax calculation
const calculateTaxInternal = async (data) => {
    const { items, currency = 'EUR' } = data;
    const taxConfig = await getTaxConfig();
    const taxRate = taxConfig.taxRates[currency] || 0;

    let subtotal = 0;
    let taxAmount = 0;

    for (const item of items) {
        const itemSubtotal = item.quantity * item.unit_price;
        const itemTax = itemSubtotal * (taxRate / 100);

        subtotal += itemSubtotal;
        taxAmount += itemTax;
    }

    return {
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: subtotal + taxAmount,
        currency: currency
    };
};

// @desc    Get tax compliance status
// @route   GET /api/tax/compliance
// @access  Private
export const getTaxComplianceStatus = async (req, res) => {
    try {
        const { date_from, date_to } = req.query;

        // Mock compliance data
        const complianceStatus = {
            status: 'compliant',
            last_check: new Date(),
            issues: [],
            recommendations: [],
            compliance_score: 98.5,
            period: {
                from: date_from,
                to: date_to
            },
            tax_filings: {
                required: 12,
                completed: 12,
                overdue: 0
            }
        };

        res.json({
            success: true,
            data: complianceStatus,
            message: 'Tax compliance status retrieved successfully'
        });

    } catch (error) {
        console.error('[TAX] Failed to get compliance status:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get tax compliance status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Export tax data
// @route   GET /api/tax/export
// @access  Private
export const exportTaxData = async (req, res) => {
    try {
        const { format = 'csv', date_from, date_to } = req.query;

        const taxReport = await generateTaxReport({
            ...req,
            query: { date_from, date_to }
        });

        // In a real application, this would generate actual file
        const exportData = {
            format: format,
            filename: `tax_report_${new Date().toISOString().split('T')[0]}.${format}`,
            size: '1.2MB',
            download_url: '/api/tax/download/' + Date.now(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        };

        res.json({
            success: true,
            data: exportData,
            message: 'Tax data export prepared successfully'
        });

    } catch (error) {
        console.error('[TAX] Failed to export tax data:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to export tax data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 
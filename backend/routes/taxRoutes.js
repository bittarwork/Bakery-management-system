import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    calculateTax,
    getTaxConfig,
    updateTaxConfig,
    getTaxRatesByRegion,
    generateTaxReport,
    getTaxExemptions,
    applyTaxExemption,
    calculateMultiCurrencyTax,
    getTaxComplianceStatus,
    exportTaxData
} from '../controllers/taxController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Calculate tax for items
// @route   POST /api/tax/calculate
// @access  Private
router.post('/calculate', calculateTax);

// @desc    Get tax configuration
// @route   GET /api/tax/config
// @access  Private
router.get('/config', getTaxConfig);

// @desc    Update tax configuration
// @route   PUT /api/tax/config
// @access  Private (Admin only)
router.put('/config', authorize('admin'), updateTaxConfig);

// @desc    Get tax rates by region
// @route   GET /api/tax/rates/:region
// @access  Private
router.get('/rates/:region', getTaxRatesByRegion);

// @desc    Generate tax report
// @route   GET /api/tax/report
// @access  Private
router.get('/report', generateTaxReport);

// @desc    Get tax exemptions
// @route   GET /api/tax/exemptions
// @access  Private
router.get('/exemptions', getTaxExemptions);

// @desc    Apply tax exemption
// @route   POST /api/tax/exemptions/apply
// @access  Private (Admin/Manager only)
router.post('/exemptions/apply', authorize('admin', 'manager'), applyTaxExemption);

// @desc    Calculate multi-currency tax
// @route   POST /api/tax/calculate/multi-currency
// @access  Private
router.post('/calculate/multi-currency', calculateMultiCurrencyTax);

// @desc    Get tax compliance status
// @route   GET /api/tax/compliance
// @access  Private (Admin/Manager only)
router.get('/compliance', authorize('admin', 'manager'), getTaxComplianceStatus);

// @desc    Export tax data
// @route   GET /api/tax/export
// @access  Private (Admin/Manager only)
router.get('/export', authorize('admin', 'manager'), exportTaxData);

export default router; 
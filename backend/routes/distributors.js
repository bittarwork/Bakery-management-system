import express from 'express';
import {
    getDistributors,
    getDistributor,
    createDistributor,
    updateDistributor,
    deleteDistributor,
    updateDistributorStatus,
    getDistributorsStatistics,
    getAvailableDistributors,
    getDistributorPerformance
} from '../controllers/distributorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @route   GET /api/distributors
// @desc    Get all distributors
// @access  Private
router.get('/', getDistributors);

// @route   GET /api/distributors/statistics
// @desc    Get distributors statistics
// @access  Private
router.get('/statistics', getDistributorsStatistics);

// @route   GET /api/distributors/available
// @desc    Get available distributors
// @access  Private
router.get('/available', getAvailableDistributors);

// @route   GET /api/distributors/:id
// @desc    Get single distributor
// @access  Private
router.get('/:id', getDistributor);

// @route   POST /api/distributors
// @desc    Create new distributor
// @access  Private (Admin/Manager only)
router.post('/', createDistributor);

// @route   PUT /api/distributors/:id
// @desc    Update distributor
// @access  Private (Admin/Manager only)
router.put('/:id', updateDistributor);

// @route   DELETE /api/distributors/:id
// @desc    Delete distributor
// @access  Private (Admin only)
router.delete('/:id', deleteDistributor);

// @route   PATCH /api/distributors/:id/status
// @desc    Update distributor status
// @access  Private (Admin/Manager only)
router.patch('/:id/status', updateDistributorStatus);

// @route   GET /api/distributors/:id/performance
// @desc    Get distributor performance
// @access  Private
router.get('/:id/performance', getDistributorPerformance);

export default router; 
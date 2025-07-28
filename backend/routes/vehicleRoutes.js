import express from 'express';
import {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    assignVehicle,
    unassignVehicle,
    getAvailableVehicles,
    getVehiclesByDistributor,
    getVehicleStatistics,
    getVehicleExpenses,
    getVehicleStatisticsById,
    exportVehicleData,
    updateVehicleStatus,
    exportVehiclesCSV
} from '../controllers/vehicleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// GET routes
router.get('/', authorize('admin', 'manager'), getAllVehicles);
router.get('/statistics', authorize('admin', 'manager'), getVehicleStatistics);
router.get('/export/csv', authorize('admin', 'manager'), exportVehiclesCSV);
router.get('/available', getAvailableVehicles);
router.get('/distributor/:distributorId', getVehiclesByDistributor);
router.get('/:id', getVehicleById);
router.get('/:id/expenses', authorize('admin', 'manager'), getVehicleExpenses);
router.get('/:id/statistics', authorize('admin', 'manager'), getVehicleStatisticsById);
router.get('/:id/export', authorize('admin', 'manager'), exportVehicleData);

// POST routes
router.post('/', authorize('admin', 'manager'), createVehicle);
router.post('/:id/assign', authorize('admin', 'manager'), assignVehicle);
router.post('/:id/unassign', authorize('admin', 'manager'), unassignVehicle);

// PUT routes
router.put('/:id', authorize('admin', 'manager'), updateVehicle);

// PATCH routes
router.patch('/:id/status', authorize('admin', 'manager'), updateVehicleStatus);

// DELETE routes
router.delete('/:id', authorize('admin'), deleteVehicle);

export default router; 
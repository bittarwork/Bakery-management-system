import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import { logger } from '../config/logger.js';

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private (Admin, Manager)
export const getAllVehicles = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            vehicle_type, 
            assigned,
            search 
        } = req.query;

        const offset = (page - 1) * limit;
        const whereClause = {};

        // Apply filters
        if (status) {
            whereClause.status = status;
        }

        if (vehicle_type) {
            whereClause.vehicle_type = vehicle_type;
        }

        if (assigned === 'true') {
            whereClause.assigned_distributor_id = { [Vehicle.sequelize.Op.not]: null };
        } else if (assigned === 'false') {
            whereClause.assigned_distributor_id = null;
        }

        if (search) {
            whereClause[Vehicle.sequelize.Op.or] = [
                { vehicle_model: { [Vehicle.sequelize.Op.like]: `%${search}%` } },
                { vehicle_plate: { [Vehicle.sequelize.Op.like]: `%${search}%` } }
            ];
        }

        const { rows: vehicles, count: totalVehicles } = await Vehicle.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'assignedDistributor',
                    attributes: ['id', 'full_name', 'username', 'phone'],
                    required: false
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const totalPages = Math.ceil(totalVehicles / limit);

        res.json({
            success: true,
            data: {
                vehicles,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: totalVehicles,
                    itemsPerPage: parseInt(limit)
                }
            },
            message: 'تم جلب المركبات بنجاح'
        });

    } catch (error) {
        logger.error('Get all vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المركبات',
            error: error.message
        });
    }
};

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'assignedDistributor',
                    attributes: ['id', 'full_name', 'username', 'phone', 'email'],
                    required: false
                }
            ]
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على المركبة'
            });
        }

        res.json({
            success: true,
            data: vehicle,
            message: 'تم جلب تفاصيل المركبة بنجاح'
        });

    } catch (error) {
        logger.error('Get vehicle by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب تفاصيل المركبة',
            error: error.message
        });
    }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Admin, Manager)
export const createVehicle = async (req, res) => {
    try {
        const {
            vehicle_type,
            vehicle_model,
            vehicle_plate,
            vehicle_year,
            vehicle_color,
            fuel_type,
            engine_capacity,
            transmission_type,
            insurance_company,
            insurance_expiry_date,
            registration_expiry_date,
            purchase_date,
            purchase_price_eur,
            purchase_price_syp,
            notes,
            is_company_owned
        } = req.body;

        // Check if vehicle plate already exists
        const existingVehicle = await Vehicle.findOne({ 
            where: { vehicle_plate } 
        });

        if (existingVehicle) {
            return res.status(400).json({
                success: false,
                message: 'رقم اللوحة موجود مسبقاً'
            });
        }

        const vehicle = await Vehicle.create({
            vehicle_type,
            vehicle_model,
            vehicle_plate,
            vehicle_year,
            vehicle_color,
            fuel_type,
            engine_capacity,
            transmission_type,
            insurance_company,
            insurance_expiry_date,
            registration_expiry_date,
            purchase_date,
            purchase_price_eur,
            purchase_price_syp,
            notes,
            is_company_owned,
            created_by: req.user.id,
            created_by_name: req.user.full_name
        });

        logger.info(`Vehicle created: ${vehicle.vehicle_plate} by ${req.user.full_name}`);

        res.status(201).json({
            success: true,
            data: vehicle,
            message: 'تم إنشاء المركبة بنجاح'
        });

    } catch (error) {
        logger.error('Create vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء المركبة',
            error: error.message
        });
    }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Admin, Manager)
export const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const vehicle = await Vehicle.findByPk(id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على المركبة'
            });
        }

        // Check if vehicle plate is being changed and if it already exists
        if (updateData.vehicle_plate && updateData.vehicle_plate !== vehicle.vehicle_plate) {
            const existingVehicle = await Vehicle.findOne({ 
                where: { 
                    vehicle_plate: updateData.vehicle_plate,
                    id: { [Vehicle.sequelize.Op.ne]: id }
                } 
            });

            if (existingVehicle) {
                return res.status(400).json({
                    success: false,
                    message: 'رقم اللوحة موجود مسبقاً'
                });
            }
        }

        await vehicle.update(updateData);

        logger.info(`Vehicle updated: ${vehicle.vehicle_plate} by ${req.user.full_name}`);

        res.json({
            success: true,
            data: vehicle,
            message: 'تم تحديث المركبة بنجاح'
        });

    } catch (error) {
        logger.error('Update vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث المركبة',
            error: error.message
        });
    }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Admin only)
export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findByPk(id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على المركبة'
            });
        }

        // Check if vehicle is assigned to a distributor
        if (vehicle.assigned_distributor_id) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكن حذف مركبة معينة لموزع. قم بإلغاء التعيين أولاً'
            });
        }

        await vehicle.destroy();

        logger.info(`Vehicle deleted: ${vehicle.vehicle_plate} by ${req.user.full_name}`);

        res.json({
            success: true,
            message: 'تم حذف المركبة بنجاح'
        });

    } catch (error) {
        logger.error('Delete vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف المركبة',
            error: error.message
        });
    }
};

// @desc    Assign vehicle to distributor
// @route   POST /api/vehicles/:id/assign
// @access  Private (Admin, Manager)
export const assignVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const { distributor_id } = req.body;

        const vehicle = await Vehicle.findByPk(id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على المركبة'
            });
        }

        if (vehicle.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'لا يمكن تعيين مركبة غير نشطة'
            });
        }

        if (vehicle.assigned_distributor_id) {
            return res.status(400).json({
                success: false,
                message: 'المركبة معينة لموزع آخر بالفعل'
            });
        }

        // Check if distributor exists and is active
        const distributor = await User.findOne({
            where: {
                id: distributor_id,
                role: 'distributor',
                status: 'active'
            }
        });

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على الموزع أو أنه غير نشط'
            });
        }

        // Check if distributor already has a vehicle assigned
        const existingAssignment = await Vehicle.findOne({
            where: {
                assigned_distributor_id: distributor_id,
                status: 'active'
            }
        });

        if (existingAssignment) {
            return res.status(400).json({
                success: false,
                message: 'الموزع لديه مركبة معينة بالفعل'
            });
        }

        await vehicle.update({ assigned_distributor_id: distributor_id });

        logger.info(`Vehicle ${vehicle.vehicle_plate} assigned to ${distributor.full_name} by ${req.user.full_name}`);

        res.json({
            success: true,
            data: vehicle,
            message: 'تم تعيين المركبة للموزع بنجاح'
        });

    } catch (error) {
        logger.error('Assign vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تعيين المركبة',
            error: error.message
        });
    }
};

// @desc    Unassign vehicle from distributor
// @route   POST /api/vehicles/:id/unassign
// @access  Private (Admin, Manager)
export const unassignVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'assignedDistributor',
                    attributes: ['full_name']
                }
            ]
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على المركبة'
            });
        }

        if (!vehicle.assigned_distributor_id) {
            return res.status(400).json({
                success: false,
                message: 'المركبة غير معينة لأي موزع'
            });
        }

        const distributorName = vehicle.assignedDistributor?.full_name || 'Unknown';
        
        await vehicle.update({ assigned_distributor_id: null });

        logger.info(`Vehicle ${vehicle.vehicle_plate} unassigned from ${distributorName} by ${req.user.full_name}`);

        res.json({
            success: true,
            data: vehicle,
            message: 'تم إلغاء تعيين المركبة بنجاح'
        });

    } catch (error) {
        logger.error('Unassign vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إلغاء تعيين المركبة',
            error: error.message
        });
    }
};

// @desc    Get available vehicles
// @route   GET /api/vehicles/available
// @access  Private
export const getAvailableVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.getAvailableVehicles();

        res.json({
            success: true,
            data: vehicles,
            message: 'تم جلب المركبات المتاحة بنجاح'
        });

    } catch (error) {
        logger.error('Get available vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المركبات المتاحة',
            error: error.message
        });
    }
};

// @desc    Get vehicles by distributor
// @route   GET /api/vehicles/distributor/:distributorId
// @access  Private
export const getVehiclesByDistributor = async (req, res) => {
    try {
        const { distributorId } = req.params;

        const vehicles = await Vehicle.getVehiclesByDistributor(distributorId);

        res.json({
            success: true,
            data: vehicles,
            message: 'تم جلب مركبات الموزع بنجاح'
        });

    } catch (error) {
        logger.error('Get vehicles by distributor error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب مركبات الموزع',
            error: error.message
        });
    }
};

// @desc    Get vehicle statistics
// @route   GET /api/vehicles/statistics
// @access  Private (Admin, Manager)
export const getVehicleStatistics = async (req, res) => {
    try {
        const statistics = await Vehicle.getStatistics();

        res.json({
            success: true,
            data: statistics,
            message: 'تم جلب إحصائيات المركبات بنجاح'
        });

    } catch (error) {
        logger.error('Get vehicle statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب إحصائيات المركبات',
            error: error.message
        });
    }
};

// @desc    Update vehicle status
// @route   PATCH /api/vehicles/:id/status
// @access  Private (Admin, Manager)
export const updateVehicleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['active', 'maintenance', 'inactive', 'retired'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'حالة المركبة غير صحيحة'
            });
        }

        const vehicle = await Vehicle.findByPk(id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على المركبة'
            });
        }

        // If changing to inactive or retired, unassign from distributor
        if (['inactive', 'retired'].includes(status) && vehicle.assigned_distributor_id) {
            await vehicle.update({ 
                status,
                assigned_distributor_id: null
            });

            logger.info(`Vehicle ${vehicle.vehicle_plate} status changed to ${status} and unassigned by ${req.user.full_name}`);
        } else {
            await vehicle.update({ status });
            logger.info(`Vehicle ${vehicle.vehicle_plate} status changed to ${status} by ${req.user.full_name}`);
        }

        res.json({
            success: true,
            data: vehicle,
            message: 'تم تحديث حالة المركبة بنجاح'
        });

    } catch (error) {
        logger.error('Update vehicle status error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث حالة المركبة',
            error: error.message
        });
    }
}; 
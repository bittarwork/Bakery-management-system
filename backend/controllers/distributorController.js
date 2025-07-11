import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Distributor, User, DistributionTrip, Order, sequelize } from '../models/index.js';

// @desc    الحصول على جميع الموزعين
// @route   GET /api/distributors
// @access  Private
export const getDistributors = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            is_active,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const whereClause = {};

        // Search filter
        if (search) {
            whereClause[Op.or] = [
                { '$user.full_name$': { [Op.like]: `%${search}%` } },
                { '$user.username$': { [Op.like]: `%${search}%` } },
                { '$user.phone$': { [Op.like]: `%${search}%` } },
                { '$user.email$': { [Op.like]: `%${search}%` } }
            ];
        }

        // Status filter
        if (status) {
            whereClause.status = status;
        }

        // Active filter
        if (is_active !== undefined) {
            whereClause.is_active = is_active === 'true';
        }

        const { count, rows: distributors } = await Distributor.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'full_name', 'username', 'phone', 'email']
                }
            ],
            order: [[sort_by, sort_order]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: distributors,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(count / limit),
                total_items: count,
                items_per_page: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('[DISTRIBUTORS] Failed to fetch distributors:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الموزعين',
            error: error.message
        });
    }
};

// @desc    الحصول على موزع واحد
// @route   GET /api/distributors/:id
// @access  Private
export const getDistributor = async (req, res) => {
    try {
        const { id } = req.params;

        const distributor = await Distributor.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password'] }
                }
            ]
        });

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: 'الموزع غير موجود'
            });
        }

        res.json({
            success: true,
            data: distributor
        });
    } catch (error) {
        console.error('[DISTRIBUTORS] Failed to fetch distributor:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الموزع',
            error: error.message
        });
    }
};

// @desc    إنشاء موزع جديد
// @route   POST /api/distributors
// @access  Private (Admin/Manager only)
export const createDistributor = async (req, res) => {
    try {
        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بإنشاء موزعين جدد'
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const {
            user_id,
            vehicle_info,
            salary_eur = 0,
            salary_syp = 0,
            commission_rate = 0,
            working_hours,
            area_coverage,
            max_orders_per_day = 50,
            performance_rating = 0,
            notes,
            is_active = true,
            status = 'available'
        } = req.body;

        // Verify user exists and is a distributor
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        if (user.role !== 'distributor') {
            return res.status(400).json({
                success: false,
                message: 'المستخدم يجب أن يكون موزعاً'
            });
        }

        // Check if distributor already exists
        const existingDistributor = await Distributor.findOne({
            where: { user_id }
        });

        if (existingDistributor) {
            return res.status(409).json({
                success: false,
                message: 'الموزع موجود مسبقاً'
            });
        }

        const distributor = await Distributor.create({
            user_id,
            vehicle_info,
            salary_eur,
            salary_syp,
            commission_rate,
            working_hours,
            area_coverage,
            max_orders_per_day,
            performance_rating,
            notes,
            is_active,
            status,
            created_by: req.user.id
        });

        res.status(201).json({
            success: true,
            data: distributor,
            message: 'تم إنشاء الموزع بنجاح'
        });
    } catch (error) {
        console.error('[DISTRIBUTORS] Failed to create distributor:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الموزع',
            error: error.message
        });
    }
};

// @desc    تحديث موزع
// @route   PUT /api/distributors/:id
// @access  Private (Admin/Manager only)
export const updateDistributor = async (req, res) => {
    try {
        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بتحديث الموزعين'
            });
        }

        const { id } = req.params;
        const {
            vehicle_info,
            salary_eur,
            salary_syp,
            commission_rate,
            working_hours,
            area_coverage,
            max_orders_per_day,
            performance_rating,
            notes,
            is_active,
            status
        } = req.body;

        const distributor = await Distributor.findByPk(id);

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: 'الموزع غير موجود'
            });
        }

        const updateData = {};
        if (vehicle_info !== undefined) updateData.vehicle_info = vehicle_info;
        if (salary_eur !== undefined) updateData.salary_eur = salary_eur;
        if (salary_syp !== undefined) updateData.salary_syp = salary_syp;
        if (commission_rate !== undefined) updateData.commission_rate = commission_rate;
        if (working_hours !== undefined) updateData.working_hours = working_hours;
        if (area_coverage !== undefined) updateData.area_coverage = area_coverage;
        if (max_orders_per_day !== undefined) updateData.max_orders_per_day = max_orders_per_day;
        if (performance_rating !== undefined) updateData.performance_rating = performance_rating;
        if (notes !== undefined) updateData.notes = notes;
        if (is_active !== undefined) updateData.is_active = is_active;
        if (status !== undefined) updateData.status = status;

        await distributor.update(updateData);

        res.json({
            success: true,
            data: distributor,
            message: 'تم تحديث الموزع بنجاح'
        });
    } catch (error) {
        console.error('[DISTRIBUTORS] Failed to update distributor:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الموزع',
            error: error.message
        });
    }
};

// @desc    حذف موزع
// @route   DELETE /api/distributors/:id
// @access  Private (Admin only)
export const deleteDistributor = async (req, res) => {
    try {
        // Check permissions
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بحذف الموزعين'
            });
        }

        const { id } = req.params;

        const distributor = await Distributor.findByPk(id);

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: 'الموزع غير موجود'
            });
        }

        // Check for active trips
        const activeTrips = await DistributionTrip.count({
            where: {
                distributor_id: id,
                status: {
                    [Op.in]: ['pending', 'in_progress']
                }
            }
        });

        if (activeTrips > 0) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكن حذف الموزع لوجود رحلات نشطة'
            });
        }

        await distributor.destroy();

        res.json({
            success: true,
            message: 'تم حذف الموزع بنجاح'
        });
    } catch (error) {
        console.error('[DISTRIBUTORS] Failed to delete distributor:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الموزع',
            error: error.message
        });
    }
};

// @desc    تحديث حالة الموزع
// @route   PATCH /api/distributors/:id/status
// @access  Private (Admin/Manager only)
export const updateDistributorStatus = async (req, res) => {
    try {
        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بتحديث حالة الموزعين'
            });
        }

        const { id } = req.params;
        const { status } = req.body;

        const distributor = await Distributor.findByPk(id);

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: 'الموزع غير موجود'
            });
        }

        // Validate status
        const allowedStatuses = ['available', 'busy', 'off_duty', 'suspended'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'حالة الموزع غير صحيحة'
            });
        }

        await distributor.update({ status });

        res.json({
            success: true,
            data: { distributor_id: id, status },
            message: 'تم تحديث حالة الموزع بنجاح'
        });
    } catch (error) {
        console.error('[DISTRIBUTORS] Failed to update distributor status:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث حالة الموزع',
            error: error.message
        });
    }
};

// @desc    الحصول على إحصائيات الموزعين
// @route   GET /api/distributors/statistics
// @access  Private
export const getDistributorsStatistics = async (req, res) => {
    try {
        const stats = await Distributor.getDistributorStatistics();

        res.json({
            success: true,
            data: stats,
            message: 'تم جلب إحصائيات الموزعين بنجاح'
        });
    } catch (error) {
        console.error('[DISTRIBUTORS] Failed to fetch distributor statistics:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب إحصائيات الموزعين',
            error: error.message
        });
    }
};

// @desc    الحصول على الموزعين المتاحين
// @route   GET /api/distributors/available
// @access  Private
export const getAvailableDistributors = async (req, res) => {
    try {
        const distributors = await Distributor.findAll({
            where: {
                is_active: true,
                status: 'available'
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'full_name', 'username', 'phone']
                }
            ],
            order: [['performance_rating', 'DESC']]
        });

        res.json({
            success: true,
            data: distributors,
            message: 'تم جلب الموزعين المتاحين بنجاح'
        });
    } catch (error) {
        console.error('[DISTRIBUTORS] Failed to fetch available distributors:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الموزعين المتاحين',
            error: error.message
        });
    }
};

// @desc    الحصول على أداء الموزع
// @route   GET /api/distributors/:id/performance
// @access  Private
export const getDistributorPerformance = async (req, res) => {
    try {
        const { id } = req.params;
        const { period = 'month' } = req.query;

        const distributor = await Distributor.findByPk(id);

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: 'الموزع غير موجود'
            });
        }

        const performance = await distributor.getPerformanceMetrics(period);

        res.json({
            success: true,
            data: {
                distributor_id: id,
                period,
                performance
            },
            message: 'تم جلب أداء الموزع بنجاح'
        });
    } catch (error) {
        console.error('[DISTRIBUTORS] Failed to fetch distributor performance:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب أداء الموزع',
            error: error.message
        });
    }
}; 
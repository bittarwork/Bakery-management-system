import EnhancedStore from '../models/EnhancedStore.js';
import EnhancedUser from '../models/EnhancedUser.js';
import EnhancedPayment from '../models/EnhancedPayment.js';
import EnhancedStoreVisit from '../models/EnhancedStoreVisit.js';
import { Op } from 'sequelize';

// ===============================
// إدارة المحلات (Admin/Manager)
// ===============================

export const createStore = async (req, res) => {
    try {
        const {
            name,
            owner_name,
            phone,
            address,
            gps_coordinates,
            store_type,
            category,
            opening_hours,
            credit_limit,
            commission_rate,
            payment_terms,
            notes
        } = req.body;

        // التحقق من البيانات المطلوبة
        if (!name || !owner_name || !phone || !address) {
            return res.status(400).json({
                success: false,
                message: 'اسم المحل واسم المالك والهاتف والعنوان مطلوبة'
            });
        }

        // التحقق من عدم تكرار رقم الهاتف
        const existingStore = await EnhancedStore.findOne({
            where: { phone }
        });

        if (existingStore) {
            return res.status(400).json({
                success: false,
                message: 'رقم الهاتف مستخدم بالفعل'
            });
        }

        // إنشاء المحل
        const store = await EnhancedStore.create({
            name,
            owner_name,
            phone,
            address,
            gps_coordinates,
            store_type: store_type || 'retail',
            category: category || 'general',
            opening_hours,
            credit_limit: credit_limit || 0,
            commission_rate: commission_rate || 0,
            payment_terms: payment_terms || 'cash',
            notes,
            created_by: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء المحل بنجاح',
            data: store
        });

    } catch (error) {
        console.error('Error creating store:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء المحل',
            error: error.message
        });
    }
};

export const getStores = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            store_type,
            category,
            status,
            city,
            sort_by = 'name',
            sort_order = 'ASC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        // فلاتر البحث
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { owner_name: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { address: { [Op.like]: `%${search}%` } }
            ];
        }

        if (store_type) where.store_type = store_type;
        if (category) where.category = category;
        if (status) where.status = status;
        if (city) where.address = { [Op.like]: `%${city}%` };

        const { rows: stores, count } = await EnhancedStore.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[sort_by, sort_order.toUpperCase()]],
            include: [
                { model: EnhancedUser, as: 'creator', attributes: ['id', 'full_name'] }
            ]
        });

        // إضافة الإحصائيات لكل محل
        const storesWithStats = await Promise.all(
            stores.map(async (store) => {
                const stats = await store.getPerformanceStats();
                return {
                    ...store.toJSON(),
                    performance_stats: stats
                };
            })
        );

        res.json({
            success: true,
            data: {
                stores: storesWithStats,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_records: count,
                    per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المحلات',
            error: error.message
        });
    }
};

export const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;

        const store = await EnhancedStore.findByPk(id, {
            include: [
                { model: EnhancedUser, as: 'creator', attributes: ['id', 'full_name'] }
            ]
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        // جلب الإحصائيات المفصلة
        const stats = await store.getPerformanceStats();
        const recentVisits = await EnhancedStoreVisit.findAll({
            where: { store_id: id },
            limit: 10,
            order: [['arrival_time', 'DESC']]
        });

        const recentPayments = await EnhancedPayment.findAll({
            where: { store_id: id },
            limit: 10,
            order: [['payment_date', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                store: store.toJSON(),
                performance_stats: stats,
                recent_visits: recentVisits,
                recent_payments: recentPayments
            }
        });

    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب بيانات المحل',
            error: error.message
        });
    }
};

export const updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const store = await EnhancedStore.findByPk(id);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        // التحقق من عدم تكرار رقم الهاتف
        if (updateData.phone && updateData.phone !== store.phone) {
            const existingStore = await EnhancedStore.findOne({
                where: {
                    phone: updateData.phone,
                    id: { [Op.ne]: id }
                }
            });

            if (existingStore) {
                return res.status(400).json({
                    success: false,
                    message: 'رقم الهاتف مستخدم بالفعل'
                });
            }
        }

        // Convert credit_limit to number if provided
        if (updateData.credit_limit !== undefined) {
            updateData.credit_limit = updateData.credit_limit ? parseFloat(updateData.credit_limit) : 0;
        }

        // Handle credit_limit_eur if provided (for compatibility with old system)
        if (updateData.credit_limit_eur !== undefined) {
            updateData.credit_limit = updateData.credit_limit_eur ? parseFloat(updateData.credit_limit_eur) : 0;
            delete updateData.credit_limit_eur; // Remove to avoid confusion
        }

        await store.update({
            ...updateData,
            last_updated_by: req.user.id
        });

        res.json({
            success: true,
            message: 'تم تحديث المحل بنجاح',
            data: store
        });

    } catch (error) {
        console.error('Error updating store:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث المحل',
            error: error.message
        });
    }
};

export const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;

        const store = await EnhancedStore.findByPk(id);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        // التحقق من وجود بيانات مرتبطة
        const hasPayments = await EnhancedPayment.count({ where: { store_id: id } });
        const hasVisits = await EnhancedStoreVisit.count({ where: { store_id: id } });

        if (hasPayments > 0 || hasVisits > 0) {
            // تعطيل المحل بدلاً من حذفه
            await store.update({ status: 'inactive' });
            return res.json({
                success: true,
                message: 'تم تعطيل المحل بدلاً من حذفه لوجود بيانات مرتبطة'
            });
        }

        await store.destroy();

        res.json({
            success: true,
            message: 'تم حذف المحل بنجاح'
        });

    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف المحل',
            error: error.message
        });
    }
};

// ===============================
// إدارة الائتمان
// ===============================

export const updateCreditLimit = async (req, res) => {
    try {
        const { id } = req.params;
        const { credit_limit, reason } = req.body;

        if (credit_limit < 0) {
            return res.status(400).json({
                success: false,
                message: 'حد الائتمان لا يمكن أن يكون سالباً'
            });
        }

        const store = await EnhancedStore.findByPk(id);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        const oldLimit = store.credit_limit;
        // Update the credit_limit field directly
        await store.update({ credit_limit: parseFloat(credit_limit) });

        // تسجيل التغيير
        const changeLog = {
            old_limit: oldLimit,
            new_limit: credit_limit,
            changed_by: req.user.id,
            reason: reason || 'تحديث حد الائتمان',
            change_date: new Date()
        };

        res.json({
            success: true,
            message: 'تم تحديث حد الائتمان بنجاح',
            data: {
                store: store,
                change_log: changeLog
            }
        });

    } catch (error) {
        console.error('Error updating credit limit:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث حد الائتمان',
            error: error.message
        });
    }
};

export const getCreditStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const store = await EnhancedStore.findByPk(id);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        // Return credit status directly
        const creditStatus = {
            credit_limit: parseFloat(store.credit_limit),
            current_balance: parseFloat(store.current_balance),
            credit_used: parseFloat(store.current_balance),
            credit_available: parseFloat(store.credit_limit) - parseFloat(store.current_balance),
            credit_utilization_percentage: store.credit_limit > 0 ?
                (parseFloat(store.current_balance) / parseFloat(store.credit_limit)) * 100 : 0,
            is_within_limit: parseFloat(store.current_balance) <= parseFloat(store.credit_limit),
            last_payment_date: store.last_payment_date,
            last_order_date: store.last_order_date
        };

        res.json({
            success: true,
            data: creditStatus
        });

    } catch (error) {
        console.error('Error fetching credit status:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب حالة الائتمان',
            error: error.message
        });
    }
};

// ===============================
// إحصائيات المحلات
// ===============================

export const getStoreStatistics = async (req, res) => {
    try {
        const { start_date, end_date, store_type, category } = req.query;

        const stats = await EnhancedStore.getOverallStatistics(start_date, end_date);

        // إحصائيات حسب النوع والفئة
        const typeStats = await EnhancedStore.getStatsByType(store_type);
        const categoryStats = await EnhancedStore.getStatsByCategory(category);

        // أفضل المحلات أداءً
        const topPerformers = await EnhancedStore.getTopPerformers(10);

        // المحلات التي تحتاج متابعة
        const needsAttention = await EnhancedStore.getStoresNeedingAttention();

        res.json({
            success: true,
            data: {
                overall_statistics: stats,
                type_statistics: typeStats,
                category_statistics: categoryStats,
                top_performers: topPerformers,
                needs_attention: needsAttention
            }
        });

    } catch (error) {
        console.error('Error fetching store statistics:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب إحصائيات المحلات',
            error: error.message
        });
    }
};

export const getStorePerformance = async (req, res) => {
    try {
        const { id } = req.params;
        const { start_date, end_date } = req.query;

        const store = await EnhancedStore.findByPk(id);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        const performance = await store.getDetailedPerformance(start_date, end_date);

        res.json({
            success: true,
            data: performance
        });

    } catch (error) {
        console.error('Error fetching store performance:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب أداء المحل',
            error: error.message
        });
    }
};

// ===============================
// واجهة صاحب المحل
// ===============================

export const getStoreOwnerDashboard = async (req, res) => {
    try {
        const { store_id } = req.params;

        // التحقق من صلاحية المستخدم
        if (req.user.role !== 'store_owner' && req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بالوصول لهذه البيانات'
            });
        }

        const store = await EnhancedStore.findByPk(store_id);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        // إحصائيات المحل
        const stats = await store.getPerformanceStats();
        const creditStatus = await store.getCreditStatus();

        // الزيارات الأخيرة
        const recentVisits = await EnhancedStoreVisit.findAll({
            where: { store_id },
            limit: 10,
            order: [['arrival_time', 'DESC']]
        });

        // المدفوعات الأخيرة
        const recentPayments = await EnhancedPayment.findAll({
            where: { store_id },
            limit: 10,
            order: [['payment_date', 'DESC']]
        });

        // الزيارة القادمة
        const nextVisit = await EnhancedStoreVisit.findOne({
            where: {
                store_id,
                status: 'planned',
                planned_arrival_time: { [Op.gte]: new Date() }
            },
            order: [['planned_arrival_time', 'ASC']]
        });

        res.json({
            success: true,
            data: {
                store: store.toJSON(),
                statistics: stats,
                credit_status: creditStatus,
                recent_visits: recentVisits,
                recent_payments: recentPayments,
                next_visit: nextVisit
            }
        });

    } catch (error) {
        console.error('Error fetching store owner dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب لوحة تحكم صاحب المحل',
            error: error.message
        });
    }
};

export const getStoreOwnerReports = async (req, res) => {
    try {
        const { store_id } = req.params;
        const { start_date, end_date, report_type = 'summary' } = req.query;

        // التحقق من صلاحية المستخدم
        if (req.user.role !== 'store_owner' && req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بالوصول لهذه التقارير'
            });
        }

        const store = await EnhancedStore.findByPk(store_id);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        let reportData = {};

        switch (report_type) {
            case 'payments':
                reportData = await store.getPaymentReport(start_date, end_date);
                break;
            case 'visits':
                reportData = await store.getVisitReport(start_date, end_date);
                break;
            case 'performance':
                reportData = await store.getDetailedPerformance(start_date, end_date);
                break;
            default:
                reportData = await store.getSummaryReport(start_date, end_date);
        }

        res.json({
            success: true,
            data: {
                report_type,
                period: { start_date, end_date },
                store: store.toJSON(),
                report_data: reportData
            }
        });

    } catch (error) {
        console.error('Error fetching store owner reports:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب تقارير صاحب المحل',
            error: error.message
        });
    }
};

// ===============================
// البحث المتقدم والخرائط
// ===============================

export const searchStoresNearby = async (req, res) => {
    try {
        const { latitude, longitude, radius = 5 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'الإحداثيات مطلوبة'
            });
        }

        const nearbyStores = await EnhancedStore.findNearby(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(radius)
        );

        res.json({
            success: true,
            data: {
                search_center: { latitude, longitude },
                radius_km: radius,
                stores: nearbyStores
            }
        });

    } catch (error) {
        console.error('Error searching nearby stores:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في البحث عن المحلات القريبة',
            error: error.message
        });
    }
};

export const getStoreRoute = async (req, res) => {
    try {
        const { store_ids } = req.body;

        if (!store_ids || !Array.isArray(store_ids) || store_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'معرفات المحلات مطلوبة'
            });
        }

        const stores = await EnhancedStore.findAll({
            where: { id: { [Op.in]: store_ids } },
            attributes: ['id', 'name', 'address', 'gps_coordinates']
        });

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على محلات'
            });
        }

        // حساب المسار الأمثل
        const optimizedRoute = await EnhancedStore.calculateOptimalRoute(stores);

        res.json({
            success: true,
            data: {
                total_stores: stores.length,
                optimized_route: optimizedRoute
            }
        });

    } catch (error) {
        console.error('Error calculating store route:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حساب مسار المحلات',
            error: error.message
        });
    }
}; 
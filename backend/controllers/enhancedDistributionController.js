import EnhancedDistributionTrip from '../models/EnhancedDistributionTrip.js';
import EnhancedStoreVisit from '../models/EnhancedStoreVisit.js';
import EnhancedStore from '../models/EnhancedStore.js';
import EnhancedUser from '../models/EnhancedUser.js';
import { Op } from 'sequelize';

// ===============================
// إدارة الرحلات
// ===============================

export const createTrip = async (req, res) => {
    try {
        const {
            trip_date,
            distributor_id,
            vehicle_id,
            route_id,
            planned_start_time,
            planned_end_time,
            stores,
            notes
        } = req.body;

        // التحقق من صحة البيانات
        if (!trip_date || !distributor_id || !vehicle_id) {
            return res.status(400).json({
                success: false,
                message: 'تاريخ الرحلة ومعرف الموزع والسيارة مطلوبة'
            });
        }

        // التحقق من عدم وجود رحلة أخرى للموزع في نفس التاريخ
        const existingTrip = await EnhancedDistributionTrip.findOne({
            where: {
                trip_date,
                distributor_id,
                status: { [Op.not]: 'cancelled' }
            }
        });

        if (existingTrip) {
            return res.status(400).json({
                success: false,
                message: 'الموزع لديه رحلة أخرى في نفس التاريخ'
            });
        }

        // إنشاء الرحلة
        const trip = await EnhancedDistributionTrip.create({
            trip_date,
            distributor_id,
            vehicle_id,
            route_id,
            planned_start_time,
            planned_end_time,
            total_stores: stores ? stores.length : 0,
            notes,
            created_by: req.user.id
        });

        // إنشاء زيارات المحلات
        if (stores && stores.length > 0) {
            const visits = stores.map((store, index) => ({
                trip_id: trip.id,
                store_id: store.store_id,
                visit_order: index + 1,
                planned_arrival_time: store.planned_arrival_time,
                amount_due: store.amount_due || 0
            }));

            await EnhancedStoreVisit.bulkCreate(visits);
        }

        // جلب الرحلة مع البيانات المرتبطة
        const createdTrip = await EnhancedDistributionTrip.findByPk(trip.id, {
            include: [
                { model: EnhancedUser, as: 'distributor' },
                { model: EnhancedStoreVisit, as: 'visits', include: [{ model: EnhancedStore, as: 'store' }] }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الرحلة بنجاح',
            data: createdTrip
        });

    } catch (error) {
        console.error('Error creating trip:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الرحلة',
            error: error.message
        });
    }
};

export const getTrips = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            distributor_id,
            start_date,
            end_date,
            status,
            search
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        // فلاتر البحث
        if (distributor_id) where.distributor_id = distributor_id;
        if (status) where.status = status;
        if (start_date) where.trip_date = { [Op.gte]: start_date };
        if (end_date) where.trip_date = { ...where.trip_date, [Op.lte]: end_date };

        if (search) {
            where[Op.or] = [
                { trip_number: { [Op.like]: `%${search}%` } },
                { notes: { [Op.like]: `%${search}%` } }
            ];
        }

        const { rows: trips, count } = await EnhancedDistributionTrip.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['trip_date', 'DESC'], ['planned_start_time', 'ASC']],
            include: [
                { model: EnhancedUser, as: 'distributor', attributes: ['id', 'full_name', 'phone'] },
                { model: EnhancedStoreVisit, as: 'visits', include: [{ model: EnhancedStore, as: 'store' }] }
            ]
        });

        res.json({
            success: true,
            data: {
                trips,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_records: count,
                    per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الرحلات',
            error: error.message
        });
    }
};

export const getTripById = async (req, res) => {
    try {
        const { id } = req.params;

        const trip = await EnhancedDistributionTrip.findByPk(id, {
            include: [
                { model: EnhancedUser, as: 'distributor' },
                {
                    model: EnhancedStoreVisit,
                    as: 'visits',
                    include: [{ model: EnhancedStore, as: 'store' }],
                    order: [['visit_order', 'ASC']]
                }
            ]
        });

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'الرحلة غير موجودة'
            });
        }

        res.json({
            success: true,
            data: trip
        });

    } catch (error) {
        console.error('Error fetching trip:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب بيانات الرحلة',
            error: error.message
        });
    }
};

export const startTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { gps_coordinates } = req.body;

        const trip = await EnhancedDistributionTrip.findByPk(id);
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'الرحلة غير موجودة'
            });
        }

        // التحقق من صلاحية المستخدم
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && trip.distributor_id !== req.user.distributor?.id) {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك ببدء هذه الرحلة'
            });
        }

        await trip.startTrip();

        // إضافة نقطة GPS الأولى
        if (gps_coordinates) {
            await trip.addGPSPoint(gps_coordinates.latitude, gps_coordinates.longitude);
        }

        res.json({
            success: true,
            message: 'تم بدء الرحلة بنجاح',
            data: trip
        });

    } catch (error) {
        console.error('Error starting trip:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في بدء الرحلة',
            error: error.message
        });
    }
};

export const completeTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { final_notes, total_expenses } = req.body;

        const trip = await EnhancedDistributionTrip.findByPk(id);
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'الرحلة غير موجودة'
            });
        }

        // التحقق من صلاحية المستخدم
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && trip.distributor_id !== req.user.distributor?.id) {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بإنهاء هذه الرحلة'
            });
        }

        // تحديث الإحصائيات قبل الإنهاء
        await trip.updateStatistics();

        await trip.completeTrip();

        // تحديث الملاحظات والمصاريف
        const updateData = {};
        if (final_notes) updateData.notes = final_notes;
        if (total_expenses) updateData.other_expenses = total_expenses;

        if (Object.keys(updateData).length > 0) {
            await trip.update(updateData);
        }

        res.json({
            success: true,
            message: 'تم إنهاء الرحلة بنجاح',
            data: trip
        });

    } catch (error) {
        console.error('Error completing trip:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في إنهاء الرحلة',
            error: error.message
        });
    }
};

export const updateTripGPS = async (req, res) => {
    try {
        const { id } = req.params;
        const { latitude, longitude, speed, accuracy } = req.body;

        const trip = await EnhancedDistributionTrip.findByPk(id);
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'الرحلة غير موجودة'
            });
        }

        // التحقق من أن الرحلة قيد التنفيذ
        if (trip.status !== 'in_progress') {
            return res.status(400).json({
                success: false,
                message: 'يمكن تحديث GPS فقط للرحلات قيد التنفيذ'
            });
        }

        await trip.addGPSPoint(latitude, longitude);

        res.json({
            success: true,
            message: 'تم تحديث موقع GPS بنجاح'
        });

    } catch (error) {
        console.error('Error updating GPS:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث موقع GPS',
            error: error.message
        });
    }
};

// ===============================
// إدارة زيارات المحلات
// ===============================

export const startVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const { gps_coordinates } = req.body;

        const visit = await EnhancedStoreVisit.findByPk(id, {
            include: [{ model: EnhancedDistributionTrip, as: 'trip' }]
        });

        if (!visit) {
            return res.status(404).json({
                success: false,
                message: 'الزيارة غير موجودة'
            });
        }

        // التحقق من صلاحية المستخدم
        if (req.user.role !== 'admin' && req.user.role !== 'manager' &&
            visit.trip.distributor_id !== req.user.distributor?.id) {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك ببدء هذه الزيارة'
            });
        }

        await visit.startVisit(gps_coordinates);

        res.json({
            success: true,
            message: 'تم بدء زيارة المحل بنجاح',
            data: visit
        });

    } catch (error) {
        console.error('Error starting visit:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في بدء زيارة المحل',
            error: error.message
        });
    }
};

export const completeVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            amount_collected,
            payment_method = 'cash',
            customer_satisfaction,
            signature_image,
            photos,
            notes
        } = req.body;

        const visit = await EnhancedStoreVisit.findByPk(id, {
            include: [{ model: EnhancedDistributionTrip, as: 'trip' }]
        });

        if (!visit) {
            return res.status(404).json({
                success: false,
                message: 'الزيارة غير موجودة'
            });
        }

        // التحقق من صلاحية المستخدم
        if (req.user.role !== 'admin' && req.user.role !== 'manager' &&
            visit.trip.distributor_id !== req.user.distributor?.id) {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بإنهاء هذه الزيارة'
            });
        }

        await visit.completeVisit(amount_collected, payment_method, customer_satisfaction, signature_image);

        // إضافة الصور إذا وجدت
        if (photos && photos.length > 0) {
            for (const photo of photos) {
                await visit.addPhoto(photo.url, photo.description);
            }
        }

        // إضافة الملاحظات
        if (notes) {
            await visit.update({ notes });
        }

        res.json({
            success: true,
            message: 'تم إنهاء زيارة المحل بنجاح',
            data: visit
        });

    } catch (error) {
        console.error('Error completing visit:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في إنهاء زيارة المحل',
            error: error.message
        });
    }
};

export const reportVisitProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const { problem_type, description, photos } = req.body;

        if (!problem_type || !description) {
            return res.status(400).json({
                success: false,
                message: 'نوع المشكلة والوصف مطلوبان'
            });
        }

        const visit = await EnhancedStoreVisit.findByPk(id, {
            include: [{ model: EnhancedDistributionTrip, as: 'trip' }]
        });

        if (!visit) {
            return res.status(404).json({
                success: false,
                message: 'الزيارة غير موجودة'
            });
        }

        // التحقق من صلاحية المستخدم
        if (req.user.role !== 'admin' && req.user.role !== 'manager' &&
            visit.trip.distributor_id !== req.user.distributor?.id) {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بالإبلاغ عن مشكلة في هذه الزيارة'
            });
        }

        await visit.reportProblem(problem_type, description, photos || []);

        res.json({
            success: true,
            message: 'تم الإبلاغ عن المشكلة بنجاح',
            data: visit
        });

    } catch (error) {
        console.error('Error reporting visit problem:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الإبلاغ عن المشكلة',
            error: error.message
        });
    }
};

// ===============================
// الإحصائيات والتقارير
// ===============================

export const getDistributionStatistics = async (req, res) => {
    try {
        const { start_date, end_date, distributor_id } = req.query;

        // إحصائيات الرحلات
        const tripStats = await EnhancedDistributionTrip.getStatistics(start_date, end_date);

        // إحصائيات الزيارات
        const visitStats = await EnhancedStoreVisit.getVisitStatistics(start_date, end_date);

        // أداء الموزعين
        let distributorPerformance = null;
        if (distributor_id) {
            distributorPerformance = await EnhancedDistributionTrip.getDistributorPerformance(
                distributor_id, start_date, end_date
            );
        }

        // الرحلات النشطة
        const activeTrips = await EnhancedDistributionTrip.findActiveTrips();

        // الزيارات المتأخرة
        const delayedVisits = await EnhancedStoreVisit.findDelayedVisits(30);

        res.json({
            success: true,
            data: {
                trip_statistics: tripStats,
                visit_statistics: visitStats,
                distributor_performance: distributorPerformance,
                active_trips: activeTrips.length,
                delayed_visits: delayedVisits.length,
                real_time: {
                    active_trips,
                    delayed_visits: delayedVisits.slice(0, 10) // أول 10 زيارات متأخرة
                }
            }
        });

    } catch (error) {
        console.error('Error fetching distribution statistics:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب إحصائيات التوزيع',
            error: error.message
        });
    }
};

export const getDistributorDashboard = async (req, res) => {
    try {
        const distributorId = req.user.distributor?.id;
        if (!distributorId) {
            return res.status(403).json({
                success: false,
                message: 'المستخدم ليس موزعاً'
            });
        }

        const today = new Date().toISOString().slice(0, 10);

        // رحلة اليوم
        const todayTrip = await EnhancedDistributionTrip.findOne({
            where: {
                distributor_id: distributorId,
                trip_date: today
            },
            include: [
                {
                    model: EnhancedStoreVisit,
                    as: 'visits',
                    include: [{ model: EnhancedStore, as: 'store' }],
                    order: [['visit_order', 'ASC']]
                }
            ]
        });

        // إحصائيات الشهر الحالي
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthStats = await EnhancedDistributionTrip.getDistributorPerformance(
            distributorId, monthStart.toISOString().slice(0, 10), today
        );

        // آخر 5 رحلات
        const recentTrips = await EnhancedDistributionTrip.findByDistributor(distributorId, null, null);
        const lastTrips = recentTrips.slice(0, 5);

        res.json({
            success: true,
            data: {
                today_trip: todayTrip,
                month_statistics: monthStats,
                recent_trips: lastTrips,
                distributor_info: req.user
            }
        });

    } catch (error) {
        console.error('Error fetching distributor dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب لوحة تحكم الموزع',
            error: error.message
        });
    }
};

export const getProblematicVisits = async (req, res) => {
    try {
        const { start_date, end_date, page = 1, limit = 20 } = req.query;

        const problematicVisits = await EnhancedStoreVisit.findProblematicVisits(start_date, end_date);

        // تصفية النتائج للصفحات
        const offset = (page - 1) * limit;
        const paginatedVisits = problematicVisits.slice(offset, offset + parseInt(limit));

        res.json({
            success: true,
            data: {
                visits: paginatedVisits,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(problematicVisits.length / limit),
                    total_records: problematicVisits.length,
                    per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching problematic visits:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الزيارات التي بها مشاكل',
            error: error.message
        });
    }
}; 
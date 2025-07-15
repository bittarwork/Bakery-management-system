import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { Store, Order, OrderItem, getSequelizeConnection } from '../models/index.js';

// @desc    الحصول على جميع المحلات مع التصفية والبحث
// @route   GET /api/stores
// @access  Private
export const getStores = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Build where clause from query parameters
        const whereClause = {};
        const filters = {};

        // Text search
        if (req.query.search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${req.query.search}%` } },
                { owner_name: { [Op.iLike]: `%${req.query.search}%` } },
                { address: { [Op.iLike]: `%${req.query.search}%` } },
                { phone: { [Op.iLike]: `%${req.query.search}%` } }
            ];
            filters.search = req.query.search;
        }

        // Status filter
        if (req.query.status) {
            whereClause.status = req.query.status;
            filters.status = req.query.status;
        }

        // Category filter
        if (req.query.category) {
            whereClause.category = req.query.category;
            filters.category = req.query.category;
        }

        // Store type filter
        if (req.query.store_type) {
            whereClause.store_type = req.query.store_type;
            filters.store_type = req.query.store_type;
        }

        // Size category filter
        if (req.query.size_category) {
            whereClause.size_category = req.query.size_category;
            filters.size_category = req.query.size_category;
        }

        // Payment terms filter
        if (req.query.payment_terms) {
            whereClause.payment_terms = req.query.payment_terms;
            filters.payment_terms = req.query.payment_terms;
        }

        // Assigned distributor filter
        if (req.query.assigned_distributor_id) {
            const distributorId = parseInt(req.query.assigned_distributor_id);
            if (!isNaN(distributorId) && distributorId > 0) {
                whereClause.assigned_distributor_id = distributorId;
                filters.assigned_distributor_id = distributorId;
            }
        }

        // Location-based filtering (within radius)
        if (req.query.lat && req.query.lng && req.query.radius) {
            const lat = parseFloat(req.query.lat);
            const lng = parseFloat(req.query.lng);
            const radius = parseFloat(req.query.radius); // in kilometers

            // Filter stores with GPS coordinates
            whereClause.gps_coordinates = {
                [Op.ne]: null
            };

            filters.lat = lat;
            filters.lng = lng;
            filters.radius = radius;
        }

        const { count, rows } = await Store.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['name', 'ASC']],
            attributes: {
                include: [
                    // Add calculated distance if location provided
                    ...(req.query.lat && req.query.lng ? [
                        [
                            sequelize.literal(`
                                CASE 
                                    WHEN gps_coordinates IS NOT NULL 
                                    AND JSON_EXTRACT(gps_coordinates, '$.latitude') IS NOT NULL 
                                    AND JSON_EXTRACT(gps_coordinates, '$.longitude') IS NOT NULL THEN
                                        6371 * acos(
                                            cos(radians(${parseFloat(req.query.lat)})) * 
                                            cos(radians(CAST(JSON_EXTRACT(gps_coordinates, '$.latitude') AS DECIMAL(10,8)))) * 
                                            cos(radians(CAST(JSON_EXTRACT(gps_coordinates, '$.longitude') AS DECIMAL(11,8))) - radians(${parseFloat(req.query.lng)})) + 
                                            sin(radians(${parseFloat(req.query.lat)})) * 
                                            sin(radians(CAST(JSON_EXTRACT(gps_coordinates, '$.latitude') AS DECIMAL(10,8))))
                                        )
                                    ELSE NULL
                                END
                            `),
                            'distance'
                        ]
                    ] : [])
                ]
            }
        });

        // Filter by actual distance if radius specified
        let filteredRows = rows;
        if (req.query.lat && req.query.lng && req.query.radius) {
            const radius = parseFloat(req.query.radius);
            filteredRows = rows.filter(store => {
                const distance = store.dataValues.distance;
                return distance !== null && distance <= radius;
            });
        }

        const pagination = {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
            hasNext: page < Math.ceil(count / limit),
            hasPrev: page > 1
        };

        res.json({
            success: true,
            data: {
                stores: filteredRows,
                pagination,
                filters
            }
        });

    } catch (error) {
        console.error('[STORES] Failed to fetch stores:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المحلات',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    الحصول على محل واحد
// @route   GET /api/stores/:id
// @access  Private
export const getStore = async (req, res) => {
    try {
        const storeId = parseInt(req.params.id);

        if (isNaN(storeId) || storeId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'معرف المحل غير صحيح'
            });
        }

        const store = await Store.findByPk(storeId, {
            attributes: {
                include: [
                    // Add calculated distance if location provided
                    ...(req.query.lat && req.query.lng ? [
                        [
                            sequelize.literal(`
                                CASE 
                                    WHEN gps_coordinates IS NOT NULL 
                                    AND JSON_EXTRACT(gps_coordinates, '$.latitude') IS NOT NULL 
                                    AND JSON_EXTRACT(gps_coordinates, '$.longitude') IS NOT NULL THEN
                                        6371 * acos(
                                            cos(radians(${parseFloat(req.query.lat)})) * 
                                            cos(radians(CAST(JSON_EXTRACT(gps_coordinates, '$.latitude') AS DECIMAL(10,8)))) * 
                                            cos(radians(CAST(JSON_EXTRACT(gps_coordinates, '$.longitude') AS DECIMAL(11,8))) - radians(${parseFloat(req.query.lng)})) + 
                                            sin(radians(${parseFloat(req.query.lat)})) * 
                                            sin(radians(CAST(JSON_EXTRACT(gps_coordinates, '$.latitude') AS DECIMAL(10,8))))
                                        )
                                    ELSE NULL
                                END
                            `),
                            'distance'
                        ]
                    ] : [])
                ]
            }
        });

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        res.json({
            success: true,
            data: store
        });

    } catch (error) {
        console.error('[STORES] Failed to fetch store:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المحل',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    إنشاء محل جديد
// @route   POST /api/stores
// @access  Private (Admin/Manager only)
export const createStore = async (req, res) => {
    try {
        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بإنشاء محلات جديدة'
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
            name,
            owner_name,
            phone,
            email,
            address,
            category = 'grocery',
            store_type = 'retail',
            size_category = 'small',
            gps_coordinates,
            payment_terms = 'cash',
            credit_limit_eur = 0,
            credit_limit_syp = 0,
            assigned_distributor_id,
            opening_hours,
            contact_person,
            tax_number,
            business_license,
            notes,
            status = 'active'
        } = req.body;

        // Validate GPS coordinates if provided
        if (gps_coordinates) {
            const { latitude, longitude } = gps_coordinates;

            if (latitude && longitude) {
                const lat = parseFloat(latitude);
                const lng = parseFloat(longitude);

                if (lat < -90 || lat > 90) {
                    return res.status(400).json({
                        success: false,
                        message: 'خط العرض يجب أن يكون بين -90 و 90'
                    });
                }

                if (lng < -180 || lng > 180) {
                    return res.status(400).json({
                        success: false,
                        message: 'خط الطول يجب أن يكون بين -180 و 180'
                    });
                }
            }
        }

        // Check for duplicate store name
        const existingStore = await Store.findOne({
            where: { name }
        });

        if (existingStore) {
            return res.status(409).json({
                success: false,
                message: 'يوجد محل بهذا الاسم مسبقاً'
            });
        }

        const store = await Store.create({
            name,
            owner_name,
            phone,
            email,
            address,
            category,
            store_type,
            size_category,
            gps_coordinates,
            payment_terms,
            credit_limit_eur,
            credit_limit_syp,
            assigned_distributor_id,
            opening_hours,
            contact_person,
            tax_number,
            business_license,
            notes,
            status,
            created_by: req.userId
        });

        res.status(201).json({
            success: true,
            data: store,
            message: 'تم إنشاء المحل بنجاح'
        });

    } catch (error) {
        console.error('[STORES] Failed to create store:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء المحل',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    تحديث محل
// @route   PUT /api/stores/:id
// @access  Private (Admin/Manager only)
export const updateStore = async (req, res) => {
    try {
        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بتحديث المحلات'
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

        const storeId = parseInt(req.params.id);
        const {
            name,
            owner_name,
            phone,
            email,
            address,
            category,
            store_type,
            size_category,
            gps_coordinates,
            payment_terms,
            credit_limit_eur,
            credit_limit_syp,
            assigned_distributor_id,
            opening_hours,
            contact_person,
            tax_number,
            business_license,
            notes,
            status
        } = req.body;

        const store = await Store.findByPk(storeId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        // Check for duplicate store name (excluding current store)
        if (name && name !== store.name) {
            const existingStore = await Store.findOne({
                where: {
                    name,
                    id: { [Op.ne]: storeId }
                }
            });

            if (existingStore) {
                return res.status(409).json({
                    success: false,
                    message: 'يوجد محل بهذا الاسم مسبقاً'
                });
            }
        }

        // Validate GPS coordinates if provided
        if (gps_coordinates) {
            const { latitude, longitude } = gps_coordinates;

            if (latitude && longitude) {
                const lat = parseFloat(latitude);
                const lng = parseFloat(longitude);

                if (lat < -90 || lat > 90) {
                    return res.status(400).json({
                        success: false,
                        message: 'خط العرض يجب أن يكون بين -90 و 90'
                    });
                }

                if (lng < -180 || lng > 180) {
                    return res.status(400).json({
                        success: false,
                        message: 'خط الطول يجب أن يكون بين -180 و 180'
                    });
                }
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (owner_name !== undefined) updateData.owner_name = owner_name;
        if (phone !== undefined) updateData.phone = phone;
        if (email !== undefined) updateData.email = email;
        if (address !== undefined) updateData.address = address;
        if (category !== undefined) updateData.category = category;
        if (store_type !== undefined) updateData.store_type = store_type;
        if (size_category !== undefined) updateData.size_category = size_category;
        if (gps_coordinates !== undefined) updateData.gps_coordinates = gps_coordinates;
        if (payment_terms !== undefined) updateData.payment_terms = payment_terms;
        if (credit_limit_eur !== undefined) updateData.credit_limit_eur = credit_limit_eur;
        if (credit_limit_syp !== undefined) updateData.credit_limit_syp = credit_limit_syp;
        if (assigned_distributor_id !== undefined) updateData.assigned_distributor_id = assigned_distributor_id;
        if (opening_hours !== undefined) updateData.opening_hours = opening_hours;
        if (contact_person !== undefined) updateData.contact_person = contact_person;
        if (tax_number !== undefined) updateData.tax_number = tax_number;
        if (business_license !== undefined) updateData.business_license = business_license;
        if (notes !== undefined) updateData.notes = notes;
        if (status !== undefined) updateData.status = status;

        await store.update(updateData);

        res.json({
            success: true,
            data: store,
            message: 'تم تحديث المحل بنجاح'
        });

    } catch (error) {
        console.error('[STORES] Failed to update store:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث المحل',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    حذف محل
// @route   DELETE /api/stores/:id
// @access  Private (Admin only)
export const deleteStore = async (req, res) => {
    try {
        // Check permissions
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بحذف المحلات'
            });
        }

        const storeId = parseInt(req.params.id);
        const store = await Store.findByPk(storeId);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        // Check for active orders before deletion
        const activeOrders = await Order.count({
            where: {
                store_id: storeId,
                status: {
                    [Op.in]: ['pending', 'processing', 'shipped']
                }
            }
        });

        if (activeOrders > 0) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكن حذف المحل لوجود طلبات نشطة مرتبطة به'
            });
        }

        await store.destroy();

        res.json({
            success: true,
            message: 'تم حذف المحل بنجاح'
        });

    } catch (error) {
        console.error('[STORES] Failed to delete store:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف المحل',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    الحصول على المحلات القريبة
// @route   GET /api/stores/nearby
// @access  Private
export const getNearbyStores = async (req, res) => {
    try {
        const { lat, lng, radius = 10, limit = 20 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'يجب تحديد خط العرض وخط الطول'
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusKm = parseFloat(radius);
        const limitNum = parseInt(limit);

        // Validate coordinates
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: 'إحداثيات غير صحيحة'
            });
        }

        const stores = await Store.findAll({
            where: {
                gps_coordinates: {
                    [Op.ne]: null
                },
                status: 'active'
            },
            attributes: {
                include: [
                    [
                        sequelize.literal(`
                            6371 * acos(
                                cos(radians(${latitude})) * 
                                cos(radians(CAST(JSON_EXTRACT(gps_coordinates, '$.latitude') AS DECIMAL(10,8)))) * 
                                cos(radians(CAST(JSON_EXTRACT(gps_coordinates, '$.longitude') AS DECIMAL(11,8))) - radians(${longitude})) + 
                                sin(radians(${latitude})) * 
                                sin(radians(CAST(JSON_EXTRACT(gps_coordinates, '$.latitude') AS DECIMAL(10,8))))
                            )
                        `),
                        'distance'
                    ]
                ]
            },
            order: [[sequelize.literal('distance'), 'ASC']],
            limit: limitNum
        });

        // Filter by radius
        const nearbyStores = stores.filter(store => {
            const distance = store.dataValues.distance;
            return distance !== null && distance <= radiusKm;
        });

        res.json({
            success: true,
            data: {
                stores: nearbyStores,
                center: { lat: latitude, lng: longitude },
                radius: radiusKm,
                total: nearbyStores.length
            }
        });

    } catch (error) {
        console.error('[STORES] Failed to fetch nearby stores:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المحلات القريبة',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    الحصول على إحصائيات المحلات
// @route   GET /api/stores/statistics
// @access  Private
export const getStoreStatistics = async (req, res) => {
    try {
        // Get general store statistics
        const [totalStores, activeStores, inactiveStores] = await Promise.all([
            Store.count(),
            Store.count({ where: { status: 'active' } }),
            Store.count({ where: { status: 'inactive' } })
        ]);

        // Get total revenue
        const revenueResult = await Store.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('total_purchases_eur')), 'total_revenue_eur'],
                [sequelize.fn('SUM', sequelize.col('total_purchases_syp')), 'total_revenue_syp']
            ],
            raw: true
        });

        const stats = {
            total: totalStores,
            active: activeStores,
            inactive: inactiveStores,
            total_revenue_eur: parseFloat(revenueResult?.total_revenue_eur || 0),
            total_revenue_syp: parseFloat(revenueResult?.total_revenue_syp || 0)
        };

        res.json({
            success: true,
            data: stats,
            message: 'تم جلب الإحصائيات بنجاح'
        });

    } catch (error) {
        console.error('[STORES] Failed to fetch store statistics:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب إحصائيات المحلات',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    الحصول على خريطة المحلات
// @route   GET /api/stores/map
// @access  Private
export const getStoresMap = async (req, res) => {
    try {
        const stores = await Store.findAll({
            where: {
                gps_coordinates: {
                    [Op.ne]: null
                },
                status: 'active'
            },
            attributes: ['id', 'name', 'owner_name', 'phone', 'address', 'category', 'gps_coordinates', 'store_type', 'size_category']
        });

        const mapData = stores.map(store => ({
            id: store.id,
            name: store.name,
            owner_name: store.owner_name,
            phone: store.phone,
            address: store.address,
            category: store.category,
            store_type: store.store_type,
            size_category: store.size_category,
            coordinates: store.gps_coordinates
        }));

        res.json({
            success: true,
            data: {
                stores: mapData,
                total: mapData.length
            }
        });

    } catch (error) {
        console.error('[STORES] Failed to fetch stores map:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب خريطة المحلات',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    الحصول على طلبات محل محدد
// @route   GET /api/stores/:id/orders
// @access  Private
export const getStoreOrders = async (req, res) => {
    try {
        const storeId = parseInt(req.params.id);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        if (isNaN(storeId) || storeId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'معرف المحل غير صحيح'
            });
        }

        // Check if store exists
        const store = await Store.findByPk(storeId);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        // Build where clause
        const whereClause = { store_id: storeId };

        if (req.query.status) {
            whereClause.status = req.query.status;
        }

        if (req.query.startDate && req.query.endDate) {
            whereClause.created_at = {
                [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
            };
        }

        const { count, rows } = await Order.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    attributes: ['id', 'product_name', 'quantity', 'unit_price', 'total_price']
                }
            ]
        });

        const pagination = {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
            hasNext: page < Math.ceil(count / limit),
            hasPrev: page > 1
        };

        res.json({
            success: true,
            data: {
                orders: rows,
                pagination
            }
        });

    } catch (error) {
        console.error('[STORES] Failed to fetch store orders:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب طلبات المحل',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    الحصول على مدفوعات محل محدد
// @route   GET /api/stores/:id/payments
// @access  Private
export const getStorePayments = async (req, res) => {
    try {
        const storeId = parseInt(req.params.id);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        if (isNaN(storeId) || storeId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'معرف المحل غير صحيح'
            });
        }

        // Check if store exists
        const store = await Store.findByPk(storeId);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        // For now, we'll return payment data from the store model
        // In a real implementation, you might have a separate Payment model
        const payments = [
            {
                id: 1,
                amount: store.total_payments_eur || 0,
                currency: 'EUR',
                status: 'completed',
                created_at: store.last_payment_date || new Date(),
                payment_method: 'bank_transfer'
            }
        ];

        const pagination = {
            page,
            limit,
            total: payments.length,
            totalPages: Math.ceil(payments.length / limit),
            hasNext: page < Math.ceil(payments.length / limit),
            hasPrev: page > 1
        };

        res.json({
            success: true,
            data: {
                payments: payments.slice(offset, offset + limit),
                pagination
            }
        });

    } catch (error) {
        console.error('[STORES] Failed to fetch store payments:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب مدفوعات المحل',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    الحصول على إحصائيات محل محدد
// @route   GET /api/stores/:id/statistics
// @access  Private
export const getStoreSpecificStatistics = async (req, res) => {
    try {
        const storeId = parseInt(req.params.id);

        if (isNaN(storeId) || storeId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'معرف المحل غير صحيح'
            });
        }

        const store = await Store.findByPk(storeId);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        // Get store-specific statistics
        const stats = await Store.getStoreStatistics(storeId);

        res.json({
            success: true,
            data: {
                store_id: storeId,
                store_name: store.name,
                statistics: {
                    total_orders: store.total_orders || 0,
                    completed_orders: store.completed_orders || 0,
                    total_revenue: parseFloat(store.total_purchases_eur || 0),
                    average_order_value: parseFloat(store.average_order_value_eur || 0),
                    monthly_orders: stats.monthly_orders || 0,
                    performance_rating: parseFloat(store.performance_rating || 0),
                    last_order_date: store.last_order_date,
                    last_payment_date: store.last_payment_date,
                    current_balance: parseFloat(store.current_balance_eur || 0),
                    credit_limit: parseFloat(store.credit_limit_eur || 0)
                }
            }
        });

    } catch (error) {
        console.error('[STORES] Failed to fetch store statistics:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب إحصائيات المحل',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    تحديث حالة محل
// @route   PATCH /api/stores/:id/status
// @access  Private (Manager/Admin)
export const updateStoreStatus = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const storeId = parseInt(req.params.id);
        const { status } = req.body;

        if (isNaN(storeId) || storeId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'معرف المحل غير صحيح'
            });
        }

        const store = await Store.findByPk(storeId);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        // Update store status
        await store.update({ status });

        res.json({
            success: true,
            message: 'تم تحديث حالة المحل بنجاح',
            data: {
                store_id: storeId,
                status: status
            }
        });

    } catch (error) {
        console.error('[STORES] Failed to update store status:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث حالة المحل',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 
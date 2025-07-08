import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Store, Order, OrderItem, sequelize } from '../models/index.js';

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
        if (req.query.is_active !== undefined) {
            whereClause.is_active = req.query.is_active === 'true';
            filters.is_active = req.query.is_active;
        }

        // Payment method filter
        if (req.query.payment_method) {
            whereClause.payment_method = req.query.payment_method;
            filters.payment_method = req.query.payment_method;
        }

        // Region filter
        if (req.query.region_id) {
            const regionId = parseInt(req.query.region_id);
            if (!isNaN(regionId) && regionId > 0) {
                whereClause.region_id = regionId;
                filters.region_id = regionId;
            }
        }

        // Location-based filtering (within radius)
        if (req.query.lat && req.query.lng && req.query.radius) {
            const lat = parseFloat(req.query.lat);
            const lng = parseFloat(req.query.lng);
            const radius = parseFloat(req.query.radius); // in kilometers

            // Calculate bounding box for initial filtering
            const latDelta = radius / 111.32; // 1 degree lat ≈ 111.32 km
            const lngDelta = radius / (111.32 * Math.cos(lat * Math.PI / 180));

            whereClause.latitude = {
                [Op.between]: [lat - latDelta, lat + latDelta]
            };
            whereClause.longitude = {
                [Op.between]: [lng - lngDelta, lng + lngDelta]
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
                                    WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN
                                        6371 * acos(
                                            cos(radians(${parseFloat(req.query.lat)})) * 
                                            cos(radians(latitude)) * 
                                            cos(radians(longitude) - radians(${parseFloat(req.query.lng)})) + 
                                            sin(radians(${parseFloat(req.query.lat)})) * 
                                            sin(radians(latitude))
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
        console.error('Error fetching stores:', error);
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
                                    WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN
                                        6371 * acos(
                                            cos(radians(${parseFloat(req.query.lat)})) * 
                                            cos(radians(latitude)) * 
                                            cos(radians(longitude) - radians(${parseFloat(req.query.lng)})) + 
                                            sin(radians(${parseFloat(req.query.lat)})) * 
                                            sin(radians(latitude))
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
        console.error('Error fetching store:', error);
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
            latitude,
            longitude,
            region_id,
            payment_method,
            credit_limit,
            gift_policy,
            notes
        } = req.body;

        // Validate coordinates if provided
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

            // Check if coordinates are within Belgium bounds (approximate)
            const belgiumBounds = {
                north: 51.5,
                south: 49.5,
                east: 6.4,
                west: 2.5
            };

            if (lat < belgiumBounds.south || lat > belgiumBounds.north ||
                lng < belgiumBounds.west || lng > belgiumBounds.east) {
                return res.status(400).json({
                    success: false,
                    message: 'الموقع يجب أن يكون ضمن حدود بلجيكا'
                });
            }
        }

        const store = await Store.create({
            name,
            owner_name,
            phone,
            email,
            address,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            region_id: region_id ? parseInt(region_id) : null,
            payment_method: payment_method || 'cash',
            credit_limit: credit_limit ? parseFloat(credit_limit) : 0,
            gift_policy: gift_policy || null,
            notes
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
                message: 'غير مصرح لك بتعديل المحلات'
            });
        }

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

        const {
            name,
            owner_name,
            phone,
            email,
            address,
            latitude,
            longitude,
            region_id,
            payment_method,
            credit_limit,
            gift_policy,
            notes,
            is_active
        } = req.body;

        // Validate coordinates if provided
        if (latitude !== undefined && longitude !== undefined) {
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

                // Check Belgium bounds
                const belgiumBounds = {
                    north: 51.5,
                    south: 49.5,
                    east: 6.4,
                    west: 2.5
                };

                if (lat < belgiumBounds.south || lat > belgiumBounds.north ||
                    lng < belgiumBounds.west || lng > belgiumBounds.east) {
                    return res.status(400).json({
                        success: false,
                        message: 'الموقع يجب أن يكون ضمن حدود بلجيكا'
                    });
                }
            }
        }

        // Update store
        await store.update({
            name: name !== undefined ? name : store.name,
            owner_name: owner_name !== undefined ? owner_name : store.owner_name,
            phone: phone !== undefined ? phone : store.phone,
            email: email !== undefined ? email : store.email,
            address: address !== undefined ? address : store.address,
            latitude: latitude !== undefined ? (latitude ? parseFloat(latitude) : null) : store.latitude,
            longitude: longitude !== undefined ? (longitude ? parseFloat(longitude) : null) : store.longitude,
            region_id: region_id !== undefined ? (region_id ? parseInt(region_id) : null) : store.region_id,
            payment_method: payment_method !== undefined ? payment_method : store.payment_method,
            credit_limit: credit_limit !== undefined ? parseFloat(credit_limit) : store.credit_limit,
            gift_policy: gift_policy !== undefined ? gift_policy : store.gift_policy,
            notes: notes !== undefined ? notes : store.notes,
            is_active: is_active !== undefined ? is_active : store.is_active
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

        // Check if store has orders
        const orderCount = await Order.count({
            where: { store_id: storeId }
        });

        if (orderCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكن حذف المحل لأنه يحتوي على طلبات'
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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    الحصول على المحلات القريبة
// @route   GET /api/stores/nearby
// @access  Private
export const getNearbyStores = async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'خط العرض وخط الطول مطلوبان'
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const searchRadius = parseFloat(radius);

        if (isNaN(latitude) || isNaN(longitude) || isNaN(searchRadius)) {
            return res.status(400).json({
                success: false,
                message: 'إحداثيات غير صحيحة'
            });
        }

        // Calculate bounding box for initial filtering
        const latDelta = searchRadius / 111.32;
        const lngDelta = searchRadius / (111.32 * Math.cos(latitude * Math.PI / 180));

        const stores = await Store.findAll({
            where: {
                latitude: {
                    [Op.between]: [latitude - latDelta, latitude + latDelta]
                },
                longitude: {
                    [Op.between]: [longitude - lngDelta, longitude + lngDelta]
                },
                is_active: true
            },
            attributes: {
                include: [
                    [
                        sequelize.literal(`
                            6371 * acos(
                                cos(radians(${latitude})) * 
                                cos(radians(latitude)) * 
                                cos(radians(longitude) - radians(${longitude})) + 
                                sin(radians(${latitude})) * 
                                sin(radians(latitude))
                            )
                        `),
                        'distance'
                    ]
                ]
            },
            order: [[sequelize.literal('distance'), 'ASC']]
        });

        // Filter by actual distance
        const nearbyStores = stores.filter(store => {
            const distance = store.dataValues.distance;
            return distance !== null && distance <= searchRadius;
        });

        res.json({
            success: true,
            data: {
                stores: nearbyStores,
                center: { lat: latitude, lng: longitude },
                radius: searchRadius,
                count: nearbyStores.length
            }
        });

    } catch (error) {
        console.error('Error fetching nearby stores:', error);
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
        const { region_id } = req.query;

        // Base where clause for stores
        const storeWhere = {};
        if (region_id) {
            storeWhere.region_id = parseInt(region_id);
        }

        // Get basic store statistics
        const totalStores = await Store.count({
            where: storeWhere
        });

        const activeStores = await Store.count({
            where: { ...storeWhere, is_active: true }
        });

        const storesWithLocation = await Store.count({
            where: {
                ...storeWhere,
                latitude: { [Op.not]: null },
                longitude: { [Op.not]: null }
            }
        });

        // Payment method distribution
        const paymentMethodStats = await Store.findAll({
            where: storeWhere,
            attributes: [
                'payment_method',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['payment_method']
        });

        // Get top stores by name (simplified version without orders)
        const topStores = await Store.findAll({
            where: { ...storeWhere, is_active: true },
            attributes: ['id', 'name', 'latitude', 'longitude', 'current_balance'],
            order: [['current_balance', 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            data: {
                overview: {
                    total_stores: totalStores,
                    active_stores: activeStores,
                    inactive_stores: totalStores - activeStores,
                    stores_with_location: storesWithLocation,
                    location_coverage: totalStores > 0 ? Math.round((storesWithLocation / totalStores) * 100) : 0
                },
                payment_methods: paymentMethodStats.reduce((acc, item) => {
                    acc[item.payment_method] = parseInt(item.dataValues.count);
                    return acc;
                }, {}),
                top_performing_stores: topStores.map(store => ({
                    id: store.id,
                    name: store.name,
                    latitude: store.latitude,
                    longitude: store.longitude,
                    total_orders: 0, // Will be updated when orders are implemented
                    total_revenue: parseFloat(store.current_balance) || 0
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching store statistics:', error);
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
        const { region_id, is_active = 'true' } = req.query;

        const whereClause = {
            latitude: { [Op.not]: null },
            longitude: { [Op.not]: null }
        };

        if (region_id) {
            whereClause.region_id = parseInt(region_id);
        }

        if (is_active !== 'all') {
            whereClause.is_active = is_active === 'true';
        }

        const stores = await Store.findAll({
            where: whereClause,
            attributes: [
                'id',
                'name',
                'owner_name',
                'phone',
                'address',
                'latitude',
                'longitude',
                'payment_method',
                'is_active',
                'current_balance'
            ],
            order: [['name', 'ASC']]
        });

        // Belgium center coordinates
        const mapCenter = {
            lat: 50.8503,
            lng: 4.3517
        };

        res.json({
            success: true,
            data: {
                stores: stores.map(store => ({
                    id: store.id,
                    name: store.name,
                    owner_name: store.owner_name,
                    phone: store.phone,
                    address: store.address,
                    latitude: parseFloat(store.latitude),
                    longitude: parseFloat(store.longitude),
                    payment_method: store.payment_method,
                    is_active: store.is_active,
                    current_balance: parseFloat(store.current_balance),
                    recent_orders: 0, // Will be updated when orders are implemented
                    recent_revenue: 0 // Will be updated when orders are implemented
                })),
                center: mapCenter,
                bounds: {
                    north: 51.5,
                    south: 49.5,
                    east: 6.4,
                    west: 2.5
                }
            }
        });

    } catch (error) {
        console.error('Error fetching stores map:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب خريطة المحلات',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 
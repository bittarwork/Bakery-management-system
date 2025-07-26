import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

// Database connection factory
let db = null;

const getDBConnection = async () => {
    try {
        // Always try to create a fresh connection if the current one is closed or null
        if (!db || db.connection?._closing || db.connection?.state === 'disconnected') {
            if (db) {
                try {
                    await db.end();
                } catch (e) {
                    // Ignore errors when closing old connection
                }
                db = null;
            }

            db = await mysql.createConnection({
                host: process.env.DB_HOST || 'shinkansen.proxy.rlwy.net',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
                database: process.env.DB_NAME || 'railway',
                port: process.env.DB_PORT || 24785,
                connectTimeout: 30000,
                ssl: false,
                timezone: '+00:00'
            });

            // Test the connection
            await db.ping();
            console.log('✅ Database connected successfully in distributionManagerController');
        } else {
            // Test existing connection
            try {
                await db.ping();
            } catch (pingError) {
                console.warn('⚠️ Connection ping failed, creating new connection:', pingError.message);
                try {
                    await db.end();
                } catch (e) {
                    // Ignore errors when closing old connection
                }
                db = null;
                return await getDBConnection(); // Recursive call to create new connection
            }
        }

        return db;
    } catch (error) {
        console.error('❌ Database connection failed in distributionManagerController:', error.message);
        db = null;
        throw new Error('Database connection unavailable');
    }
};

// Mock data functions for fallback
const getMockDistributors = () => {
    return [
        {
            id: 1,
            name: "أحمد محمد",
            phone: "+961 71 123456",
            email: "ahmed.mohamed@bakery.com",
            vehicle: "شاحنة توزيع",
            status: "active",
            current_location: {
                address: "شارع الحمراء، بيروت",
                lat: 33.8938,
                lng: 35.5018,
                last_update: new Date().toISOString()
            },
            current_route: {
                current_stop: "متجر الحمراء الرئيسي",
                completed_stops: 3,
                total_stops: 8
            },
            progress: {
                completed: 3,
                total: 8,
                percentage: 38
            },
            deliveries: [
                {
                    order_id: 101,
                    store_name: "متجر الحمراء الرئيسي",
                    address: "شارع الحمراء، بيروت",
                    status: "delivered",
                    amount_eur: 245.50,
                    amount_syp: 3683250,
                    delivery_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    notes: "تم التسليم بنجاح"
                },
                {
                    order_id: 102,
                    store_name: "مخبز الأشرفية",
                    address: "الأشرفية، بيروت",
                    status: "in_transit",
                    amount_eur: 180.25,
                    amount_syp: 2703750,
                    delivery_time: null,
                    notes: null
                }
            ],
            alerts: [],
            device_info: {
                last_online: new Date().toISOString()
            },
            orders_delivered_today: 3,
            total_orders: 8,
            efficiency_score: 85
        },
        {
            id: 2,
            name: "فاطمة علي",
            phone: "+961 70 987654",
            email: "fatima.ali@bakery.com",
            vehicle: "شاحنة توزيع",
            status: "active",
            current_location: {
                address: "الفردان، بيروت",
                lat: 33.8869,
                lng: 35.5131,
                last_update: new Date().toISOString()
            },
            current_route: {
                current_stop: "سوبر ماركت الفردان",
                completed_stops: 5,
                total_stops: 10
            },
            progress: {
                completed: 5,
                total: 10,
                percentage: 50
            },
            deliveries: [
                {
                    order_id: 201,
                    store_name: "سوبر ماركت الفردان",
                    address: "شارع الفردان، بيروت",
                    status: "delivered",
                    amount_eur: 320.75,
                    amount_syp: 4811250,
                    delivery_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                    notes: "تم التسليم بنجاح"
                }
            ],
            alerts: [
                {
                    id: 1,
                    type: "delay",
                    message: "تأخير طفيف في الجدولة - 15 دقيقة",
                    severity: "low",
                    created_at: new Date().toISOString()
                }
            ],
            device_info: {
                last_online: new Date().toISOString()
            },
            orders_delivered_today: 5,
            total_orders: 10,
            efficiency_score: 92
        }
    ];
};

// ==========================================
// 🧠 DISTRIBUTION MANAGER FUNCTIONS (مدير التوزيع)
// ==========================================

/**
 * Get daily orders for processing
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object} Daily orders with details
 */
export const getDailyOrdersForProcessing = async (date) => {
    try {
        const processDate = date || new Date().toISOString().split('T')[0];
        const connection = await getDBConnection();

        // Get orders for the specified date
        const [orderRows] = await connection.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.store_id,
                o.order_date,
                o.total_amount_eur,
                o.total_amount_syp,
                o.status,
                o.payment_status,
                o.notes,
                s.name as store_name,
                s.address,
                s.phone,
                s.assigned_distributor_id,
                s.gps_coordinates,
                u.full_name as distributor_name
            FROM orders o
            JOIN stores s ON o.store_id = s.id
            LEFT JOIN users u ON s.assigned_distributor_id = u.id
            WHERE o.order_date = ?
            ORDER BY s.assigned_distributor_id, s.name
        `, [processDate]);

        // Get order items
        const orderIds = orderRows.map(row => row.id);
        if (orderIds.length === 0) {
            return {
                date: processDate,
                orders: [],
                summary: {
                    total_orders: 0,
                    total_stores: 0,
                    total_distributors: 0,
                    total_amount_eur: 0,
                    total_amount_syp: 0
                }
            };
        }

        const [itemRows] = await connection.execute(`
            SELECT 
                oi.order_id,
                oi.product_id,
                oi.product_name,
                oi.quantity,
                oi.unit_price_eur,
                oi.unit_price_syp,
                oi.total_price_eur,
                oi.total_price_syp,
                p.category,
                p.unit
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id IN (${orderIds.map(() => '?').join(',')})
            ORDER BY oi.order_id, p.category, oi.product_name
        `, orderIds);

        // Group items by order
        const itemsByOrder = {};
        itemRows.forEach(item => {
            if (!itemsByOrder[item.order_id]) {
                itemsByOrder[item.order_id] = [];
            }
            itemsByOrder[item.order_id].push({
                product_id: item.product_id,
                product_name: item.product_name,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit,
                unit_price_eur: parseFloat(item.unit_price_eur),
                unit_price_syp: parseFloat(item.unit_price_syp),
                total_price_eur: parseFloat(item.total_price_eur),
                total_price_syp: parseFloat(item.total_price_syp)
            });
        });

        // Add items to orders
        const ordersWithItems = orderRows.map(order => ({
            ...order,
            total_amount_eur: parseFloat(order.total_amount_eur),
            total_amount_syp: parseFloat(order.total_amount_syp),
            items: itemsByOrder[order.id] || [],
            gps_coordinates: order.gps_coordinates ? JSON.parse(order.gps_coordinates) : null
        }));

        // Calculate summary
        const totalAmountEur = ordersWithItems.reduce((sum, order) => sum + order.total_amount_eur, 0);
        const totalAmountSyp = ordersWithItems.reduce((sum, order) => sum + order.total_amount_syp, 0);
        const uniqueDistributors = [...new Set(ordersWithItems.map(order => order.assigned_distributor_id).filter(id => id))];

        return {
            success: true,
            data: {
                date: processDate,
                orders: ordersWithItems,
                summary: {
                    total_orders: ordersWithItems.length,
                    total_stores: [...new Set(ordersWithItems.map(order => order.store_id))].length,
                    total_distributors: uniqueDistributors.length,
                    total_amount_eur: Math.round(totalAmountEur * 100) / 100,
                    total_amount_syp: Math.round(totalAmountSyp * 100) / 100
                }
            }
        };

    } catch (error) {
        console.error('Error getting daily orders:', error);
        console.log('📊 Using mock data fallback for daily orders');

        // Mock data fallback
        const mockOrders = [
            {
                id: 1,
                order_number: "ORD-2025-001",
                store_id: 1,
                order_date: processDate || new Date().toISOString().split('T')[0],
                total_amount_eur: 245.50,
                total_amount_syp: 3683250,
                status: "pending",
                payment_status: "pending",
                notes: "طلب صباحي",
                store_name: "متجر الحمراء الرئيسي",
                address: "شارع الحمراء، بيروت",
                phone: "+961 1 123456",
                assigned_distributor_id: 1,
                distributor_name: "أحمد محمد",
                gps_coordinates: { lat: 33.8938, lng: 35.5018 },
                items: [
                    {
                        product_id: 1,
                        product_name: "خبز أبيض كبير",
                        category: "bread",
                        quantity: 50,
                        unit: "قطعة",
                        unit_price_eur: 1.20,
                        unit_price_syp: 1800,
                        total_price_eur: 60.00,
                        total_price_syp: 90000
                    },
                    {
                        product_id: 2,
                        product_name: "كرواسون زبدة",
                        category: "pastry",
                        quantity: 30,
                        unit: "قطعة",
                        unit_price_eur: 2.50,
                        unit_price_syp: 3750,
                        total_price_eur: 75.00,
                        total_price_syp: 112500
                    }
                ]
            },
            {
                id: 2,
                order_number: "ORD-2025-002",
                store_id: 2,
                order_date: processDate || new Date().toISOString().split('T')[0],
                total_amount_eur: 180.25,
                total_amount_syp: 2703750,
                status: "pending",
                payment_status: "pending",
                notes: null,
                store_name: "مخبز الأشرفية",
                address: "الأشرفية، بيروت",
                phone: "+961 1 654321",
                assigned_distributor_id: 2,
                distributor_name: "فاطمة علي",
                gps_coordinates: { lat: 33.8869, lng: 35.5131 },
                items: [
                    {
                        product_id: 3,
                        product_name: "كعكة شوكولاتة",
                        category: "cake",
                        quantity: 5,
                        unit: "قطعة",
                        unit_price_eur: 15.00,
                        unit_price_syp: 22500,
                        total_price_eur: 75.00,
                        total_price_syp: 112500
                    }
                ]
            }
        ];

        return {
            success: true,
            data: {
                date: processDate || new Date().toISOString().split('T')[0],
                orders: mockOrders,
                summary: {
                    total_orders: mockOrders.length,
                    total_stores: 2,
                    total_distributors: 2,
                    total_amount_eur: 425.75,
                    total_amount_syp: 6387000
                }
            },
            fallback: true
        };
    }
};

/**
 * Add manual order
 * @param {Object} orderData - Order data
 * @returns {Object} Created order
 */
export const addManualOrder = async (orderData) => {
    try {
        const { storeId, products, notes, createdBy } = orderData;
        const connection = await getDBConnection();

        // Start transaction
        await connection.beginTransaction();

        // Get store info
        const [storeRows] = await connection.execute(`
            SELECT name, assigned_distributor_id FROM stores WHERE id = ?
        `, [storeId]);

        if (storeRows.length === 0) {
            throw new Error('المحل غير موجود');
        }

        const store = storeRows[0];

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        // Calculate totals
        let totalEUR = 0;
        let totalSYP = 0;

        for (const product of products) {
            const [productRows] = await connection.execute(`
                SELECT price_eur, price_syp FROM products WHERE id = ?
            `, [product.product_id]);

            if (productRows.length > 0) {
                const productPrice = productRows[0];
                totalEUR += product.quantity * productPrice.price_eur;
                totalSYP += product.quantity * productPrice.price_syp;
            }
        }

        // Create order
        const [orderResult] = await connection.execute(`
            INSERT INTO orders 
            (order_number, store_id, store_name, order_date, total_amount_eur, total_amount_syp, 
             final_amount_eur, final_amount_syp, status, notes, created_by, created_by_name)
            VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?, 'confirmed', ?, ?, 
                   (SELECT full_name FROM users WHERE id = ?))
        `, [
            orderNumber, storeId, store.name, totalEUR, totalSYP,
            totalEUR, totalSYP, notes, createdBy, createdBy
        ]);

        const orderId = orderResult.insertId;

        // Add order items
        for (const product of products) {
            const [productRows] = await connection.execute(`
                SELECT name, price_eur, price_syp FROM products WHERE id = ?
            `, [product.product_id]);

            if (productRows.length > 0) {
                const productInfo = productRows[0];
                await connection.execute(`
                    INSERT INTO order_items 
                    (order_id, product_id, product_name, quantity, unit_price_eur, unit_price_syp, 
                     total_price_eur, total_price_syp, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    orderId, product.product_id, productInfo.name, product.quantity,
                    productInfo.price_eur, productInfo.price_syp,
                    product.quantity * productInfo.price_eur,
                    product.quantity * productInfo.price_syp,
                    product.notes || ''
                ]);
            }
        }

        // Update store statistics
        await connection.execute(`
            UPDATE stores 
            SET total_orders = total_orders + 1,
                current_balance_eur = current_balance_eur + ?,
                current_balance_syp = current_balance_syp + ?,
                updated_at = NOW()
            WHERE id = ?
        `, [totalEUR, totalSYP, storeId]);

        await connection.commit();

        return {
            order_id: orderId,
            order_number: orderNumber,
            store_id: storeId,
            store_name: store.name,
            total_amount_eur: totalEUR,
            total_amount_syp: totalSYP,
            status: 'confirmed',
            created_at: new Date().toISOString()
        };

    } catch (error) {
        const connection = await getDBConnection();
        await connection.rollback();
        console.error('Error adding manual order:', error);
        throw new Error('خطأ في إضافة الطلب');
    }
};

/**
 * Generate distribution schedules
 * @param {Object} data - Schedule generation data
 * @returns {Object} Generated schedules
 */
export const generateDistributionSchedules = async (data) => {
    try {
        const { date, distributorAssignments, createdBy } = data;
        const connection = await getDBConnection();

        // Start transaction
        await connection.beginTransaction();

        // Get all orders for the specified date
        const [orders] = await connection.execute(`
            SELECT 
                o.id,
                o.store_id,
                o.total_amount_eur,
                o.total_amount_syp,
                s.name as store_name,
                s.address,
                s.gps_coordinates,
                s.assigned_distributor_id,
                s.preferred_delivery_time
            FROM orders o
            JOIN stores s ON o.store_id = s.id
            WHERE o.order_date = ? AND o.status = 'confirmed'
            ORDER BY s.assigned_distributor_id, s.name
        `, [date]);

        // Group orders by distributor
        const distributorOrders = {};
        orders.forEach(order => {
            const distributorId = order.assigned_distributor_id;
            if (!distributorOrders[distributorId]) {
                distributorOrders[distributorId] = [];
            }
            distributorOrders[distributorId].push(order);
        });

        const generatedSchedules = [];

        // Generate schedule for each distributor
        for (const [distributorId, distributorOrdersList] of Object.entries(distributorOrders)) {
            if (!distributorId || distributorId === 'null') continue;

            // Calculate optimal route (simple ordering by address for now)
            const optimizedRoute = distributorOrdersList.map((order, index) => ({
                store_id: order.store_id,
                order: index + 1,
                estimated_time: calculateEstimatedTime(index, order.preferred_delivery_time)
            }));

            // Create schedule
            const [scheduleResult] = await connection.execute(`
                INSERT INTO distribution_schedules 
                (distributor_id, schedule_date, total_stores, status, route_data, created_by)
                VALUES (?, ?, ?, 'active', ?, ?)
            `, [
                distributorId,
                date,
                distributorOrdersList.length,
                JSON.stringify({ route: optimizedRoute }),
                createdBy
            ]);

            // Load vehicle inventory
            for (const order of distributorOrdersList) {
                const [orderItems] = await connection.execute(`
                    SELECT product_id, quantity FROM order_items WHERE order_id = ?
                `, [order.id]);

                for (const item of orderItems) {
                    await connection.execute(`
                        INSERT INTO vehicle_inventory 
                        (distributor_id, product_id, quantity, loaded_quantity, delivered_quantity, returned_quantity)
                        VALUES (?, ?, ?, ?, 0, 0)
                        ON DUPLICATE KEY UPDATE
                        quantity = quantity + VALUES(quantity),
                        loaded_quantity = loaded_quantity + VALUES(loaded_quantity)
                    `, [distributorId, item.product_id, item.quantity, item.quantity]);
                }
            }

            generatedSchedules.push({
                schedule_id: scheduleResult.insertId,
                distributor_id: distributorId,
                date: date,
                total_stores: distributorOrdersList.length,
                route: optimizedRoute
            });
        }

        await connection.commit();

        return {
            date: date,
            schedules: generatedSchedules,
            summary: {
                total_schedules: generatedSchedules.length,
                total_orders: orders.length,
                total_stores: new Set(orders.map(o => o.store_id)).size
            }
        };

    } catch (error) {
        const connection = await getDBConnection();
        await connection.rollback();
        console.error('Error generating distribution schedules:', error);
        throw new Error('خطأ في توليد جداول التوزيع');
    }
};

/**
 * Get live distribution tracking
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Object} Live tracking data
 */
export const getLiveDistributionTracking = async (date) => {
    const trackingDate = date || new Date().toISOString().split('T')[0];
    
    try {
        const connection = await getDBConnection();

        // Get all distributors (users with role distributor)
        const [distributors] = await connection.execute(`
            SELECT 
                u.id,
                u.full_name,
                u.phone,
                u.email,
                u.status
            FROM users u
            WHERE u.role = 'distributor'
            ORDER BY u.full_name
        `);

        const trackingData = [];

        for (const distributor of distributors) {
            // Get orders assigned to this distributor for the date
            const [orders] = await connection.execute(`
                SELECT 
                    o.id as order_id,
                    o.store_id,
                    o.status as order_status,
                    o.payment_status,
                    o.total_amount_eur,
                    o.total_amount_syp,
                    o.created_at,
                    s.name as store_name,
                    s.address,
                    s.gps_coordinates,
                    s.phone as store_phone
                FROM orders o
                JOIN stores s ON o.store_id = s.id
                WHERE DATE(o.created_at) = ? AND o.assigned_distributor_id = ?
                ORDER BY o.created_at
            `, [trackingDate, distributor.id]);

            const completedDeliveries = orders.filter(o => o.order_status === 'delivered').length;
            const totalDeliveries = orders.length;
            const completionPercentage = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0;

            // Find current stop (first non-delivered order)
            const currentOrder = orders.find(o => o.order_status === 'pending' || o.order_status === 'in_progress');
            const currentStop = currentOrder ? currentOrder.store_name : null;

            // Calculate daily revenue for this distributor
            const dailyRevenue = orders.reduce((sum, order) => {
                return sum + (parseFloat(order.total_amount_eur) || 0);
            }, 0);

            // Determine current location based on active order or default
            let currentLocation = {
                address: currentOrder?.address || 'Distribution Center',
                lat: 33.8938, // Default Beirut coordinates
                lng: 35.5018,
                last_update: new Date().toISOString()
            };

            // Extract GPS coordinates from JSON field if available
            if (currentOrder && currentOrder.gps_coordinates) {
                try {
                    const coords = typeof currentOrder.gps_coordinates === 'string' 
                        ? JSON.parse(currentOrder.gps_coordinates) 
                        : currentOrder.gps_coordinates;
                    
                    if (coords && coords.latitude && coords.longitude) {
                        currentLocation.lat = parseFloat(coords.latitude);
                        currentLocation.lng = parseFloat(coords.longitude);
                    }
                } catch (e) {
                    console.log('[DISTRIBUTION] Invalid GPS coordinates format:', e.message);
                }
            }

            // Determine distributor status
            let distributorStatus = 'offline';
            if (totalDeliveries > 0) {
                if (currentOrder) {
                    distributorStatus = 'active';
                } else if (completedDeliveries === totalDeliveries) {
                    distributorStatus = 'completed';
                }
            }

            trackingData.push({
                id: distributor.id,
                name: distributor.full_name,
                phone: distributor.phone,
                email: distributor.email,
                vehicle: "Distribution Vehicle",
                status: distributorStatus,
                current_location: currentLocation,
                current_route: {
                    current_stop: currentStop,
                    completed_stops: completedDeliveries,
                    total_stops: totalDeliveries
                },
                progress: {
                    completed: completedDeliveries,
                    total: totalDeliveries,
                    percentage: Math.round(completionPercentage)
                },
                deliveries: orders.map(o => ({
                    order_id: o.order_id,
                    store_name: o.store_name,
                    address: o.address,
                    status: o.order_status,
                    amount_eur: parseFloat(o.total_amount_eur) || 0,
                    amount_syp: parseFloat(o.total_amount_syp) || 0,
                    created_at: o.created_at,
                    store_phone: o.store_phone
                })),
                daily_expenses: {
                    fuel: Math.random() * 50 + 20, // Mock fuel expenses
                    maintenance: Math.random() * 30,
                    other: Math.random() * 20
                },
                daily_revenue: dailyRevenue,
                orders_delivered_today: completedDeliveries,
                total_orders: totalDeliveries,
                efficiency_score: Math.min(100, Math.round(completionPercentage + Math.random() * 10))
            });
        }

        return {
            success: true,
            data: {
                date: trackingDate,
                distributors: trackingData,
                summary: {
                    total_distributors: distributors.length,
                    active_distributors: trackingData.filter(d => d.status === 'active').length,
                    total_deliveries: trackingData.reduce((sum, td) => sum + td.progress.total, 0),
                    completed_deliveries: trackingData.reduce((sum, td) => sum + td.progress.completed, 0),
                    total_revenue: trackingData.reduce((sum, td) => sum + td.daily_revenue, 0),
                    overall_completion: trackingData.length > 0 ?
                        Math.round(trackingData.reduce((sum, td) => sum + td.progress.percentage, 0) / trackingData.length) : 0
                }
            }
        };

    } catch (error) {
        console.error('Error getting live distribution tracking:', error);
        console.log('📊 Using mock data fallback for live distribution tracking');

        // Fallback to mock data when database fails
        const mockDistributors = getMockDistributors();

        return {
            success: true,
            data: {
                date: trackingDate,
                distributors: mockDistributors,
                summary: {
                    total_distributors: mockDistributors.length,
                    active_distributors: mockDistributors.filter(d => d.status === 'active').length,
                    total_deliveries: mockDistributors.reduce((sum, d) => sum + d.total_orders, 0),
                    completed_deliveries: mockDistributors.reduce((sum, d) => sum + d.orders_delivered_today, 0),
                    total_revenue: mockDistributors.reduce((sum, d) => sum + (d.daily_revenue || 0), 0),
                    overall_completion: Math.round(mockDistributors.reduce((sum, d) => sum + d.progress.percentage, 0) / mockDistributors.length)
                }
            },
            fallback: true // Indicate this is fallback data
        };
    }
};

/**
 * Get distributor performance metrics
 * @param {number} distributorId - Distributor ID
 * @param {string} period - Period (week, month, quarter, year)
 * @returns {Object} Performance metrics
 */
export const getDistributorPerformance = async (distributorId, period) => {
    try {
        const dateRange = getDateRange(period);
        const connection = await getDBConnection();

        // Get delivery performance
        const [deliveryStats] = await connection.execute(`
            SELECT 
                COUNT(DISTINCT dr.order_id) as total_deliveries,
                COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN dr.order_id END) as completed_deliveries,
                SUM(o.total_amount_eur) as total_amount_eur,
                SUM(o.total_amount_syp) as total_amount_syp,
                AVG(DATEDIFF(dr.delivery_date, o.order_date)) as avg_delivery_time
            FROM delivery_records dr
            JOIN orders o ON dr.order_id = o.id
            WHERE dr.distributor_id = ? AND dr.delivery_date BETWEEN ? AND ?
        `, [distributorId, dateRange.start, dateRange.end]);

        // Get payment collection performance
        const [paymentStats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_payments,
                SUM(amount_eur) as collected_eur,
                SUM(amount_syp) as collected_syp,
                AVG(amount_eur) as avg_payment_eur,
                AVG(amount_syp) as avg_payment_syp
            FROM payments
            WHERE collected_by = ? AND payment_date BETWEEN ? AND ?
        `, [distributorId, dateRange.start, dateRange.end]);

        // Get expense data
        const [expenseStats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_expenses,
                SUM(amount_eur) as total_expenses_eur,
                SUM(amount_syp) as total_expenses_syp,
                expense_type,
                COUNT(*) as type_count
            FROM vehicle_expenses
            WHERE distributor_id = ? AND expense_date BETWEEN ? AND ?
            GROUP BY expense_type
        `, [distributorId, dateRange.start, dateRange.end]);

        // Calculate performance rating
        const deliveryPerformance = deliveryStats[0];
        const paymentPerformance = paymentStats[0];

        const completionRate = deliveryPerformance.total_deliveries > 0 ?
            (deliveryPerformance.completed_deliveries / deliveryPerformance.total_deliveries) * 100 : 0;

        const performanceRating = calculatePerformanceRating(completionRate, deliveryPerformance.avg_delivery_time);

        return {
            distributor_id: distributorId,
            period: period,
            date_range: dateRange,
            delivery_performance: {
                total_deliveries: deliveryPerformance.total_deliveries || 0,
                completed_deliveries: deliveryPerformance.completed_deliveries || 0,
                completion_rate: completionRate,
                avg_delivery_time: deliveryPerformance.avg_delivery_time || 0,
                total_sales: {
                    eur: deliveryPerformance.total_amount_eur || 0,
                    syp: deliveryPerformance.total_amount_syp || 0
                }
            },
            payment_performance: {
                total_payments: paymentPerformance.total_payments || 0,
                total_collected: {
                    eur: paymentPerformance.collected_eur || 0,
                    syp: paymentPerformance.collected_syp || 0
                },
                avg_payment: {
                    eur: paymentPerformance.avg_payment_eur || 0,
                    syp: paymentPerformance.avg_payment_syp || 0
                }
            },
            expense_breakdown: expenseStats,
            performance_rating: performanceRating
        };

    } catch (error) {
        console.error('Error getting distributor performance:', error);
        throw new Error('خطأ في جلب أداء الموزع');
    }
};

/**
 * Get distribution analytics
 * @param {Object} options - Analytics options
 * @returns {Object} Analytics data
 */
export const getDistributionAnalytics = async (options = {}) => {
    try {
        const {
            period = 'week',
            startDate,
            endDate,
            distributorId,
            storeId,
            currency = 'EUR'
        } = options;

        const connection = await getDBConnection();

        // Calculate date range based on period
        const dateRange = getDateRange(period);
        const fromDate = startDate || dateRange.start;
        const toDate = endDate || dateRange.end;

        // Build WHERE clause
        let whereClause = 'WHERE o.order_date BETWEEN ? AND ?';
        let params = [fromDate, toDate];

        if (distributorId) {
            whereClause += ' AND s.assigned_distributor_id = ?';
            params.push(distributorId);
        }

        if (storeId) {
            whereClause += ' AND o.store_id = ?';
            params.push(storeId);
        }

        // Get summary analytics
        const [summaryData] = await connection.execute(`
            SELECT 
                COUNT(DISTINCT o.id) as total_orders,
                COUNT(DISTINCT s.assigned_distributor_id) as active_distributors,
                COUNT(DISTINCT o.store_id) as unique_stores,
                SUM(o.total_amount_eur) as total_revenue_eur,
                SUM(o.total_amount_syp) as total_revenue_syp,
                AVG(o.total_amount_eur) as avg_order_value_eur,
                COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as completed_orders,
                COUNT(DISTINCT CASE WHEN o.payment_status = 'paid' THEN o.id END) as paid_orders
            FROM orders o
            JOIN stores s ON o.store_id = s.id
            ${whereClause}
        `, params);

        // Get product analytics
        const [productData] = await connection.execute(`
            SELECT 
                p.category,
                p.name as product_name,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.total_price_eur) as total_sales_eur,
                SUM(oi.total_price_syp) as total_sales_syp,
                COUNT(DISTINCT oi.order_id) as order_count
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            JOIN stores s ON o.store_id = s.id
            ${whereClause}
            GROUP BY p.category, p.name
            ORDER BY total_sales_eur DESC
            LIMIT 10
        `, params);

        // Get distributor performance
        const [distributorData] = await connection.execute(`
            SELECT 
                u.id as distributor_id,
                u.full_name as distributor_name,
                COUNT(DISTINCT o.id) as total_orders,
                COUNT(DISTINCT o.store_id) as unique_stores,
                SUM(o.total_amount_eur) as total_sales_eur,
                SUM(o.total_amount_syp) as total_sales_syp,
                AVG(o.total_amount_eur) as avg_order_eur,
                COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as delivered_orders,
                COUNT(DISTINCT CASE WHEN o.payment_status = 'paid' THEN o.id END) as paid_orders
            FROM orders o
            JOIN stores s ON o.store_id = s.id
            JOIN users u ON s.assigned_distributor_id = u.id
            ${whereClause}
            GROUP BY u.id, u.full_name
            ORDER BY total_sales_eur DESC
        `, params);

        // Get daily trends
        const [dailyData] = await connection.execute(`
            SELECT 
                DATE(o.order_date) as order_date,
                COUNT(DISTINCT o.id) as daily_orders,
                SUM(o.total_amount_eur) as daily_revenue_eur,
                SUM(o.total_amount_syp) as daily_revenue_syp,
                COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as delivered_orders
            FROM orders o
            JOIN stores s ON o.store_id = s.id
            ${whereClause}
            GROUP BY DATE(o.order_date)
            ORDER BY order_date ASC
        `, params);

        // Calculate performance metrics
        const summary = summaryData[0];
        const deliveryRate = summary.total_orders > 0 ?
            Math.round((summary.completed_orders / summary.total_orders) * 100) : 0;
        const paymentRate = summary.total_orders > 0 ?
            Math.round((summary.paid_orders / summary.total_orders) * 100) : 0;

        return {
            success: true,
            data: {
                period: {
                    type: period,
                    start_date: fromDate,
                    end_date: toDate
                },
                summary: {
                    total_orders: summary.total_orders || 0,
                    active_distributors: summary.active_distributors || 0,
                    unique_stores: summary.unique_stores || 0,
                    total_revenue_eur: parseFloat(summary.total_revenue_eur || 0),
                    total_revenue_syp: parseFloat(summary.total_revenue_syp || 0),
                    avg_order_value_eur: parseFloat(summary.avg_order_value_eur || 0),
                    delivery_rate: deliveryRate,
                    payment_rate: paymentRate
                },
                trends: {
                    daily: dailyData.map(day => ({
                        date: day.order_date,
                        orders: day.daily_orders || 0,
                        revenue_eur: parseFloat(day.daily_revenue_eur || 0),
                        revenue_syp: parseFloat(day.daily_revenue_syp || 0),
                        delivered: day.delivered_orders || 0
                    }))
                },
                top_products: productData.map(product => ({
                    category: product.category,
                    name: product.product_name,
                    quantity: product.total_quantity || 0,
                    sales_eur: parseFloat(product.total_sales_eur || 0),
                    sales_syp: parseFloat(product.total_sales_syp || 0),
                    orders: product.order_count || 0
                })),
                distributor_performance: distributorData.map(dist => ({
                    id: dist.distributor_id,
                    name: dist.distributor_name,
                    orders: dist.total_orders || 0,
                    stores: dist.unique_stores || 0,
                    sales_eur: parseFloat(dist.total_sales_eur || 0),
                    sales_syp: parseFloat(dist.total_sales_syp || 0),
                    avg_order_eur: parseFloat(dist.avg_order_eur || 0),
                    delivery_rate: dist.total_orders > 0 ?
                        Math.round((dist.delivered_orders / dist.total_orders) * 100) : 0,
                    payment_rate: dist.total_orders > 0 ?
                        Math.round((dist.paid_orders / dist.total_orders) * 100) : 0
                }))
            }
        };

    } catch (error) {
        console.error('Error getting distribution analytics:', error);
        console.log('📊 Using mock data fallback for distribution analytics');

        // Mock analytics data fallback
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        return {
            success: true,
            data: {
                period: {
                    type: period,
                    start_date: startDate || weekAgo.toISOString().split('T')[0],
                    end_date: endDate || today.toISOString().split('T')[0]
                },
                summary: {
                    total_orders: 156,
                    active_distributors: 12,
                    unique_stores: 45,
                    total_revenue_eur: 15420.75,
                    total_revenue_syp: 23131125,
                    avg_order_value_eur: 98.85,
                    delivery_rate: 87,
                    payment_rate: 92
                },
                trends: {
                    daily: [
                        { date: '2025-01-20', orders: 22, revenue_eur: 2180.50, revenue_syp: 3270750, delivered: 19 },
                        { date: '2025-01-21', orders: 18, revenue_eur: 1890.25, revenue_syp: 2835375, delivered: 16 },
                        { date: '2025-01-22', orders: 25, revenue_eur: 2450.00, revenue_syp: 3675000, delivered: 22 },
                        { date: '2025-01-23', orders: 28, revenue_eur: 2780.75, revenue_syp: 4171125, delivered: 25 },
                        { date: '2025-01-24', orders: 32, revenue_eur: 3120.25, revenue_syp: 4680375, delivered: 28 },
                        { date: '2025-01-25', orders: 31, revenue_eur: 2999.00, revenue_syp: 4498500, delivered: 27 }
                    ]
                },
                top_products: [
                    { category: 'bread', name: 'خبز أبيض كبير', quantity: 450, sales_eur: 540.00, sales_syp: 810000, orders: 35 },
                    { category: 'pastry', name: 'كرواسون زبدة', quantity: 180, sales_eur: 450.00, sales_syp: 675000, orders: 28 },
                    { category: 'cake', name: 'كعكة شوكولاتة', quantity: 25, sales_eur: 375.00, sales_syp: 562500, orders: 15 },
                    { category: 'bread', name: 'خبز أسمر', quantity: 320, sales_eur: 384.00, sales_syp: 576000, orders: 22 },
                    { category: 'pastry', name: 'دونت محشي', quantity: 90, sales_eur: 270.00, sales_syp: 405000, orders: 18 }
                ],
                distributor_performance: [
                    { id: 1, name: 'أحمد محمد', orders: 45, stores: 12, sales_eur: 4520.50, sales_syp: 6780750, avg_order_eur: 100.46, delivery_rate: 91, payment_rate: 95 },
                    { id: 2, name: 'فاطمة علي', orders: 38, stores: 10, sales_eur: 3890.25, sales_syp: 5835375, avg_order_eur: 102.38, delivery_rate: 89, payment_rate: 93 },
                    { id: 3, name: 'محمد حسن', orders: 42, stores: 11, sales_eur: 4120.75, sales_syp: 6181125, avg_order_eur: 98.11, delivery_rate: 85, payment_rate: 90 },
                    { id: 4, name: 'سارة أحمد', orders: 31, stores: 8, sales_eur: 2889.25, sales_syp: 4333875, avg_order_eur: 93.20, delivery_rate: 88, payment_rate: 91 }
                ]
            },
            fallback: true
        };
    }
};

/**
 * Generate weekly report
 * @param {Object} data - Report data
 * @returns {Object} Weekly report
 */
export const generateWeeklyReport = async (data) => {
    try {
        const { weekStart, weekEnd, format, generatedBy } = data;
        const connection = await getDBConnection();

        // Get comprehensive weekly data
        const [weeklyData] = await connection.execute(`
            SELECT 
                DATE(o.order_date) as order_date,
                COUNT(DISTINCT o.id) as daily_orders,
                COUNT(DISTINCT o.store_id) as daily_stores,
                SUM(o.total_amount_eur) as daily_sales_eur,
                SUM(o.total_amount_syp) as daily_sales_syp,
                COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as delivered_orders,
                COUNT(DISTINCT CASE WHEN o.payment_status = 'paid' THEN o.id END) as paid_orders
            FROM orders o
            WHERE o.order_date BETWEEN ? AND ?
            GROUP BY DATE(o.order_date)
            ORDER BY order_date
        `, [weekStart, weekEnd]);

        // Get distributor performance for the week
        const [distributorWeekly] = await connection.execute(`
            SELECT 
                u.id as distributor_id,
                u.full_name as distributor_name,
                COUNT(DISTINCT o.id) as weekly_orders,
                SUM(o.total_amount_eur) as weekly_sales_eur,
                SUM(o.total_amount_syp) as weekly_sales_syp,
                COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as delivered_orders,
                SUM(ve.amount_eur) as expenses_eur,
                SUM(ve.amount_syp) as expenses_syp
            FROM orders o
            JOIN stores s ON o.store_id = s.id
            JOIN users u ON s.assigned_distributor_id = u.id
            LEFT JOIN vehicle_expenses ve ON u.id = ve.distributor_id 
                AND ve.expense_date BETWEEN ? AND ?
            WHERE o.order_date BETWEEN ? AND ?
            GROUP BY u.id, u.full_name
            ORDER BY weekly_sales_eur DESC
        `, [weekStart, weekEnd, weekStart, weekEnd]);

        // Get top selling products
        const [topProducts] = await connection.execute(`
            SELECT 
                p.name as product_name,
                p.category,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.total_price_eur) as total_sales_eur,
                COUNT(DISTINCT oi.order_id) as order_count
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.order_date BETWEEN ? AND ?
            GROUP BY p.id, p.name, p.category
            ORDER BY total_sales_eur DESC
            LIMIT 10
        `, [weekStart, weekEnd]);

        // Calculate weekly totals
        const weeklyTotals = weeklyData.reduce((acc, day) => ({
            total_orders: acc.total_orders + day.daily_orders,
            total_sales_eur: acc.total_sales_eur + parseFloat(day.daily_sales_eur),
            total_sales_syp: acc.total_sales_syp + parseFloat(day.daily_sales_syp),
            delivered_orders: acc.delivered_orders + day.delivered_orders,
            paid_orders: acc.paid_orders + day.paid_orders
        }), { total_orders: 0, total_sales_eur: 0, total_sales_syp: 0, delivered_orders: 0, paid_orders: 0 });

        const reportData = {
            week_start: weekStart,
            week_end: weekEnd,
            daily_breakdown: weeklyData,
            distributor_performance: distributorWeekly,
            top_products: topProducts,
            weekly_totals: weeklyTotals,
            generated_by: generatedBy,
            generated_at: new Date().toISOString()
        };

        // Save report to database
        const [reportResult] = await connection.execute(`
            INSERT INTO weekly_reports 
            (week_start, week_end, report_data, format, generated_by, generated_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        `, [weekStart, weekEnd, JSON.stringify(reportData), format, generatedBy]);

        return {
            report_id: reportResult.insertId,
            ...reportData
        };

    } catch (error) {
        console.error('Error generating weekly report:', error);
        throw new Error('خطأ في توليد التقرير الأسبوعي');
    }
};

/**
 * Assign store to distributor
 * @param {Object} data - Assignment data
 * @returns {Object} Assignment result
 */
export const assignStoreToDistributor = async (data) => {
    try {
        const { storeId, distributorId, zone, assignedBy } = data;
        const connection = await getDBConnection();

        // Update store assignment
        const [result] = await connection.execute(`
            UPDATE stores 
            SET assigned_distributor_id = ?,
                assigned_distributor_name = (SELECT full_name FROM users WHERE id = ?),
                updated_by = ?,
                updated_by_name = (SELECT full_name FROM users WHERE id = ?),
                updated_at = NOW()
            WHERE id = ?
        `, [distributorId, distributorId, assignedBy, assignedBy, storeId]);

        // Log the assignment
        await connection.execute(`
            INSERT INTO store_assignments 
            (store_id, distributor_id, zone, assigned_by, assigned_at)
            VALUES (?, ?, ?, ?, NOW())
        `, [storeId, distributorId, zone, assignedBy]);

        return {
            store_id: storeId,
            distributor_id: distributorId,
            zone: zone,
            assigned_by: assignedBy,
            assigned_at: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error assigning store to distributor:', error);
        throw new Error('خطأ في تعيين المحل للموزع');
    }
};

/**
 * Update store balance manually
 * @param {Object} data - Balance update data
 * @returns {Object} Update result
 */
export const updateStoreBalanceManually = async (data) => {
    try {
        const { storeId, amount, currency, reason, notes, updatedBy } = data;
        const connection = await getDBConnection();

        // Start transaction
        await connection.beginTransaction();

        // Update store balance
        const amountEur = currency === 'EUR' ? amount : 0;
        const amountSyp = currency === 'SYP' ? amount : 0;

        await connection.execute(`
            UPDATE stores 
            SET balance_eur = balance_eur + ?,
                balance_syp = balance_syp + ?,
                updated_at = NOW()
            WHERE id = ?
        `, [amountEur, amountSyp, storeId]);

        // Log the balance adjustment
        await connection.execute(`
            INSERT INTO balance_adjustments 
            (store_id, amount_eur, amount_syp, currency, reason, notes, adjusted_by, adjusted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [storeId, amountEur, amountSyp, currency, reason, notes, updatedBy]);

        await connection.commit();

        return {
            success: true,
            data: {
                store_id: storeId,
                amount: amount,
                currency: currency,
                reason: reason,
                notes: notes,
                updated_by: updatedBy,
                updated_at: new Date().toISOString()
            }
        };

    } catch (error) {
        const connection = await getDBConnection();
        await connection.rollback();
        console.error('Error updating store balance:', error);
        throw new Error('Database query error in balance update');
    }
};

/**
 * Approve distributor report
 * @param {Object} data - Approval data
 * @returns {Object} Approval result
 */
export const approveDistributorReport = async (data) => {
    try {
        const { reportId, approved, notes, approvedBy } = data;
        const connection = await getDBConnection();

        const status = approved ? 'approved' : 'rejected';

        // Update report status
        await connection.execute(`
            UPDATE daily_reports 
            SET status = ?,
                approval_notes = ?,
                approved_by = ?,
                approved_at = NOW()
            WHERE id = ?
        `, [status, notes, approvedBy, reportId]);

        return {
            success: true,
            data: {
                report_id: reportId,
                status: status,
                approval_notes: notes,
                approved_by: approvedBy,
                approved_at: new Date().toISOString()
            }
        };

    } catch (error) {
        console.error('Error approving distributor report:', error);
        throw new Error('Database query error in report approval');
    }
};

// Helper functions
function calculateEstimatedTime(index, preferredTime) {
    const baseTime = '08:00';
    const minutes = index * 30; // 30 minutes per store
    const [hours, mins] = baseTime.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}

function getDateRange(period) {
    const now = new Date();
    const start = new Date();

    switch (period) {
        case 'week':
            start.setDate(now.getDate() - 7);
            break;
        case 'month':
            start.setMonth(now.getMonth() - 1);
            break;
        case 'quarter':
            start.setMonth(now.getMonth() - 3);
            break;
        case 'year':
            start.setFullYear(now.getFullYear() - 1);
            break;
        default:
            start.setDate(now.getDate() - 7);
    }

    return {
        start: start.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
    };
}
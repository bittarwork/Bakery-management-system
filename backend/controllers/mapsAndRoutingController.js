import mysql from 'mysql2/promise';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Database connection factory
let db = null;

const getDBConnection = async () => {
    if (!db) {
        try {
            db = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'bakery_db',
                connectTimeout: 10000,
                acquireTimeout: 10000,
                timeout: 10000
            });
        } catch (error) {
            console.error('Database connection failed in mapsAndRoutingController:', error.message);
            throw new Error('Database connection unavailable');
        }
    }
    return db;
};

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// ==========================================
// 🗺️ MAPS AND ROUTING SYSTEM (نظام الخرائط والمسارات)
// ==========================================

/**
 * Calculate optimal route for distributor
 * @param {number} distributorId - Distributor ID
 * @param {Array} storeLocations - Array of store locations
 * @param {Object} options - Route optimization options
 * @returns {Object} Optimized route
 */
export const calculateOptimalRoute = async (distributorId, storeLocations, options = {}) => {
    try {
        const {
            startLocation = { lat: 50.8503, lng: 4.3517 }, // Default bakery location
            optimizeFor = 'time', // 'time' or 'distance'
            avoidTolls = false,
            avoidHighways = false
        } = options;

        // Validate inputs
        if (!storeLocations || storeLocations.length === 0) {
            throw new Error('مواقع المحلات مطلوبة');
        }

        // Get store details with GPS coordinates
        const storeIds = storeLocations.map(loc => loc.store_id);
        const [storeDetails] = await db.execute(`
            SELECT 
                id,
                name,
                address,
                gps_coordinates,
                preferred_delivery_time,
                special_instructions
            FROM stores 
            WHERE id IN (${storeIds.map(() => '?').join(',')})
            AND status = 'active'
        `, storeIds);

        // Prepare waypoints for Google Maps API
        const waypoints = storeDetails.map(store => {
            const coords = store.gps_coordinates ? JSON.parse(store.gps_coordinates) : null;
            return {
                store_id: store.id,
                store_name: store.name,
                address: store.address,
                location: coords || { lat: 0, lng: 0 },
                preferred_time: store.preferred_delivery_time,
                special_instructions: store.special_instructions
            };
        }).filter(wp => wp.location.lat !== 0 && wp.location.lng !== 0);

        if (waypoints.length === 0) {
            throw new Error('لم يتم العثور على إحداثيات صالحة للمحلات');
        }

        // Use simple distance calculation if Google Maps API is not available
        let optimizedRoute;
        if (GOOGLE_MAPS_API_KEY) {
            optimizedRoute = await optimizeRouteWithGoogleMaps(startLocation, waypoints, {
                optimizeFor,
                avoidTolls,
                avoidHighways
            });
        } else {
            optimizedRoute = await optimizeRouteSimple(startLocation, waypoints);
        }

        // Save route to database
        const routeId = await saveRouteToDatabase(distributorId, optimizedRoute);

        return {
            route_id: routeId,
            distributor_id: distributorId,
            start_location: startLocation,
            total_stops: waypoints.length,
            estimated_duration: optimizedRoute.total_duration,
            estimated_distance: optimizedRoute.total_distance,
            optimized_order: optimizedRoute.waypoints,
            route_polyline: optimizedRoute.polyline,
            created_at: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error calculating optimal route:', error);
        throw new Error('خطأ في حساب المسار الأمثل: ' + error.message);
    }
};

/**
 * Optimize route using Google Maps API
 * @param {Object} startLocation - Starting location
 * @param {Array} waypoints - Waypoints to visit
 * @param {Object} options - Route options
 * @returns {Object} Optimized route
 */
async function optimizeRouteWithGoogleMaps(startLocation, waypoints, options) {
    try {
        // Prepare waypoints string for Google Maps API
        const waypointsStr = waypoints.map(wp =>
            `${wp.location.lat},${wp.location.lng}`
        ).join('|');

        const params = {
            origin: `${startLocation.lat},${startLocation.lng}`,
            destination: `${startLocation.lat},${startLocation.lng}`, // Return to start
            waypoints: `optimize:true|${waypointsStr}`,
            mode: 'driving',
            language: 'en',
            key: GOOGLE_MAPS_API_KEY
        };

        if (options.avoidTolls) params.avoid = 'tolls';
        if (options.avoidHighways) params.avoid = (params.avoid ? params.avoid + '|' : '') + 'highways';

        const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', { params });

        if (response.data.status !== 'OK') {
            throw new Error(`Google Maps API error: ${response.data.status}`);
        }

        const route = response.data.routes[0];
        const optimizedOrder = route.waypoint_order || [];

        // Reorder waypoints according to optimization
        const optimizedWaypoints = optimizedOrder.map((index, order) => ({
            ...waypoints[index],
            order: order + 1,
            estimated_arrival: calculateEstimatedArrival(route.legs, order)
        }));

        return {
            waypoints: optimizedWaypoints,
            total_duration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
            total_distance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
            polyline: route.overview_polyline.points,
            bounds: route.bounds
        };

    } catch (error) {
        console.error('Error with Google Maps API:', error);
        // Fallback to simple optimization
        return optimizeRouteSimple(startLocation, waypoints);
    }
}

/**
 * Simple route optimization using distance calculation
 * @param {Object} startLocation - Starting location
 * @param {Array} waypoints - Waypoints to visit
 * @returns {Object} Optimized route
 */
async function optimizeRouteSimple(startLocation, waypoints) {
    try {
        // Nearest neighbor algorithm for simple optimization
        const optimizedWaypoints = [];
        const remainingWaypoints = [...waypoints];
        let currentLocation = startLocation;

        while (remainingWaypoints.length > 0) {
            let nearestIndex = 0;
            let nearestDistance = calculateDistance(currentLocation, remainingWaypoints[0].location);

            // Find nearest waypoint
            for (let i = 1; i < remainingWaypoints.length; i++) {
                const distance = calculateDistance(currentLocation, remainingWaypoints[i].location);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = i;
                }
            }

            // Add nearest waypoint to optimized route
            const nearestWaypoint = remainingWaypoints.splice(nearestIndex, 1)[0];
            optimizedWaypoints.push({
                ...nearestWaypoint,
                order: optimizedWaypoints.length + 1,
                distance_from_previous: nearestDistance
            });

            currentLocation = nearestWaypoint.location;
        }

        const totalDistance = optimizedWaypoints.reduce((sum, wp) => sum + (wp.distance_from_previous || 0), 0);
        const estimatedDuration = totalDistance * 120; // Rough estimate: 120 seconds per km

        return {
            waypoints: optimizedWaypoints,
            total_duration: estimatedDuration,
            total_distance: totalDistance,
            polyline: null, // Simple optimization doesn't provide polyline
            bounds: calculateBounds(optimizedWaypoints)
        };

    } catch (error) {
        console.error('Error in simple route optimization:', error);
        throw error;
    }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {Object} point1 - First coordinate
 * @param {Object} point2 - Second coordinate
 * @returns {number} Distance in kilometers
 */
function calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(point2.lat - point1.lat);
    const dLng = toRadians(point2.lng - point1.lng);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate estimated arrival time
 * @param {Array} legs - Route legs from Google Maps
 * @param {number} waypointIndex - Index of waypoint
 * @returns {string} Estimated arrival time
 */
function calculateEstimatedArrival(legs, waypointIndex) {
    const now = new Date();
    let totalSeconds = 0;

    for (let i = 0; i <= waypointIndex; i++) {
        if (legs[i]) {
            totalSeconds += legs[i].duration.value;
        }
    }

    const arrivalTime = new Date(now.getTime() + totalSeconds * 1000);
    return arrivalTime.toISOString();
}

/**
 * Calculate bounds for waypoints
 * @param {Array} waypoints - Waypoints array
 * @returns {Object} Bounds object
 */
function calculateBounds(waypoints) {
    if (waypoints.length === 0) return null;

    const lats = waypoints.map(wp => wp.location.lat);
    const lngs = waypoints.map(wp => wp.location.lng);

    return {
        northeast: { lat: Math.max(...lats), lng: Math.max(...lngs) },
        southwest: { lat: Math.min(...lats), lng: Math.min(...lngs) }
    };
}

/**
 * Save route to database
 * @param {number} distributorId - Distributor ID
 * @param {Object} routeData - Route data
 * @returns {number} Route ID
 */
async function saveRouteToDatabase(distributorId, routeData) {
    try {
        const [result] = await db.execute(`
            INSERT INTO distribution_routes 
            (distributor_id, route_data, total_distance, total_duration, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `, [
            distributorId,
            JSON.stringify(routeData),
            routeData.total_distance,
            routeData.total_duration
        ]);

        return result.insertId;

    } catch (error) {
        console.error('Error saving route to database:', error);
        throw error;
    }
}

/**
 * Track distributor location
 * @param {number} distributorId - Distributor ID
 * @param {Object} locationData - Location data
 * @returns {Object} Tracking result
 */
export const trackDistributorLocation = async (distributorId, locationData) => {
    try {
        const {
            latitude,
            longitude,
            accuracy,
            speed,
            heading,
            timestamp = new Date().toISOString()
        } = locationData;

        // Validate coordinates
        if (!latitude || !longitude || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
            throw new Error('إحداثيات غير صالحة');
        }

        // Get address from coordinates (reverse geocoding)
        let address = null;
        if (GOOGLE_MAPS_API_KEY) {
            try {
                const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                    params: {
                        latlng: `${latitude},${longitude}`,
                        key: GOOGLE_MAPS_API_KEY,
                        language: 'en'
                    }
                });

                if (response.data.status === 'OK' && response.data.results.length > 0) {
                    address = response.data.results[0].formatted_address;
                }
            } catch (error) {
                console.warn('Reverse geocoding failed:', error.message);
            }
        }

        // Insert location tracking record
        const [result] = await db.execute(`
            INSERT INTO location_tracking 
            (distributor_id, latitude, longitude, accuracy, speed, heading, address, tracked_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [distributorId, latitude, longitude, accuracy, speed, heading, address, timestamp]);

        // Update distributor's current location
        await db.execute(`
            UPDATE users 
            SET current_location = JSON_OBJECT('lat', ?, 'lng', ?, 'updated_at', ?)
            WHERE id = ? AND role = 'distributor'
        `, [latitude, longitude, timestamp, distributorId]);

        // Check if distributor is near any assigned stores
        const nearbyStores = await checkNearbyStores(distributorId, latitude, longitude);

        return {
            tracking_id: result.insertId,
            distributor_id: distributorId,
            location: { latitude, longitude },
            accuracy: accuracy,
            address: address,
            nearby_stores: nearbyStores,
            tracked_at: timestamp
        };

    } catch (error) {
        console.error('Error tracking distributor location:', error);
        throw new Error('خطأ في تتبع موقع الموزع: ' + error.message);
    }
};

/**
 * Check for nearby stores
 * @param {number} distributorId - Distributor ID
 * @param {number} latitude - Current latitude
 * @param {number} longitude - Current longitude
 * @returns {Array} Nearby stores
 */
async function checkNearbyStores(distributorId, latitude, longitude) {
    try {
        const [stores] = await db.execute(`
            SELECT 
                id,
                name,
                address,
                gps_coordinates,
                phone,
                preferred_delivery_time
            FROM stores 
            WHERE assigned_distributor_id = ? 
            AND status = 'active'
            AND gps_coordinates IS NOT NULL
        `, [distributorId]);

        const nearbyStores = [];
        const proximityRadius = 0.5; // 500 meters

        for (const store of stores) {
            const storeCoords = JSON.parse(store.gps_coordinates);
            const distance = calculateDistance(
                { lat: latitude, lng: longitude },
                { lat: storeCoords.lat, lng: storeCoords.lng }
            );

            if (distance <= proximityRadius) {
                nearbyStores.push({
                    store_id: store.id,
                    store_name: store.name,
                    address: store.address,
                    distance_km: distance.toFixed(3),
                    phone: store.phone,
                    preferred_delivery_time: store.preferred_delivery_time
                });
            }
        }

        return nearbyStores;

    } catch (error) {
        console.error('Error checking nearby stores:', error);
        return [];
    }
}

/**
 * Get live distributor locations
 * @param {Array} distributorIds - Array of distributor IDs (optional)
 * @returns {Object} Live locations
 */
export const getLiveDistributorLocations = async (distributorIds = null) => {
    try {
        let whereCondition = 'WHERE u.role = "distributor" AND u.status = "active"';
        const params = [];

        if (distributorIds && distributorIds.length > 0) {
            whereCondition += ` AND u.id IN (${distributorIds.map(() => '?').join(',')})`;
            params.push(...distributorIds);
        }

        // Get latest location for each distributor
        const [locations] = await db.execute(`
            SELECT 
                u.id as distributor_id,
                u.full_name as distributor_name,
                u.phone,
                u.current_location,
                lt.latitude,
                lt.longitude,
                lt.accuracy,
                lt.speed,
                lt.heading,
                lt.address,
                lt.tracked_at,
                TIMESTAMPDIFF(MINUTE, lt.tracked_at, NOW()) as minutes_ago
            FROM users u
            LEFT JOIN location_tracking lt ON u.id = lt.distributor_id
            AND lt.id = (
                SELECT id FROM location_tracking lt2 
                WHERE lt2.distributor_id = u.id 
                ORDER BY lt2.tracked_at DESC 
                LIMIT 1
            )
            ${whereCondition}
            ORDER BY u.full_name
        `, params);

        // Get current delivery status for each distributor
        const distributorIds_array = locations.map(loc => loc.distributor_id);
        let deliveryStatus = [];

        if (distributorIds_array.length > 0) {
            const [statusRows] = await db.execute(`
                SELECT 
                    ds.distributor_id,
                    ds.status as schedule_status,
                    COUNT(DISTINCT o.id) as total_orders,
                    COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as completed_orders
                FROM distribution_schedules ds
                LEFT JOIN orders o ON DATE(o.order_date) = ds.schedule_date
                AND o.store_id IN (
                    SELECT id FROM stores WHERE assigned_distributor_id = ds.distributor_id
                )
                WHERE ds.schedule_date = CURDATE()
                AND ds.distributor_id IN (${distributorIds_array.map(() => '?').join(',')})
                GROUP BY ds.distributor_id, ds.status
            `, distributorIds_array);

            deliveryStatus = statusRows;
        }

        // Combine location and status data
        const enrichedLocations = locations.map(location => {
            const status = deliveryStatus.find(s => s.distributor_id === location.distributor_id);
            return {
                ...location,
                current_location: location.current_location ? JSON.parse(location.current_location) : null,
                delivery_status: status ? {
                    schedule_status: status.schedule_status,
                    total_orders: status.total_orders,
                    completed_orders: status.completed_orders,
                    completion_percentage: status.total_orders > 0 ?
                        (status.completed_orders / status.total_orders * 100).toFixed(1) : 0
                } : null
            };
        });

        return {
            total_distributors: enrichedLocations.length,
            active_distributors: enrichedLocations.filter(loc => loc.minutes_ago <= 30).length,
            locations: enrichedLocations,
            last_updated: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error getting live distributor locations:', error);
        throw new Error('خطأ في جلب مواقع الموزعين: ' + error.message);
    }
};

/**
 * Get route history
 * @param {number} distributorId - Distributor ID
 * @param {Object} filters - History filters
 * @returns {Object} Route history
 */
export const getRouteHistory = async (distributorId, filters = {}) => {
    try {
        const {
            dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dateTo = new Date().toISOString().split('T')[0],
            page = 1,
            limit = 10
        } = filters;

        const offset = (page - 1) * limit;

        // Get route history
        const [routes] = await db.execute(`
            SELECT 
                dr.id,
                dr.created_at,
                dr.route_data,
                dr.total_distance,
                dr.total_duration,
                ds.schedule_date,
                ds.status as schedule_status,
                COUNT(DISTINCT o.id) as orders_on_route
            FROM distribution_routes dr
            LEFT JOIN distribution_schedules ds ON dr.distributor_id = ds.distributor_id 
                AND DATE(dr.created_at) = ds.schedule_date
            LEFT JOIN orders o ON ds.schedule_date = o.order_date
                AND o.store_id IN (
                    SELECT id FROM stores WHERE assigned_distributor_id = dr.distributor_id
                )
            WHERE dr.distributor_id = ?
            AND DATE(dr.created_at) BETWEEN ? AND ?
            GROUP BY dr.id, dr.created_at, dr.route_data, dr.total_distance, dr.total_duration, ds.schedule_date, ds.status
            ORDER BY dr.created_at DESC
            LIMIT ? OFFSET ?
        `, [distributorId, dateFrom, dateTo, limit, offset]);

        // Get total count
        const [countResult] = await db.execute(`
            SELECT COUNT(*) as total
            FROM distribution_routes dr
            WHERE dr.distributor_id = ?
            AND DATE(dr.created_at) BETWEEN ? AND ?
        `, [distributorId, dateFrom, dateTo]);

        // Parse route data
        const enrichedRoutes = routes.map(route => ({
            ...route,
            route_data: route.route_data ? JSON.parse(route.route_data) : null,
            duration_formatted: formatDuration(route.total_duration),
            distance_formatted: formatDistance(route.total_distance)
        }));

        return {
            routes: enrichedRoutes,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(countResult[0].total / limit),
                total_items: countResult[0].total,
                items_per_page: limit
            },
            period: { from: dateFrom, to: dateTo }
        };

    } catch (error) {
        console.error('Error getting route history:', error);
        throw new Error('خطأ في جلب تاريخ المسارات: ' + error.message);
    }
};

/**
 * Generate route analytics
 * @param {number} distributorId - Distributor ID (optional)
 * @param {Object} filters - Analytics filters
 * @returns {Object} Route analytics
 */
export const generateRouteAnalytics = async (distributorId = null, filters = {}) => {
    try {
        const {
            dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dateTo = new Date().toISOString().split('T')[0]
        } = filters;

        let whereCondition = 'WHERE DATE(dr.created_at) BETWEEN ? AND ?';
        const params = [dateFrom, dateTo];

        if (distributorId) {
            whereCondition += ' AND dr.distributor_id = ?';
            params.push(distributorId);
        }

        // Get route statistics
        const [routeStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_routes,
                COUNT(DISTINCT dr.distributor_id) as active_distributors,
                AVG(dr.total_distance) as avg_distance,
                AVG(dr.total_duration) as avg_duration,
                SUM(dr.total_distance) as total_distance_covered,
                SUM(dr.total_duration) as total_time_spent,
                MIN(dr.total_distance) as min_distance,
                MAX(dr.total_distance) as max_distance
            FROM distribution_routes dr
            ${whereCondition}
        `, params);

        // Get daily route trends
        const [dailyTrends] = await db.execute(`
            SELECT 
                DATE(dr.created_at) as route_date,
                COUNT(*) as routes_created,
                AVG(dr.total_distance) as avg_distance,
                AVG(dr.total_duration) as avg_duration,
                COUNT(DISTINCT dr.distributor_id) as active_distributors
            FROM distribution_routes dr
            ${whereCondition}
            GROUP BY DATE(dr.created_at)
            ORDER BY route_date
        `, params);

        // Get distributor performance
        const [distributorPerformance] = await db.execute(`
            SELECT 
                u.id,
                u.full_name as distributor_name,
                COUNT(dr.id) as routes_created,
                AVG(dr.total_distance) as avg_distance,
                AVG(dr.total_duration) as avg_duration,
                SUM(dr.total_distance) as total_distance,
                MIN(dr.total_distance) as best_distance,
                MAX(dr.total_distance) as worst_distance
            FROM distribution_routes dr
            JOIN users u ON dr.distributor_id = u.id
            ${whereCondition}
            GROUP BY u.id, u.full_name
            ORDER BY total_distance DESC
        `, params);

        return {
            period: { from: dateFrom, to: dateTo },
            summary: {
                ...routeStats[0],
                avg_distance_formatted: formatDistance(routeStats[0].avg_distance),
                avg_duration_formatted: formatDuration(routeStats[0].avg_duration),
                total_distance_formatted: formatDistance(routeStats[0].total_distance_covered),
                total_time_formatted: formatDuration(routeStats[0].total_time_spent)
            },
            daily_trends: dailyTrends.map(trend => ({
                ...trend,
                avg_distance_formatted: formatDistance(trend.avg_distance),
                avg_duration_formatted: formatDuration(trend.avg_duration)
            })),
            distributor_performance: distributorPerformance.map(perf => ({
                ...perf,
                avg_distance_formatted: formatDistance(perf.avg_distance),
                avg_duration_formatted: formatDuration(perf.avg_duration),
                total_distance_formatted: formatDistance(perf.total_distance)
            })),
            generated_at: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error generating route analytics:', error);
        throw new Error('خطأ في توليد تحليلات المسارات: ' + error.message);
    }
};

// Helper functions
function formatDuration(seconds) {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function formatDistance(meters) {
    if (!meters) return '0km';
    const km = meters / 1000;
    return `${km.toFixed(2)}km`;
}

export {
    calculateOptimalRoute,
    trackDistributorLocation,
    getLiveDistributorLocations,
    getRouteHistory,
    generateRouteAnalytics
}; 
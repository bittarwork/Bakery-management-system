import axios from 'axios';
import db from '../config/database.js';

/**
 * Google Maps Service
 * Handles all Google Maps API operations
 */
class GoogleMapsService {

    constructor() {
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
        this.baseURL = 'https://maps.googleapis.com/maps/api';

        if (!this.apiKey) {
            console.warn('Warning: Google Maps API key not configured');
        }
    }

    /**
     * Get coordinates for an address
     * @param {string} address - Address to geocode
     * @returns {Object} Coordinates and address details
     */
    async geocodeAddress(address) {
        try {
            if (!this.apiKey) {
                throw new Error('Google Maps API key not configured');
            }

            const response = await axios.get(`${this.baseURL}/geocode/json`, {
                params: {
                    address: address,
                    key: this.apiKey,
                    language: 'ar'
                }
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Geocoding failed: ${response.data.status}`);
            }

            const result = response.data.results[0];
            return {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                formatted_address: result.formatted_address,
                place_id: result.place_id,
                address_components: result.address_components
            };

        } catch (error) {
            console.error('Error geocoding address:', error);
            throw new Error('فشل في تحديد الموقع الجغرافي');
        }
    }

    /**
     * Get address from coordinates
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Object} Address details
     */
    async reverseGeocode(lat, lng) {
        try {
            if (!this.apiKey) {
                throw new Error('Google Maps API key not configured');
            }

            const response = await axios.get(`${this.baseURL}/geocode/json`, {
                params: {
                    latlng: `${lat},${lng}`,
                    key: this.apiKey,
                    language: 'ar'
                }
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Reverse geocoding failed: ${response.data.status}`);
            }

            const result = response.data.results[0];
            return {
                formatted_address: result.formatted_address,
                address_components: result.address_components,
                place_id: result.place_id
            };

        } catch (error) {
            console.error('Error reverse geocoding:', error);
            throw new Error('فشل في تحديد العنوان');
        }
    }

    /**
     * Calculate distance between two points
     * @param {Object} origin - Origin coordinates {lat, lng}
     * @param {Object} destination - Destination coordinates {lat, lng}
     * @returns {Object} Distance and duration
     */
    async calculateDistance(origin, destination) {
        try {
            if (!this.apiKey) {
                throw new Error('Google Maps API key not configured');
            }

            const response = await axios.get(`${this.baseURL}/distancematrix/json`, {
                params: {
                    origins: `${origin.lat},${origin.lng}`,
                    destinations: `${destination.lat},${destination.lng}`,
                    key: this.apiKey,
                    units: 'metric',
                    language: 'ar'
                }
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Distance calculation failed: ${response.data.status}`);
            }

            const element = response.data.rows[0].elements[0];
            if (element.status !== 'OK') {
                throw new Error(`Route not found: ${element.status}`);
            }

            return {
                distance: {
                    text: element.distance.text,
                    value: element.distance.value // in meters
                },
                duration: {
                    text: element.duration.text,
                    value: element.duration.value // in seconds
                }
            };

        } catch (error) {
            console.error('Error calculating distance:', error);
            throw new Error('فشل في حساب المسافة');
        }
    }

    /**
     * Get optimized route for multiple waypoints
     * @param {Object} start - Starting point {lat, lng}
     * @param {Object} end - Ending point {lat, lng}
     * @param {Array} waypoints - Array of waypoints [{lat, lng, id}]
     * @returns {Object} Optimized route
     */
    async getOptimizedRoute(start, end, waypoints) {
        try {
            if (!this.apiKey) {
                throw new Error('Google Maps API key not configured');
            }

            // Convert waypoints to string format
            const waypointStr = waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|');

            const response = await axios.get(`${this.baseURL}/directions/json`, {
                params: {
                    origin: `${start.lat},${start.lng}`,
                    destination: `${end.lat},${end.lng}`,
                    waypoints: `optimize:true|${waypointStr}`,
                    key: this.apiKey,
                    language: 'ar'
                }
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Route optimization failed: ${response.data.status}`);
            }

            const route = response.data.routes[0];
            const optimizedOrder = route.waypoint_order;

            return {
                overview_polyline: route.overview_polyline.points,
                total_distance: route.legs.reduce((total, leg) => total + leg.distance.value, 0),
                total_duration: route.legs.reduce((total, leg) => total + leg.duration.value, 0),
                optimized_order: optimizedOrder,
                legs: route.legs.map((leg, index) => ({
                    start_location: leg.start_location,
                    end_location: leg.end_location,
                    distance: leg.distance,
                    duration: leg.duration,
                    steps: leg.steps
                })),
                waypoints_optimized: optimizedOrder.map(index => waypoints[index])
            };

        } catch (error) {
            console.error('Error getting optimized route:', error);
            throw new Error('فشل في تحسين المسار');
        }
    }

    /**
     * Get route between two points
     * @param {Object} origin - Origin coordinates {lat, lng}
     * @param {Object} destination - Destination coordinates {lat, lng}
     * @returns {Object} Route details
     */
    async getRoute(origin, destination) {
        try {
            if (!this.apiKey) {
                throw new Error('Google Maps API key not configured');
            }

            const response = await axios.get(`${this.baseURL}/directions/json`, {
                params: {
                    origin: `${origin.lat},${origin.lng}`,
                    destination: `${destination.lat},${destination.lng}`,
                    key: this.apiKey,
                    language: 'ar'
                }
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Route calculation failed: ${response.data.status}`);
            }

            const route = response.data.routes[0];
            const leg = route.legs[0];

            return {
                overview_polyline: route.overview_polyline.points,
                distance: leg.distance,
                duration: leg.duration,
                start_location: leg.start_location,
                end_location: leg.end_location,
                steps: leg.steps
            };

        } catch (error) {
            console.error('Error getting route:', error);
            throw new Error('فشل في حساب المسار');
        }
    }

    /**
     * Find nearby places
     * @param {Object} location - Center point {lat, lng}
     * @param {string} type - Place type (e.g., 'gas_station', 'restaurant')
     * @param {number} radius - Search radius in meters
     * @returns {Array} Nearby places
     */
    async findNearbyPlaces(location, type, radius = 1000) {
        try {
            if (!this.apiKey) {
                throw new Error('Google Maps API key not configured');
            }

            const response = await axios.get(`${this.baseURL}/place/nearbysearch/json`, {
                params: {
                    location: `${location.lat},${location.lng}`,
                    radius: radius,
                    type: type,
                    key: this.apiKey,
                    language: 'ar'
                }
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Nearby search failed: ${response.data.status}`);
            }

            return response.data.results.map(place => ({
                place_id: place.place_id,
                name: place.name,
                vicinity: place.vicinity,
                location: place.geometry.location,
                rating: place.rating,
                types: place.types,
                opening_hours: place.opening_hours
            }));

        } catch (error) {
            console.error('Error finding nearby places:', error);
            throw new Error('فشل في البحث عن الأماكن المجاورة');
        }
    }

    /**
     * Get traffic information for a route
     * @param {Object} origin - Origin coordinates {lat, lng}
     * @param {Object} destination - Destination coordinates {lat, lng}
     * @returns {Object} Traffic information
     */
    async getTrafficInfo(origin, destination) {
        try {
            if (!this.apiKey) {
                throw new Error('Google Maps API key not configured');
            }

            const response = await axios.get(`${this.baseURL}/directions/json`, {
                params: {
                    origin: `${origin.lat},${origin.lng}`,
                    destination: `${destination.lat},${destination.lng}`,
                    departure_time: 'now',
                    traffic_model: 'best_guess',
                    key: this.apiKey,
                    language: 'ar'
                }
            });

            if (response.data.status !== 'OK') {
                throw new Error(`Traffic info failed: ${response.data.status}`);
            }

            const route = response.data.routes[0];
            const leg = route.legs[0];

            return {
                duration: leg.duration,
                duration_in_traffic: leg.duration_in_traffic,
                traffic_delay: leg.duration_in_traffic ?
                    leg.duration_in_traffic.value - leg.duration.value : 0,
                traffic_condition: this.getTrafficCondition(
                    leg.duration_in_traffic?.value || leg.duration.value,
                    leg.duration.value
                )
            };

        } catch (error) {
            console.error('Error getting traffic info:', error);
            throw new Error('فشل في جلب معلومات الحركة المرورية');
        }
    }

    /**
     * Determine traffic condition based on delay
     * @param {number} durationInTraffic - Duration with traffic (seconds)
     * @param {number} normalDuration - Normal duration (seconds)
     * @returns {string} Traffic condition
     */
    getTrafficCondition(durationInTraffic, normalDuration) {
        const delayRatio = durationInTraffic / normalDuration;

        if (delayRatio < 1.1) return 'light';
        if (delayRatio < 1.3) return 'moderate';
        if (delayRatio < 1.6) return 'heavy';
        return 'severe';
    }

    /**
     * Update store coordinates
     * @param {number} storeId - Store ID
     * @param {string} address - Store address
     * @returns {Object} Updated coordinates
     */
    async updateStoreCoordinates(storeId, address) {
        try {
            const coordinates = await this.geocodeAddress(address);

            await db.execute(`
                UPDATE stores 
                SET latitude = ?, longitude = ?, updated_at = NOW()
                WHERE id = ?
            `, [coordinates.lat, coordinates.lng, storeId]);

            return coordinates;

        } catch (error) {
            console.error('Error updating store coordinates:', error);
            throw new Error('فشل في تحديث إحداثيات المحل');
        }
    }

    /**
     * Get optimal delivery route for distributor
     * @param {number} distributorId - Distributor ID
     * @param {string} date - Delivery date
     * @returns {Object} Optimal route
     */
    async getDeliveryRoute(distributorId, date) {
        try {
            // Get distributor's schedule for the date
            const [schedule] = await db.execute(`
                SELECT 
                    ds.id as schedule_id,
                    ds.start_location_lat,
                    ds.start_location_lng,
                    ds.end_location_lat,
                    ds.end_location_lng,
                    GROUP_CONCAT(
                        CONCAT(s.id, ':', s.latitude, ':', s.longitude, ':', s.name)
                        ORDER BY dsr.sequence_order
                    ) as stores_data
                FROM distribution_schedules ds
                LEFT JOIN distribution_schedule_routes dsr ON ds.id = dsr.schedule_id
                LEFT JOIN stores s ON dsr.store_id = s.id
                WHERE ds.distributor_id = ? AND DATE(ds.scheduled_date) = ?
                GROUP BY ds.id
            `, [distributorId, date]);

            if (!schedule || schedule.length === 0) {
                throw new Error('لا توجد جدولة توزيع لهذا التاريخ');
            }

            const scheduleData = schedule[0];
            const startPoint = {
                lat: scheduleData.start_location_lat,
                lng: scheduleData.start_location_lng
            };
            const endPoint = {
                lat: scheduleData.end_location_lat,
                lng: scheduleData.end_location_lng
            };

            // Parse stores data
            const waypoints = [];
            if (scheduleData.stores_data) {
                const storesArray = scheduleData.stores_data.split(',');
                for (const storeData of storesArray) {
                    const [id, lat, lng, name] = storeData.split(':');
                    waypoints.push({
                        id: parseInt(id),
                        lat: parseFloat(lat),
                        lng: parseFloat(lng),
                        name: name
                    });
                }
            }

            // Get optimized route
            const optimizedRoute = await this.getOptimizedRoute(startPoint, endPoint, waypoints);

            // Save optimized route to database
            await db.execute(`
                UPDATE distribution_schedules 
                SET 
                    route_polyline = ?,
                    total_distance = ?,
                    estimated_duration = ?,
                    is_optimized = TRUE,
                    updated_at = NOW()
                WHERE id = ?
            `, [
                optimizedRoute.overview_polyline,
                optimizedRoute.total_distance,
                optimizedRoute.total_duration,
                scheduleData.schedule_id
            ]);

            return {
                schedule_id: scheduleData.schedule_id,
                start_point: startPoint,
                end_point: endPoint,
                optimized_route: optimizedRoute,
                stores_count: waypoints.length,
                total_distance_km: (optimizedRoute.total_distance / 1000).toFixed(2),
                estimated_duration_hours: (optimizedRoute.total_duration / 3600).toFixed(2)
            };

        } catch (error) {
            console.error('Error getting delivery route:', error);
            throw new Error('فشل في حساب مسار التوزيع');
        }
    }

    /**
     * Track distributor location
     * @param {number} distributorId - Distributor ID
     * @param {Object} location - Current location {lat, lng}
     * @param {string} status - Current status
     * @returns {Object} Tracking result
     */
    async trackDistributorLocation(distributorId, location, status = 'active') {
        try {
            // Save location to database
            await db.execute(`
                INSERT INTO location_tracking (
                    distributor_id, latitude, longitude, status, 
                    recorded_at, created_at
                ) VALUES (?, ?, ?, ?, NOW(), NOW())
            `, [distributorId, location.lat, location.lng, status]);

            // Update distributor's current location
            await db.execute(`
                UPDATE users 
                SET 
                    current_latitude = ?,
                    current_longitude = ?,
                    last_location_update = NOW()
                WHERE id = ? AND role = 'distributor'
            `, [location.lat, location.lng, distributorId]);

            return {
                success: true,
                location: location,
                status: status,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error tracking distributor location:', error);
            throw new Error('فشل في تتبع موقع الموزع');
        }
    }

    /**
     * Get real-time distributor locations
     * @param {string} date - Date to get locations for
     * @returns {Array} Distributor locations
     */
    async getDistributorLocations(date) {
        try {
            const [locations] = await db.execute(`
                SELECT 
                    u.id as distributor_id,
                    u.full_name as distributor_name,
                    u.phone,
                    u.current_latitude,
                    u.current_longitude,
                    u.last_location_update,
                    ds.id as schedule_id,
                    ds.status as schedule_status,
                    COUNT(DISTINCT dsr.store_id) as total_stores,
                    COUNT(DISTINCT CASE WHEN dr.status = 'delivered' THEN dr.store_id END) as completed_stores
                FROM users u
                LEFT JOIN distribution_schedules ds ON u.id = ds.distributor_id 
                    AND DATE(ds.scheduled_date) = ?
                LEFT JOIN distribution_schedule_routes dsr ON ds.id = dsr.schedule_id
                LEFT JOIN delivery_records dr ON dsr.store_id = dr.store_id 
                    AND DATE(dr.delivery_date) = ?
                WHERE u.role = 'distributor' AND u.status = 'active'
                GROUP BY u.id
            `, [date, date]);

            return locations.map(loc => ({
                distributor_id: loc.distributor_id,
                distributor_name: loc.distributor_name,
                phone: loc.phone,
                current_location: {
                    lat: loc.current_latitude,
                    lng: loc.current_longitude
                },
                last_update: loc.last_location_update,
                schedule_info: {
                    schedule_id: loc.schedule_id,
                    status: loc.schedule_status,
                    total_stores: loc.total_stores || 0,
                    completed_stores: loc.completed_stores || 0,
                    completion_rate: loc.total_stores > 0 ?
                        ((loc.completed_stores / loc.total_stores) * 100).toFixed(1) : 0
                }
            }));

        } catch (error) {
            console.error('Error getting distributor locations:', error);
            throw new Error('فشل في جلب مواقع الموزعين');
        }
    }

    /**
     * Calculate ETA for next delivery
     * @param {Object} currentLocation - Current location {lat, lng}
     * @param {Object} nextStoreLocation - Next store location {lat, lng}
     * @returns {Object} ETA information
     */
    async calculateDeliveryETA(currentLocation, nextStoreLocation) {
        try {
            const trafficInfo = await this.getTrafficInfo(currentLocation, nextStoreLocation);

            return {
                eta_minutes: Math.ceil(trafficInfo.duration_in_traffic?.value / 60) ||
                    Math.ceil(trafficInfo.duration.value / 60),
                distance_km: (await this.calculateDistance(currentLocation, nextStoreLocation)).distance.value / 1000,
                traffic_condition: trafficInfo.traffic_condition,
                estimated_arrival: new Date(Date.now() +
                    (trafficInfo.duration_in_traffic?.value || trafficInfo.duration.value) * 1000
                ).toISOString()
            };

        } catch (error) {
            console.error('Error calculating delivery ETA:', error);
            throw new Error('فشل في حساب وقت الوصول المتوقع');
        }
    }
}

// Create a singleton instance
const googleMapsService = new GoogleMapsService();

export default googleMapsService; 
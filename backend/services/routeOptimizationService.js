import axios from 'axios';
import logger from '../config/logger.js';
import DistributionSettings from '../models/DistributionSettings.js';
import { Store } from '../models/index.js';

class RouteOptimizationService {
    constructor() {
        this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
        this.baseUrl = 'https://maps.googleapis.com/maps/api';
        this.maxWaypoints = 25; // Google Maps API limit
    }

    /**
     * Optimize route for multiple destinations using Google Maps API
     * @param {Object} origin - Starting point {latitude, longitude}
     * @param {Array} destinations - Array of destinations [{latitude, longitude, store_id, ...}]
     * @param {Object} options - Optimization options
     * @returns {Promise<Object>} Optimized route data
     */
    async optimizeRoute(origin, destinations, options = {}) {
        try {
            if (!this.googleMapsApiKey) {
                logger.warn('Google Maps API key not configured, using basic optimization');
                return this.basicOptimization(origin, destinations);
            }

            const {
                travelMode = 'DRIVING',
                avoidTolls = false,
                avoidHighways = false,
                departureTime = null
            } = options;

            // Split into chunks if too many destinations
            if (destinations.length > this.maxWaypoints) {
                return this.optimizeLargeRoute(origin, destinations, options);
            }

            // Prepare waypoints for Google Maps API
            const waypoints = destinations.map(dest => 
                `${dest.latitude},${dest.longitude}`
            ).join('|');

            const params = {
                origin: `${origin.latitude},${origin.longitude}`,
                destination: `${origin.latitude},${origin.longitude}`, // Return to origin
                waypoints: `optimize:true|${waypoints}`,
                mode: travelMode.toLowerCase(),
                key: this.googleMapsApiKey,
                avoid: this.buildAvoidanceString(avoidTolls, avoidHighways)
            };

            if (departureTime) {
                params.departure_time = Math.floor(new Date(departureTime).getTime() / 1000);
            }

            const response = await axios.get(`${this.baseUrl}/directions/json`, { params });

            if (response.data.status !== 'OK') {
                logger.error('Google Maps API error:', response.data.status);
                return this.basicOptimization(origin, destinations);
            }

            return this.processGoogleMapsResponse(response.data, destinations, origin);

        } catch (error) {
            logger.error('Error in route optimization:', error);
            return this.basicOptimization(origin, destinations);
        }
    }

    /**
     * Process Google Maps API response and format for our system
     * @param {Object} response - Google Maps API response
     * @param {Array} originalDestinations - Original destinations array
     * @param {Object} origin - Starting point
     * @returns {Object} Formatted route data
     */
    processGoogleMapsResponse(response, originalDestinations, origin) {
        const route = response.routes[0];
        const leg = route.legs[0];
        const waypointOrder = route.waypoint_order || [];

        // Reorder destinations based on Google's optimization
        const optimizedDestinations = waypointOrder.map(index => originalDestinations[index]);

        // Calculate route statistics
        let totalDistance = 0;
        let totalDuration = 0;
        const routeSteps = [];

        route.legs.forEach((leg, index) => {
            totalDistance += leg.distance.value; // in meters
            totalDuration += leg.duration.value; // in seconds

            const destination = index === 0 ? optimizedDestinations[0] : 
                               index < optimizedDestinations.length ? optimizedDestinations[index] : null;

            if (destination) {
                routeSteps.push({
                    step_number: index + 1,
                    destination,
                    distance_meters: leg.distance.value,
                    duration_seconds: leg.duration.value,
                    distance_text: leg.distance.text,
                    duration_text: leg.duration.text,
                    start_location: leg.start_location,
                    end_location: leg.end_location,
                    polyline: leg.steps.map(step => step.polyline.points)
                });
            }
        });

        return {
            success: true,
            optimization_method: 'google_maps',
            total_distance_km: Math.round(totalDistance / 1000 * 100) / 100,
            total_duration_minutes: Math.round(totalDuration / 60),
            estimated_fuel_consumption: this.calculateFuelConsumption(totalDistance),
            optimized_destinations: optimizedDestinations,
            route_steps: routeSteps,
            route_polyline: route.overview_polyline.points,
            bounds: route.bounds,
            optimization_savings: this.calculateSavings(originalDestinations, optimizedDestinations, origin)
        };
    }

    /**
     * Handle routes with more than 25 waypoints by splitting into segments
     * @param {Object} origin - Starting point
     * @param {Array} destinations - Array of destinations
     * @param {Object} options - Optimization options
     * @returns {Promise<Object>} Optimized route data
     */
    async optimizeLargeRoute(origin, destinations, options) {
        try {
            // Split destinations into chunks
            const chunks = this.chunkArray(destinations, this.maxWaypoints);
            const optimizedChunks = [];
            let totalDistance = 0;
            let totalDuration = 0;
            let currentOrigin = origin;

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const chunkResult = await this.optimizeRoute(currentOrigin, chunk, options);
                
                if (chunkResult.success) {
                    optimizedChunks.push(chunkResult);
                    totalDistance += chunkResult.total_distance_km;
                    totalDuration += chunkResult.total_duration_minutes;
                    
                    // Set the last destination of this chunk as the origin for the next chunk
                    if (i < chunks.length - 1) {
                        const lastDestination = chunkResult.optimized_destinations[chunkResult.optimized_destinations.length - 1];
                        currentOrigin = {
                            latitude: lastDestination.latitude,
                            longitude: lastDestination.longitude
                        };
                    }
                }

                // Add delay between API calls to respect rate limits
                if (i < chunks.length - 1) {
                    await this.delay(200);
                }
            }

            // Combine all chunks into a single route
            const combinedDestinations = optimizedChunks.flatMap(chunk => chunk.optimized_destinations);
            const combinedSteps = optimizedChunks.flatMap((chunk, chunkIndex) => 
                chunk.route_steps.map((step, stepIndex) => ({
                    ...step,
                    step_number: chunkIndex * this.maxWaypoints + stepIndex + 1
                }))
            );

            return {
                success: true,
                optimization_method: 'google_maps_chunked',
                total_distance_km: Math.round(totalDistance * 100) / 100,
                total_duration_minutes: Math.round(totalDuration),
                estimated_fuel_consumption: this.calculateFuelConsumption(totalDistance * 1000),
                optimized_destinations: combinedDestinations,
                route_steps: combinedSteps,
                chunks_count: chunks.length,
                optimization_note: `Route was split into ${chunks.length} segments due to API limitations`
            };

        } catch (error) {
            logger.error('Error in large route optimization:', error);
            return this.basicOptimization(origin, destinations);
        }
    }

    /**
     * Basic optimization using distance calculation (fallback when Google Maps API is unavailable)
     * @param {Object} origin - Starting point
     * @param {Array} destinations - Array of destinations
     * @returns {Object} Basic optimized route
     */
    basicOptimization(origin, destinations) {
        try {
            const optimizedDestinations = [...destinations];
            const routeSteps = [];
            let currentLocation = origin;
            let totalDistance = 0;

            // Simple nearest neighbor algorithm
            while (optimizedDestinations.length > 0) {
                let nearestIndex = 0;
                let nearestDistance = this.calculateDistance(currentLocation, optimizedDestinations[0]);

                // Find nearest unvisited destination
                for (let i = 1; i < optimizedDestinations.length; i++) {
                    const distance = this.calculateDistance(currentLocation, optimizedDestinations[i]);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestIndex = i;
                    }
                }

                // Add to route
                const nearestDestination = optimizedDestinations.splice(nearestIndex, 1)[0];
                totalDistance += nearestDistance;

                routeSteps.push({
                    step_number: routeSteps.length + 1,
                    destination: nearestDestination,
                    distance_km: Math.round(nearestDistance * 100) / 100,
                    estimated_duration_minutes: Math.round(nearestDistance / 0.5), // Assume 30 km/h average
                    optimization_method: 'nearest_neighbor'
                });

                currentLocation = nearestDestination;
            }

            // Add return to origin
            const returnDistance = this.calculateDistance(currentLocation, origin);
            totalDistance += returnDistance;

            return {
                success: true,
                optimization_method: 'basic_nearest_neighbor',
                total_distance_km: Math.round(totalDistance * 100) / 100,
                total_duration_minutes: Math.round(totalDistance / 0.5), // Assume 30 km/h average
                estimated_fuel_consumption: this.calculateFuelConsumption(totalDistance * 1000),
                optimized_destinations: routeSteps.map(step => step.destination),
                route_steps: routeSteps,
                optimization_note: 'Basic optimization used (Google Maps API unavailable)'
            };

        } catch (error) {
            logger.error('Error in basic optimization:', error);
            return {
                success: false,
                error: 'Route optimization failed',
                optimized_destinations: destinations
            };
        }
    }

    /**
     * Calculate distance between two points using Haversine formula
     * @param {Object} point1 - {latitude, longitude}
     * @param {Object} point2 - {latitude, longitude}
     * @returns {number} Distance in kilometers
     */
    calculateDistance(point1, point2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(point2.latitude - point1.latitude);
        const dLon = this.toRadians(point2.longitude - point1.longitude);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Convert degrees to radians
     * @param {number} degrees
     * @returns {number} Radians
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Calculate estimated fuel consumption
     * @param {number} distanceMeters - Distance in meters
     * @returns {number} Estimated fuel consumption in liters
     */
    calculateFuelConsumption(distanceMeters) {
        const distanceKm = distanceMeters / 1000;
        const averageConsumption = 8; // liters per 100km (configurable)
        return Math.round(distanceKm * averageConsumption / 100 * 100) / 100;
    }

    /**
     * Build avoidance string for Google Maps API
     * @param {boolean} avoidTolls
     * @param {boolean} avoidHighways
     * @returns {string} Avoidance parameters
     */
    buildAvoidanceString(avoidTolls, avoidHighways) {
        const avoid = [];
        if (avoidTolls) avoid.push('tolls');
        if (avoidHighways) avoid.push('highways');
        return avoid.join('|');
    }

    /**
     * Calculate optimization savings
     * @param {Array} originalDestinations
     * @param {Array} optimizedDestinations
     * @param {Object} origin
     * @returns {Object} Savings data
     */
    calculateSavings(originalDestinations, optimizedDestinations, origin) {
        // Calculate original route distance
        let originalDistance = 0;
        let currentLocation = origin;
        
        for (const dest of originalDestinations) {
            originalDistance += this.calculateDistance(currentLocation, dest);
            currentLocation = dest;
        }
        originalDistance += this.calculateDistance(currentLocation, origin);

        // Calculate optimized route distance
        let optimizedDistance = 0;
        currentLocation = origin;
        
        for (const dest of optimizedDestinations) {
            optimizedDistance += this.calculateDistance(currentLocation, dest);
            currentLocation = dest;
        }
        optimizedDistance += this.calculateDistance(currentLocation, origin);

        const distanceSaved = originalDistance - optimizedDistance;
        const percentageSaved = originalDistance > 0 ? (distanceSaved / originalDistance) * 100 : 0;

        return {
            original_distance_km: Math.round(originalDistance * 100) / 100,
            optimized_distance_km: Math.round(optimizedDistance * 100) / 100,
            distance_saved_km: Math.round(distanceSaved * 100) / 100,
            percentage_saved: Math.round(percentageSaved * 100) / 100,
            estimated_time_saved_minutes: Math.round(distanceSaved / 0.5) // Assume 30 km/h average
        };
    }

    /**
     * Split array into chunks
     * @param {Array} array
     * @param {number} chunkSize
     * @returns {Array} Array of chunks
     */
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    /**
     * Add delay between API calls
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get estimated travel time between two points
     * @param {Object} origin
     * @param {Object} destination
     * @param {Object} options
     * @returns {Promise<Object>} Travel time data
     */
    async getTravelTime(origin, destination, options = {}) {
        try {
            if (!this.googleMapsApiKey) {
                // Fallback calculation
                const distance = this.calculateDistance(origin, destination);
                return {
                    distance_km: Math.round(distance * 100) / 100,
                    duration_minutes: Math.round(distance / 0.5), // Assume 30 km/h average
                    method: 'estimated'
                };
            }

            const params = {
                origins: `${origin.latitude},${origin.longitude}`,
                destinations: `${destination.latitude},${destination.longitude}`,
                mode: options.travelMode || 'driving',
                key: this.googleMapsApiKey
            };

            const response = await axios.get(`${this.baseUrl}/distancematrix/json`, { params });

            if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
                const element = response.data.rows[0].elements[0];
                return {
                    distance_km: Math.round(element.distance.value / 1000 * 100) / 100,
                    duration_minutes: Math.round(element.duration.value / 60),
                    distance_text: element.distance.text,
                    duration_text: element.duration.text,
                    method: 'google_maps'
                };
            }

            throw new Error('Google Maps API returned error');

        } catch (error) {
            logger.error('Error getting travel time:', error);
            // Fallback calculation
            const distance = this.calculateDistance(origin, destination);
            return {
                distance_km: Math.round(distance * 100) / 100,
                duration_minutes: Math.round(distance / 0.5),
                method: 'estimated_fallback'
            };
        }
    }

    /**
     * Validate Google Maps API key
     * @returns {Promise<boolean>} Whether API key is valid
     */
    async validateApiKey() {
        try {
            if (!this.googleMapsApiKey) {
                return false;
            }

            const params = {
                origins: '33.5138,36.2765', // Damascus coordinates
                destinations: '33.5138,36.2765',
                key: this.googleMapsApiKey
            };

            const response = await axios.get(`${this.baseUrl}/distancematrix/json`, { params });
            return response.data.status === 'OK';

        } catch (error) {
            logger.error('Error validating Google Maps API key:', error);
            return false;
        }
    }
}

export default new RouteOptimizationService();
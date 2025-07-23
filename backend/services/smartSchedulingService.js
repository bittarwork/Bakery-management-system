import SchedulingDraft from '../models/SchedulingDraft.js';
import mysql from 'mysql2/promise';
import logger from '../config/logger.js';

// Database configuration for Railway production
const dbConfig = {
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    port: 24785
};

class SmartSchedulingService {
    constructor() {
        this.algorithmVersion = '1.0';
        this.minConfidenceScore = 60; // Minimum confidence to auto-approve
    }

    /**
     * Create auto-scheduling draft for new order
     * @param {Object} orderData - Order information
     * @param {number} createdBy - System user ID
     * @returns {Object} Scheduling draft result
     */
    async createSchedulingDraft(orderData, createdBy = 1) {
        try {
            logger.info(`Creating scheduling draft for order: ${orderData.order_number}`);

            // Analyze order requirements
            const requirements = await this.analyzeOrderRequirements(orderData);

            // Find available distributors
            const availableDistributors = await this.getAvailableDistributors(requirements);

            if (availableDistributors.length === 0) {
                throw new Error('لا توجد موزعون متاحون لهذا الطلب');
            }

            // Calculate best distributor using smart algorithm
            const suggestions = await this.calculateDistributorScores(
                requirements,
                availableDistributors
            );

            const bestSuggestion = suggestions[0];
            const alternatives = suggestions.slice(1, 3); // Top 3 alternatives

            // Calculate delivery logistics
            const logistics = await this.calculateDeliveryLogistics(
                orderData,
                bestSuggestion.distributor
            );

            // Create scheduling draft
            const draftData = {
                order_id: orderData.id,
                suggested_distributor_id: bestSuggestion.distributor.id,
                suggested_distributor_name: bestSuggestion.distributor.full_name,
                confidence_score: bestSuggestion.confidence_score,
                suggested_delivery_date: logistics.suggested_delivery_date,
                suggested_priority: requirements.priority,
                reasoning: bestSuggestion.reasoning,
                alternative_suggestions: alternatives.map(alt => ({
                    distributor_id: alt.distributor.id,
                    distributor_name: alt.distributor.full_name,
                    confidence_score: alt.confidence_score,
                    reasoning: alt.reasoning
                })),
                route_optimization: logistics.route_optimization,
                estimated_delivery_time: logistics.estimated_delivery_time,
                estimated_duration: logistics.estimated_duration,
                created_by: createdBy,
                status: bestSuggestion.confidence_score >= this.minConfidenceScore
                    ? 'pending_review'
                    : 'pending_review' // Always require review for now
            };

            // Save to database
            const connection = await mysql.createConnection(dbConfig);

            const insertQuery = `
                INSERT INTO scheduling_drafts (
                    order_id, suggested_distributor_id, suggested_distributor_name,
                    confidence_score, suggested_delivery_date, suggested_priority,
                    reasoning, alternative_suggestions, route_optimization,
                    estimated_delivery_time, estimated_duration, created_by,
                    status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;

            const [result] = await connection.execute(insertQuery, [
                draftData.order_id,
                draftData.suggested_distributor_id,
                draftData.suggested_distributor_name,
                draftData.confidence_score,
                draftData.suggested_delivery_date,
                draftData.suggested_priority,
                JSON.stringify(draftData.reasoning),
                JSON.stringify(draftData.alternative_suggestions),
                JSON.stringify(draftData.route_optimization),
                draftData.estimated_delivery_time,
                draftData.estimated_duration,
                draftData.created_by,
                draftData.status
            ]);

            await connection.end();

            logger.info(`Scheduling draft created with ID: ${result.insertId}`);

            return {
                success: true,
                draft_id: result.insertId,
                suggestion: bestSuggestion,
                alternatives: alternatives,
                logistics: logistics,
                requires_review: true,
                message: `تم إنشاء اقتراح جدولة بدرجة ثقة ${bestSuggestion.confidence_score}%`
            };

        } catch (error) {
            logger.error('Error creating scheduling draft:', error);
            throw error;
        }
    }

    /**
     * Analyze order requirements and store characteristics
     * @param {Object} orderData - Order information
     * @returns {Object} Analysis results
     */
    static async analyzeOrderRequirements(orderData) {
        let connection;
        try {
            connection = await mysql.createConnection(dbConfig);

            // Get store information with available columns only
            const [storeResults] = await connection.execute(`
                SELECT 
                    s.*,
                    s.gps_coordinates,
                    s.assigned_distributor_id,
                    s.preferred_delivery_time
                FROM stores s 
                WHERE s.id = ?
            `, [orderData.store_id]);

            if (storeResults.length === 0) {
                throw new Error(`Store not found: ${orderData.store_id}`);
            }

            const store = storeResults[0];

            // Parse GPS coordinates safely
            let storeCoordinates = null;
            if (store.gps_coordinates) {
                try {
                    storeCoordinates = typeof store.gps_coordinates === 'string'
                        ? JSON.parse(store.gps_coordinates)
                        : store.gps_coordinates;
                } catch (parseError) {
                    logger.warn(`Failed to parse GPS coordinates for store ${store.id}:`, parseError);
                }
            }

            // Get order items for complexity analysis
            const [orderItems] = await connection.execute(`
                SELECT 
                    oi.*,
                    p.name as product_name,
                    p.category,
                    p.weight_kg,
                    p.requires_special_handling
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [orderData.id]);

            // Calculate order complexity
            const complexity = this.calculateOrderComplexity(orderItems, orderData);

            // Determine delivery zone based on store location or address
            const deliveryZone = this.determineDeliveryZone(store, storeCoordinates);

            await connection.end();

            return {
                success: true,
                store: {
                    ...store,
                    coordinates: storeCoordinates,
                    delivery_zone: deliveryZone // Add computed delivery zone
                },
                orderItems,
                complexity,
                requirements: {
                    special_handling: orderItems.some(item => item.requires_special_handling),
                    heavy_items: orderItems.some(item => item.weight_kg > 10),
                    total_weight: orderItems.reduce((sum, item) => sum + (item.weight_kg * item.quantity), 0),
                    item_count: orderItems.length,
                    preferred_time: store.preferred_delivery_time,
                    assigned_distributor: store.assigned_distributor_id
                }
            };

        } catch (error) {
            logger.error('Error analyzing order requirements:', error);
            if (connection) {
                try {
                    await connection.end();
                } catch (closeError) {
                    logger.error('Error closing connection:', closeError);
                }
            }
            throw error;
        }
    }

    /**
     * Determine delivery zone based on store data
     * @param {Object} store - Store information
     * @param {Object} coordinates - GPS coordinates
     * @returns {string} Delivery zone
     */
    static determineDeliveryZone(store, coordinates) {
        // If store has a city specified, use it as zone
        if (store.city) {
            return store.city.toLowerCase();
        }

        // Try to extract zone from address
        if (store.address) {
            const address = store.address.toLowerCase();

            // Common Damascus zones
            if (address.includes('damascus') || address.includes('دمشق')) {
                if (address.includes('old') || address.includes('قديمة')) return 'damascus_old';
                if (address.includes('new') || address.includes('جديدة')) return 'damascus_new';
                return 'damascus_center';
            }

            // Other major cities
            if (address.includes('aleppo') || address.includes('حلب')) return 'aleppo';
            if (address.includes('homs') || address.includes('حمص')) return 'homs';
            if (address.includes('lattakia') || address.includes('اللاذقية')) return 'lattakia';
        }

        // Default zone based on coordinates if available
        if (coordinates && coordinates.lat && coordinates.lng) {
            // Simple zone determination based on lat/lng ranges
            // This is a simplified approach - in reality you'd use more sophisticated geo-fencing
            if (coordinates.lat > 33.5 && coordinates.lat < 33.6 &&
                coordinates.lng > 36.2 && coordinates.lng < 36.4) {
                return 'damascus_center';
            }
        }

        // Default fallback
        return 'general';
    }

    /**
     * Get available distributors
     * @param {Object} requirements - Order requirements
     * @returns {Array} Available distributors
     */
    async getAvailableDistributors(requirements) {
        try {
            const connection = await mysql.createConnection(dbConfig);

            // Query to get active distributors with their performance metrics
            const query = `
                SELECT 
                    u.id,
                    u.full_name,
                    u.phone,
                    u.email,
                    u.status,
                    u.delivery_zone,
                    u.vehicle_info,
                    u.performance_rating,
                    u.total_deliveries,
                    u.successful_deliveries,
                    u.average_delivery_time,
                    u.current_workload,
                    u.max_daily_capacity,
                    COUNT(dt.id) as current_trips_today,
                    AVG(sv.payment_collected_eur + sv.payment_collected_syp/15000) as avg_collection
                FROM users u
                LEFT JOIN distribution_trips dt ON u.id = dt.distributor_id 
                    AND dt.trip_date = CURDATE() 
                    AND dt.status IN ('pending', 'in_progress')
                LEFT JOIN store_visits sv ON dt.id = sv.trip_id 
                    AND sv.visit_status = 'completed'
                WHERE u.role = 'distributor' 
                    AND u.status = 'active'
                    AND (u.delivery_zone IS NULL OR u.delivery_zone = ? OR u.delivery_zone = 'all')
                GROUP BY u.id
                HAVING current_trips_today < COALESCE(u.max_daily_capacity, 5)
                ORDER BY u.performance_rating DESC, current_trips_today ASC
            `;

            const [distributors] = await connection.execute(query, [
                requirements.delivery_zone
            ]);

            await connection.end();

            // Parse JSON fields and add calculated metrics
            return distributors.map(distributor => ({
                ...distributor,
                vehicle_info: distributor.vehicle_info ? JSON.parse(distributor.vehicle_info) : {},
                availability_score: this.calculateAvailabilityScore(distributor),
                success_rate: distributor.total_deliveries > 0
                    ? (distributor.successful_deliveries / distributor.total_deliveries) * 100
                    : 85, // Default for new distributors
                current_capacity_usage: (distributor.current_trips_today / (distributor.max_daily_capacity || 5)) * 100
            }));

        } catch (error) {
            logger.error('Error getting available distributors:', error);
            throw error;
        }
    }

    /**
     * Calculate distributor scores using smart algorithm
     * @param {Object} requirements - Order requirements  
     * @param {Array} distributors - Available distributors
     * @returns {Array} Sorted distributors by score
     */
    async calculateDistributorScores(requirements, distributors) {
        const scoredDistributors = [];

        for (const distributor of distributors) {
            const scores = {
                location_score: this.calculateLocationScore(requirements, distributor),
                availability_score: this.calculateAvailabilityScore(distributor),
                performance_score: this.calculatePerformanceScore(distributor),
                experience_score: await this.calculateExperienceScore(requirements, distributor),
                capacity_score: this.calculateCapacityScore(requirements, distributor),
                priority_match_score: this.calculatePriorityMatchScore(requirements, distributor)
            };

            // Weighted scoring algorithm
            const weights = {
                location_score: 0.25,      // 25% - Geographic proximity and zone match
                availability_score: 0.20,  // 20% - Current availability
                performance_score: 0.20,   // 20% - Historical performance
                experience_score: 0.15,    // 15% - Experience with similar orders/stores
                capacity_score: 0.15,      // 15% - Capacity to handle order size
                priority_match_score: 0.05 // 5% - Match with order priority
            };

            const weighted_score = Object.keys(scores).reduce((total, key) => {
                return total + (scores[key] * weights[key]);
            }, 0);

            const confidence_score = Math.min(Math.round(weighted_score), 100);

            // Generate reasoning
            const reasoning = this.generateReasoning(scores, requirements, distributor);

            scoredDistributors.push({
                distributor,
                confidence_score,
                scores,
                reasoning
            });
        }

        // Sort by confidence score (highest first)
        return scoredDistributors.sort((a, b) => b.confidence_score - a.confidence_score);
    }

    /**
     * Calculate order complexity based on items and order data
     * @param {Array} orderItems - Array of order items
     * @param {Object} orderData - Order information
     * @returns {Object} Complexity analysis
     */
    static calculateOrderComplexity(orderItems, orderData) {
        let complexityScore = 0;
        let complexityLevel = 'low';
        let factors = [];

        // Order value factor
        const orderValue = parseFloat(orderData.total_amount_eur) || 0;
        if (orderValue > 500) {
            complexityScore += 30;
            factors.push('High order value (>€500)');
        } else if (orderValue > 200) {
            complexityScore += 15;
            factors.push('Medium order value (€200-500)');
        }

        // Item count factor
        const itemCount = orderItems.length;
        if (itemCount > 10) {
            complexityScore += 20;
            factors.push(`High item count (${itemCount} items)`);
        } else if (itemCount > 5) {
            complexityScore += 10;
            factors.push(`Medium item count (${itemCount} items)`);
        }

        // Special handling requirements
        const specialHandlingItems = orderItems.filter(item => item.requires_special_handling);
        if (specialHandlingItems.length > 0) {
            complexityScore += 25;
            factors.push(`${specialHandlingItems.length} items require special handling`);
        }

        // Weight factor
        const totalWeight = orderItems.reduce((sum, item) => sum + (item.weight_kg * item.quantity), 0);
        if (totalWeight > 50) {
            complexityScore += 20;
            factors.push(`Heavy order (${totalWeight}kg)`);
        } else if (totalWeight > 20) {
            complexityScore += 10;
            factors.push(`Medium weight (${totalWeight}kg)`);
        }

        // Delivery urgency
        const deliveryDate = new Date(orderData.delivery_date || orderData.order_date);
        const today = new Date();
        const daysDiff = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 1) {
            complexityScore += 30;
            factors.push('Urgent delivery (same/next day)');
        } else if (daysDiff <= 2) {
            complexityScore += 15;
            factors.push('Fast delivery (within 2 days)');
        }

        // Determine complexity level
        if (complexityScore >= 60) {
            complexityLevel = 'high';
        } else if (complexityScore >= 30) {
            complexityLevel = 'medium';
        } else {
            complexityLevel = 'low';
        }

        return {
            score: complexityScore,
            level: complexityLevel,
            factors: factors,
            metrics: {
                order_value: orderValue,
                item_count: itemCount,
                total_weight: totalWeight,
                special_handling_count: specialHandlingItems.length,
                days_until_delivery: daysDiff
            }
        };
    }

    /**
     * Calculate location-based score
     */
    calculateLocationScore(requirements, distributor) {
        let score = 50; // Base score

        // Zone match bonus
        if (distributor.delivery_zone === requirements.delivery_zone ||
            distributor.delivery_zone === 'all') {
            score += 30;
        }

        // Assigned distributor bonus
        if (requirements.assigned_distributor_id === distributor.id) {
            score += 20;
        }

        // GPS proximity bonus (if coordinates available)
        if (requirements.coordinates && distributor.home_coordinates) {
            const distance = this.calculateDistance(
                requirements.coordinates,
                distributor.home_coordinates
            );

            if (distance < 5) score += 15;
            else if (distance < 10) score += 10;
            else if (distance < 20) score += 5;
        }

        return Math.min(score, 100);
    }

    /**
     * Calculate availability score
     */
    calculateAvailabilityScore(distributor) {
        const maxCapacity = distributor.max_daily_capacity || 5;
        const currentLoad = distributor.current_trips_today || 0;

        if (currentLoad === 0) return 100;
        if (currentLoad >= maxCapacity) return 0;

        return Math.round((1 - (currentLoad / maxCapacity)) * 100);
    }

    /**
     * Calculate performance score
     */
    calculatePerformanceScore(distributor) {
        const performanceRating = distributor.performance_rating || 85;
        const successRate = distributor.success_rate || 85;

        return Math.round((performanceRating * 0.6) + (successRate * 0.4));
    }

    /**
     * Calculate experience score with similar orders
     */
    async calculateExperienceScore(requirements, distributor) {
        try {
            const connection = await mysql.createConnection(dbConfig);

            // Check experience with this store
            const [storeExperience] = await connection.execute(`
                SELECT COUNT(*) as visits, AVG(payment_collected) as avg_success
                FROM store_visits sv
                JOIN distribution_trips dt ON sv.trip_id = dt.id
                WHERE dt.distributor_id = ? AND sv.store_id = ?
                    AND sv.visit_status = 'completed'
            `, [distributor.id, requirements.store.id]);

            await connection.end();

            let score = 50; // Base experience score

            // Store-specific experience bonus
            if (storeExperience[0].visits > 0) {
                score += Math.min(storeExperience[0].visits * 5, 30);
            }

            // Total deliveries experience
            const totalDeliveries = distributor.total_deliveries || 0;
            if (totalDeliveries > 100) score += 20;
            else if (totalDeliveries > 50) score += 15;
            else if (totalDeliveries > 20) score += 10;
            else if (totalDeliveries > 5) score += 5;

            return Math.min(score, 100);

        } catch (error) {
            logger.error('Error calculating experience score:', error);
            return 50; // Default score on error
        }
    }

    /**
     * Calculate capacity score for order size
     */
    calculateCapacityScore(requirements, distributor) {
        const vehicleInfo = distributor.vehicle_info || {};
        const maxCapacity = vehicleInfo.max_capacity || 1000; // Default capacity in euros

        let score = 80; // Base capacity score

        if (requirements.order_value > maxCapacity * 0.8) {
            score = 40; // Low score if order is near/over capacity
        } else if (requirements.order_value > maxCapacity * 0.6) {
            score = 60;
        } else if (requirements.order_value > maxCapacity * 0.4) {
            score = 80;
        } else {
            score = 100; // Excellent if order is well within capacity
        }

        return score;
    }

    /**
     * Calculate priority match score
     */
    calculatePriorityMatchScore(requirements, distributor) {
        // Simple priority matching - can be enhanced
        if (requirements.priority === 'urgent' && distributor.performance_rating > 90) {
            return 100;
        } else if (requirements.priority === 'high' && distributor.performance_rating > 85) {
            return 90;
        } else {
            return 80;
        }
    }

    /**
     * Generate human-readable reasoning
     */
    generateReasoning(scores, requirements, distributor) {
        const reasoning = {
            zone_match: scores.location_score > 70,
            capacity_available: scores.availability_score > 60,
            performance_score: Math.round(scores.performance_score),
            distance_optimal: scores.location_score > 80,
            experience: scores.experience_score > 70,
            main_factors: []
        };

        // Add main factors
        if (scores.location_score > 80) {
            reasoning.main_factors.push('موقع مثالي للتسليم');
        }
        if (scores.availability_score > 80) {
            reasoning.main_factors.push('متاح بشكل كامل');
        }
        if (scores.performance_score > 90) {
            reasoning.main_factors.push('أداء ممتاز');
        }
        if (scores.experience_score > 80) {
            reasoning.main_factors.push('خبرة سابقة مع المحل');
        }

        return reasoning;
    }

    /**
     * Calculate delivery logistics and timing
     */
    async calculateDeliveryLogistics(orderData, distributor) {
        try {
            // Calculate suggested delivery date
            const orderDate = new Date(orderData.order_date);
            const requestedDeliveryDate = new Date(orderData.delivery_date || orderDate);

            // Add one day if same day (to allow processing time)
            let suggestedDeliveryDate = new Date(requestedDeliveryDate);
            if (suggestedDeliveryDate.toDateString() === orderDate.toDateString()) {
                suggestedDeliveryDate.setDate(suggestedDeliveryDate.getDate() + 1);
            }

            // Estimate delivery time based on distributor's schedule
            const estimatedDeliveryTime = '10:00:00'; // Default morning delivery
            const estimatedDuration = 30; // 30 minutes default

            // Route optimization info
            const routeOptimization = {
                estimated_distance: '15 km',
                estimated_travel_time: '20 minutes',
                suggested_route: 'الطريق الرئيسي',
                traffic_consideration: 'منخفض',
                fuel_cost_estimate: '€5.00'
            };

            return {
                suggested_delivery_date: suggestedDeliveryDate.toISOString().split('T')[0],
                estimated_delivery_time: estimatedDeliveryTime,
                estimated_duration: estimatedDuration,
                route_optimization: routeOptimization
            };

        } catch (error) {
            logger.error('Error calculating delivery logistics:', error);

            // Return defaults on error
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            return {
                suggested_delivery_date: tomorrow.toISOString().split('T')[0],
                estimated_delivery_time: '10:00:00',
                estimated_duration: 30,
                route_optimization: {
                    estimated_distance: 'غير محدد',
                    estimated_travel_time: 'غير محدد',
                    suggested_route: 'سيتم تحديده لاحقاً'
                }
            };
        }
    }

    /**
     * Calculate distance between two GPS coordinates (Haversine formula)
     */
    calculateDistance(coord1, coord2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(coord2.lat - coord1.lat);
        const dLon = this.toRadians(coord2.lng - coord1.lng);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Convert degrees to radians
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Find available distributors for the order
     * @param {Object} requirements - Order requirements
     * @returns {Array} Available distributors with scores
     */
    static async findAvailableDistributors(requirements) {
        let connection;
        try {
            connection = await mysql.createConnection(dbConfig);

            // Get all active distributors with their details
            const [distributors] = await connection.execute(`
                SELECT 
                    u.id,
                    u.full_name,
                    u.email,
                    u.phone,
                    COALESCE(u.performance_rating, 85) as performance_rating,
                    COALESCE(u.current_workload, 0) as current_workload,
                    u.max_daily_capacity,
                    u.preferred_areas,
                    u.specializations,
                    u.status,
                    u.last_active
                FROM users u
                WHERE u.role = 'distributor' 
                    AND u.status = 'active'
                    AND u.is_verified = 1
                ORDER BY u.performance_rating DESC, u.current_workload ASC
            `);

            if (distributors.length === 0) {
                return [];
            }

            // Score each distributor
            const scoredDistributors = distributors.map(distributor => {
                const score = this.calculateDistributorScore(distributor, requirements);
                return {
                    ...distributor,
                    suitability_score: score.total,
                    score_breakdown: score.breakdown,
                    reasons: score.reasons
                };
            });

            // Sort by suitability score
            scoredDistributors.sort((a, b) => b.suitability_score - a.suitability_score);

            await connection.end();
            return scoredDistributors;

        } catch (error) {
            logger.error('Error finding available distributors:', error);
            if (connection) {
                try {
                    await connection.end();
                } catch (closeError) {
                    logger.error('Error closing connection:', closeError);
                }
            }
            throw error;
        }
    }

    /**
     * Calculate distributor suitability score
     * @param {Object} distributor - Distributor information
     * @param {Object} requirements - Order requirements
     * @returns {Object} Score calculation results
     */
    static calculateDistributorScore(distributor, requirements) {
        let totalScore = 0;
        const breakdown = {};
        const reasons = [];

        // Performance rating (40% weight)
        const performanceScore = (distributor.performance_rating / 100) * 40;
        breakdown.performance = performanceScore;
        totalScore += performanceScore;
        reasons.push(`Performance rating: ${distributor.performance_rating}%`);

        // Workload availability (30% weight)
        const workloadCapacity = distributor.max_daily_capacity || 10;
        const currentLoad = distributor.current_workload || 0;
        const availabilityRatio = Math.max(0, (workloadCapacity - currentLoad) / workloadCapacity);
        const workloadScore = availabilityRatio * 30;
        breakdown.workload = workloadScore;
        totalScore += workloadScore;
        reasons.push(`Availability: ${Math.round(availabilityRatio * 100)}%`);

        // Zone/Area match (20% weight)
        let zoneScore = 10; // Default partial score
        if (distributor.preferred_areas) {
            try {
                const preferredAreas = typeof distributor.preferred_areas === 'string'
                    ? JSON.parse(distributor.preferred_areas)
                    : distributor.preferred_areas;

                if (Array.isArray(preferredAreas) &&
                    preferredAreas.some(area =>
                        area.toLowerCase().includes(requirements.store.delivery_zone?.toLowerCase()) ||
                        requirements.store.delivery_zone?.toLowerCase().includes(area.toLowerCase())
                    )) {
                    zoneScore = 20;
                    reasons.push('Zone match: Perfect');
                } else {
                    reasons.push('Zone match: Partial');
                }
            } catch (e) {
                reasons.push('Zone match: Unknown');
            }
        } else {
            reasons.push('Zone match: Not specified');
        }
        breakdown.zone = zoneScore;
        totalScore += zoneScore;

        // Special requirements (10% weight)
        let specialScore = 5; // Default score
        if (requirements.requirements.special_handling && distributor.specializations) {
            try {
                const specs = typeof distributor.specializations === 'string'
                    ? JSON.parse(distributor.specializations)
                    : distributor.specializations;

                if (Array.isArray(specs) && specs.includes('special_handling')) {
                    specialScore = 10;
                    reasons.push('Special handling: Qualified');
                } else {
                    specialScore = 3;
                    reasons.push('Special handling: Not qualified');
                }
            } catch (e) {
                reasons.push('Special handling: Unknown');
            }
        } else {
            reasons.push('Special handling: Not required');
        }
        breakdown.special = specialScore;
        totalScore += specialScore;

        return {
            total: Math.round(totalScore),
            breakdown,
            reasons
        };
    }
}

// Create and export service instance
const smartSchedulingService = new SmartSchedulingService();
export default smartSchedulingService; 
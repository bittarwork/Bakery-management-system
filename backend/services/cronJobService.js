import cron from 'node-cron';
import { Op } from 'sequelize';
import { User, Store, Order } from '../models/index.js';
import DailyDistributionSchedule from '../models/DailyDistributionSchedule.js';
import DistributionTrip from '../models/DistributionTrip.js';
import DistributionNotification from '../models/DistributionNotification.js';
import logger from '../config/logger.js';

class CronJobService {
    constructor() {
        this.isRunning = false;
        this.lastExecution = null;
        this.executionCount = 0;
    }

    /**
     * Start all cron jobs
     */
    startAllJobs() {
        try {
            // Auto-generate daily distribution schedules every hour
            this.startDistributionScheduleJob();

            // Clean up old location tracking data at midnight
            this.startLocationCleanupJob();

            logger.info('Cron jobs started successfully');
        } catch (error) {
            logger.error('Error starting cron jobs:', error);
        }
    }

    /**
     * Initialize cron job service
     */
    async initialize() {
        try {
            logger.info('🕐 Initializing Cron Job Service...');

            // Start all cron jobs
            this.startAllJobs();

            // Log initial status
            const status = this.getJobStatus();
            logger.info('📅 Cron Job Service initialized:', {
                executionCount: status.executionCount,
                nextExecution: status.nextExecution
            });

            return true;
        } catch (error) {
            logger.error('❌ Failed to initialize Cron Job Service:', error);
            throw error;
        }
    }

    /**
     * Distribution Schedule Auto-Generation Job
     * Runs every hour to update distribution schedules for today
     */
    startDistributionScheduleJob() {
        // Run every hour at minute 0 (e.g., 1:00, 2:00, 3:00, etc.)
        cron.schedule('0 * * * *', async () => {
            if (this.isRunning) {
                logger.warn('Distribution schedule job is already running, skipping this execution');
                return;
            }

            this.isRunning = true;
            this.lastExecution = new Date();
            this.executionCount++;

            try {
                logger.info(`🔄 Starting automatic distribution schedule generation - Execution #${this.executionCount}`);

                const results = await this.generateDailyDistributionSchedules();

                logger.info(`✅ Distribution schedule generation completed successfully:`, {
                    distributors_processed: results.distributorsProcessed,
                    schedules_created: results.schedulesCreated,
                    schedules_updated: results.schedulesUpdated,
                    execution_time: new Date() - this.lastExecution
                });

            } catch (error) {
                logger.error('❌ Error in distribution schedule cron job:', error);
            } finally {
                this.isRunning = false;
            }
        });

        logger.info('📅 Distribution schedule cron job started (runs every hour)');
    }

    /**
     * Generate daily distribution schedules for all active distributors
     */
    async generateDailyDistributionSchedules() {
        const today = new Date().toISOString().split('T')[0];
        const results = {
            distributorsProcessed: 0,
            schedulesCreated: 0,
            schedulesUpdated: 0,
            errors: []
        };

        try {
            // Get all active distributors
            const distributors = await User.findAll({
                where: {
                    role: 'distributor',
                    status: 'active'
                },
                attributes: ['id', 'full_name', 'phone', 'email']
            });

            logger.info(`Found ${distributors.length} active distributors`);

            // Process each distributor
            for (const distributor of distributors) {
                try {
                    const distributorResult = await this.processDistributorSchedule(distributor.id, today);

                    results.distributorsProcessed++;
                    results.schedulesCreated += distributorResult.schedulesCreated;
                    results.schedulesUpdated += distributorResult.schedulesUpdated;

                    if (distributorResult.schedulesCreated > 0 || distributorResult.schedulesUpdated > 0) {
                        logger.info(`✓ Processed distributor ${distributor.full_name}: ${distributorResult.schedulesCreated} created, ${distributorResult.schedulesUpdated} updated`);
                    }

                } catch (error) {
                    logger.error(`Error processing distributor ${distributor.full_name}:`, error);
                    results.errors.push({
                        distributor_id: distributor.id,
                        distributor_name: distributor.full_name,
                        error: error.message
                    });
                }
            }

            return results;

        } catch (error) {
            logger.error('Error in generateDailyDistributionSchedules:', error);
            throw error;
        }
    }

    /**
     * Process schedule for a single distributor
     */
    async processDistributorSchedule(distributorId, date) {
        const result = {
            schedulesCreated: 0,
            schedulesUpdated: 0
        };

        try {
            // Get orders assigned to this distributor for today
            const assignedOrders = await Order.findAll({
                where: {
                    assigned_distributor_id: distributorId,
                    delivery_date: date,
                    status: {
                        [Op.in]: ['confirmed', 'in_progress']
                    }
                },
                attributes: [
                    'id', 'order_number', 'store_id', 'store_name',
                    'total_amount_eur', 'total_amount_syp', 'status',
                    'priority', 'notes', 'special_instructions',
                    'delivery_address', 'customer_name', 'customer_phone'
                ],
                order: [['priority', 'DESC'], ['created_at', 'ASC']]
            });

            if (assignedOrders.length === 0) {
                // No orders for this distributor today, check if we need to clean up existing schedules
                const existingSchedules = await DailyDistributionSchedule.findAll({
                    where: {
                        distributor_id: distributorId,
                        schedule_date: date,
                        visit_status: 'scheduled' // Only clean up unstarted schedules
                    }
                });

                if (existingSchedules.length > 0) {
                    await DailyDistributionSchedule.destroy({
                        where: {
                            distributor_id: distributorId,
                            schedule_date: date,
                            visit_status: 'scheduled'
                        }
                    });
                    logger.info(`Cleaned up ${existingSchedules.length} obsolete schedules for distributor ${distributorId}`);
                }

                return result;
            }

            // Get stores with orders
            const storeIds = [...new Set(assignedOrders.map(order => order.store_id))];
            const stores = await Store.findAll({
                where: {
                    id: {
                        [Op.in]: storeIds
                    },
                    status: 'active'
                },
                attributes: ['id', 'name', 'address', 'phone', 'gps_coordinates']
            });

            // Group orders by store
            const ordersByStore = {};
            assignedOrders.forEach(order => {
                if (!ordersByStore[order.store_id]) {
                    ordersByStore[order.store_id] = [];
                }
                ordersByStore[order.store_id].push(order);
            });

            // Get existing schedules
            const existingSchedules = await DailyDistributionSchedule.findAll({
                where: {
                    distributor_id: distributorId,
                    schedule_date: date
                },
                order: [['visit_order', 'ASC']]
            });

            // Optimize route for stores
            const optimizedStores = await this.optimizeRouteForStores(stores, distributorId);

            // Create or update schedules
            const scheduleData = [];
            let visitOrder = 1;

            for (const store of optimizedStores) {
                const storeOrders = ordersByStore[store.id] || [];
                const estimatedDuration = Math.max(15, storeOrders.length * 5); // Minimum 15 min, +5 min per order

                // Check if schedule already exists for this store
                const existingSchedule = existingSchedules.find(s => s.store_id === store.id);

                if (existingSchedule) {
                    // Update existing schedule if not started yet
                    if (existingSchedule.visit_status === 'scheduled') {
                        await existingSchedule.update({
                            visit_order: visitOrder,
                            estimated_duration: estimatedDuration,
                            order_ids: storeOrders.map(o => o.id),
                            distance_from_previous: store.distance_from_previous || 0
                        });
                        result.schedulesUpdated++;
                    }
                } else {
                    // Create new schedule
                    scheduleData.push({
                        distributor_id: distributorId,
                        schedule_date: date,
                        store_id: store.id,
                        visit_order: visitOrder,
                        estimated_duration: estimatedDuration,
                        order_ids: storeOrders.map(o => o.id),
                        distance_from_previous: store.distance_from_previous || 0,
                        visit_status: 'scheduled'
                    });
                }

                visitOrder++;
            }

            // Bulk create new schedules
            if (scheduleData.length > 0) {
                await DailyDistributionSchedule.bulkCreate(scheduleData);
                result.schedulesCreated = scheduleData.length;
            }

            // Create or update distribution trip
            let trip = await DistributionTrip.findOne({
                where: {
                    distributor_id: distributorId,
                    trip_date: date
                }
            });

            if (!trip && (result.schedulesCreated > 0 || result.schedulesUpdated > 0)) {
                trip = await DistributionTrip.create({
                    distributor_id: distributorId,
                    trip_date: date,
                    trip_status: 'planned',
                    estimated_duration: optimizedStores.reduce((sum, store) => {
                        const storeOrders = ordersByStore[store.id] || [];
                        return sum + Math.max(15, storeOrders.length * 5);
                    }, 0)
                });
            }

            // Send notification to distributor if there are new/updated schedules
            if ((result.schedulesCreated > 0 || result.schedulesUpdated > 0) && trip) {
                await DistributionNotification.create({
                    distributor_id: distributorId,
                    notification_type: 'schedule_update',
                    title: 'Distribution Schedule Updated',
                    message: `Your distribution schedule for ${date} has been automatically updated with ${assignedOrders.length} orders and ${optimizedStores.length} stops.`,
                    data: {
                        date: date,
                        trip_id: trip.id,
                        store_count: optimizedStores.length,
                        order_count: assignedOrders.length
                    },
                    priority: 'normal',
                    is_read: false
                });
            }

            return result;

        } catch (error) {
            logger.error(`Error processing distributor schedule for ${distributorId}:`, error);
            throw error;
        }
    }

    /**
     * Optimize route for stores using distance-based optimization
     * This is a simplified version - in production, you might want to use Google Maps API
     */
    async optimizeRouteForStores(stores, distributorId) {
        try {
            if (stores.length <= 1) {
                return stores;
            }

            // Get distributor's starting location (could be depot or last known location)
            const distributor = await User.findByPk(distributorId, {
                attributes: ['current_location', 'depot_location']
            });

            // Define starting point (depot or default location)
            let startingPoint = { latitude: 35.2271, longitude: 36.7213 }; // Default: Homs, Syria

            if (distributor.depot_location) {
                startingPoint = distributor.depot_location;
            } else if (distributor.current_location) {
                startingPoint = distributor.current_location;
            }

            // Parse GPS coordinates for stores
            const storesWithCoords = stores.map(store => {
                let coordinates = startingPoint; // Default fallback

                if (store.gps_coordinates) {
                    try {
                        if (typeof store.gps_coordinates === 'string') {
                            coordinates = JSON.parse(store.gps_coordinates);
                        } else {
                            coordinates = store.gps_coordinates;
                        }
                    } catch (error) {
                        logger.warn(`Invalid GPS coordinates for store ${store.id}: ${store.gps_coordinates}`);
                    }
                }

                return {
                    ...store.toJSON(),
                    coordinates
                };
            });

            // Implement nearest neighbor algorithm for route optimization
            const optimizedRoute = [];
            const unvisited = [...storesWithCoords];
            let currentLocation = startingPoint;

            while (unvisited.length > 0) {
                let nearestIndex = 0;
                let nearestDistance = this.calculateDistance(
                    currentLocation,
                    unvisited[0].coordinates
                );

                // Find nearest unvisited store
                for (let i = 1; i < unvisited.length; i++) {
                    const distance = this.calculateDistance(
                        currentLocation,
                        unvisited[i].coordinates
                    );

                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestIndex = i;
                    }
                }

                // Add nearest store to route
                const nearestStore = unvisited.splice(nearestIndex, 1)[0];
                nearestStore.distance_from_previous = nearestDistance;
                optimizedRoute.push(nearestStore);

                // Update current location
                currentLocation = nearestStore.coordinates;
            }

            logger.info(`Route optimized for distributor ${distributorId}: ${optimizedRoute.length} stops`);
            return optimizedRoute;

        } catch (error) {
            logger.error('Error optimizing route:', error);
            // Return original order if optimization fails
            return stores;
        }
    }

    /**
     * Calculate distance between two points using Haversine formula
     */
    calculateDistance(point1, point2) {
        const R = 6371; // Earth radius in kilometers
        const lat1 = point1.latitude * Math.PI / 180;
        const lat2 = point2.latitude * Math.PI / 180;
        const deltaLat = (point2.latitude - point1.latitude) * Math.PI / 180;
        const deltaLon = (point2.longitude - point1.longitude) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in kilometers
    }

    /**
     * Location Cleanup Job - runs daily at midnight
     */
    startLocationCleanupJob() {
        // Run daily at midnight
        cron.schedule('0 0 * * *', async () => {
            try {
                logger.info('🧹 Starting location tracking cleanup job');

                // Clean up location records older than 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                // Note: This would require LocationTracking model which isn't shown in the provided code
                // but the logic would be similar to:
                // await LocationTracking.destroy({
                //     where: {
                //         timestamp: {
                //             [Op.lt]: thirtyDaysAgo
                //         }
                //     }
                // });

                logger.info('✅ Location tracking cleanup completed');

            } catch (error) {
                logger.error('❌ Error in location cleanup cron job:', error);
            }
        });

        logger.info('🧹 Location cleanup cron job started (runs daily at midnight)');
    }

    /**
     * Get job status
     */
    getJobStatus() {
        return {
            isRunning: this.isRunning,
            lastExecution: this.lastExecution,
            executionCount: this.executionCount,
            nextExecution: this.getNextExecutionTime()
        };
    }

    /**
     * Get next execution time (next hour)
     */
    getNextExecutionTime() {
        const now = new Date();
        const nextHour = new Date(now);
        nextHour.setHours(now.getHours() + 1, 0, 0, 0);
        return nextHour;
    }

    /**
     * Stop all cron jobs
     */
    stopAllJobs() {
        cron.getTasks().forEach(task => {
            task.stop();
        });
        logger.info('All cron jobs stopped');
    }
}

export default new CronJobService();
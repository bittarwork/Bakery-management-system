import sequelize from './config/database.js';
import DailyDistributionSchedule from './models/DailyDistributionSchedule.js';
import DistributionTrip from './models/DistributionTrip.js';
import LocationTracking from './models/LocationTracking.js';
import DistributionNotification from './models/DistributionNotification.js';
import DistributionPerformance from './models/DistributionPerformance.js';

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

const log = (message, color = colors.reset) => {
    console.log(`${color}${message}${colors.reset}`);
};

async function fixDistributionSystem() {
    try {
        log('🔧 Starting Distribution System Fix...', colors.blue);
        
        // Test connection
        await sequelize.authenticate();
        log('✅ Database connection successful', colors.green);
        
        // Get available distributors and stores
        const [distributors] = await sequelize.query("SELECT id, username FROM users WHERE role = 'distributor' LIMIT 3");
        const [stores] = await sequelize.query("SELECT id, name FROM stores LIMIT 5");
        
        log(`\n📊 Found ${distributors.length} distributors and ${stores.length} stores`, colors.cyan);
        
        // 1. Create Distribution Trips
        log('\n🚛 Creating Distribution Trips...', colors.blue);
        
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        for (let i = 0; i < distributors.length; i++) {
            const distributor = distributors[i];
            
            // Create trip for yesterday (completed)
            try {
                await DistributionTrip.create({
                    distributor_id: distributor.id,
                    trip_date: yesterday,
                    trip_status: 'completed',
                    start_time: new Date(Date.now() - 86400000 + 8 * 3600000), // 8 AM yesterday
                    end_time: new Date(Date.now() - 86400000 + 16 * 3600000), // 4 PM yesterday
                    total_distance: Math.round(Math.random() * 100 + 50), // 50-150 km
                    total_duration: Math.round(Math.random() * 300 + 300), // 5-10 hours in minutes
                    fuel_consumption: Math.round(Math.random() * 20 + 10), // 10-30 liters
                    notes: `Completed trip for ${distributor.username}`
                });
                log(`✅ Created completed trip for ${distributor.username}`, colors.green);
            } catch (error) {
                log(`⚠️ Trip might already exist for ${distributor.username}: ${error.message}`, colors.yellow);
            }
            
            // Create trip for today (in progress or planned)
            try {
                const status = i === 0 ? 'in_progress' : 'planned';
                const startTime = status === 'in_progress' ? new Date() : null;
                
                await DistributionTrip.create({
                    distributor_id: distributor.id,
                    trip_date: today,
                    trip_status: status,
                    start_time: startTime,
                    notes: `${status === 'in_progress' ? 'Active' : 'Planned'} trip for ${distributor.username}`
                });
                log(`✅ Created ${status} trip for ${distributor.username}`, colors.green);
            } catch (error) {
                log(`⚠️ Today's trip might already exist for ${distributor.username}: ${error.message}`, colors.yellow);
            }
        }
        
        // 2. Create Daily Distribution Schedules
        log('\n📅 Creating Distribution Schedules...', colors.blue);
        
        for (let i = 0; i < distributors.length; i++) {
            const distributor = distributors[i];
            
            // Create schedules for today
            for (let j = 0; j < Math.min(stores.length, 3); j++) {
                const store = stores[j];
                const visitOrder = j + 1;
                const status = j === 0 && i === 0 ? 'in_progress' : 'scheduled';
                
                try {
                    await DailyDistributionSchedule.create({
                        distributor_id: distributor.id,
                        schedule_date: today,
                        store_id: store.id,
                        visit_order: visitOrder,
                        planned_arrival_time: `${8 + j * 2}:00:00`, // Every 2 hours starting from 8 AM
                        planned_departure_time: `${8 + j * 2 + 1}:00:00`, // 1 hour duration
                        visit_status: status,
                        estimated_duration: 60, // 1 hour
                        order_ids: [], // Empty for now
                        distance_from_previous: Math.round(Math.random() * 10 + 2), // 2-12 km
                        notes: `Visit to ${store.name} by ${distributor.username}`
                    });
                    log(`✅ Created schedule: ${distributor.username} -> ${store.name} (${status})`, colors.green);
                } catch (error) {
                    log(`⚠️ Schedule might already exist: ${error.message}`, colors.yellow);
                }
            }
        }
        
        // 3. Create Location Tracking Data
        log('\n📍 Creating Location Tracking Data...', colors.blue);
        
        for (let i = 0; i < distributors.length; i++) {
            const distributor = distributors[i];
            
            // Create recent location
            try {
                await LocationTracking.create({
                    distributor_id: distributor.id,
                    latitude: 50.8503 + (Math.random() - 0.5) * 0.1, // Brussels area with variation
                    longitude: 4.3517 + (Math.random() - 0.5) * 0.1,
                    accuracy: Math.round(Math.random() * 10 + 5), // 5-15 meters
                    speed: Math.round(Math.random() * 50), // 0-50 km/h
                    heading: Math.round(Math.random() * 360), // 0-360 degrees
                    battery_level: Math.round(Math.random() * 100), // 0-100%
                    is_moving: Math.random() > 0.5,
                    activity_type: ['driving', 'walking', 'still'][Math.floor(Math.random() * 3)],
                    timestamp: new Date()
                });
                log(`✅ Created location data for ${distributor.username}`, colors.green);
            } catch (error) {
                log(`⚠️ Location data creation failed: ${error.message}`, colors.yellow);
            }
        }
        
        // 4. Create Distribution Notifications
        log('\n🔔 Creating Distribution Notifications...', colors.blue);
        
        for (let i = 0; i < distributors.length; i++) {
            const distributor = distributors[i];
            
            try {
                await DistributionNotification.create({
                    distributor_id: distributor.id,
                    notification_type: 'schedule_update',
                    title: 'Schedule Updated',
                    message: `Your distribution schedule for ${today} has been updated.`,
                    priority: 'normal',
                    is_read: false,
                    action_required: false,
                    metadata: JSON.stringify({ date: today, distributor: distributor.username })
                });
                log(`✅ Created notification for ${distributor.username}`, colors.green);
            } catch (error) {
                log(`⚠️ Notification creation failed: ${error.message}`, colors.yellow);
            }
        }
        
        // 5. Create Distribution Performance Data
        log('\n📈 Creating Distribution Performance Data...', colors.blue);
        
        for (let i = 0; i < distributors.length; i++) {
            const distributor = distributors[i];
            
            try {
                await DistributionPerformance.create({
                    distributor_id: distributor.id,
                    performance_date: yesterday,
                    total_trips: 1,
                    completed_trips: 1,
                    total_orders: Math.round(Math.random() * 20 + 10), // 10-30 orders
                    completed_orders: Math.round(Math.random() * 15 + 8), // 8-23 orders
                    total_distance: Math.round(Math.random() * 100 + 50), // 50-150 km
                    total_duration: Math.round(Math.random() * 300 + 300), // 5-10 hours
                    fuel_consumption: Math.round(Math.random() * 20 + 10), // 10-30 liters
                    on_time_deliveries: Math.round(Math.random() * 15 + 5), // 5-20
                    late_deliveries: Math.round(Math.random() * 5), // 0-5
                    customer_satisfaction: parseFloat((Math.random() * 2 + 3).toFixed(2)), // 3.0-5.0
                    efficiency_score: parseFloat((Math.random() * 30 + 70).toFixed(2)), // 70-100%
                    notes: `Performance data for ${distributor.username} on ${yesterday}`
                });
                log(`✅ Created performance data for ${distributor.username}`, colors.green);
            } catch (error) {
                log(`⚠️ Performance data creation failed: ${error.message}`, colors.yellow);
            }
        }
        
        // 6. Verify created data
        log('\n✅ Verification - Checking created data...', colors.blue);
        
        const tripsCount = await DistributionTrip.count();
        const schedulesCount = await DailyDistributionSchedule.count();
        const locationsCount = await LocationTracking.count();
        const notificationsCount = await DistributionNotification.count();
        const performanceCount = await DistributionPerformance.count();
        
        log(`📊 Data Summary:`, colors.cyan);
        log(`- Distribution Trips: ${tripsCount} records`);
        log(`- Distribution Schedules: ${schedulesCount} records`);
        log(`- Location Tracking: ${locationsCount} records`);
        log(`- Notifications: ${notificationsCount} records`);
        log(`- Performance Data: ${performanceCount} records`);
        
        log('\n🎉 Distribution System Fix Completed Successfully!', colors.green);
        
    } catch (error) {
        log(`💥 Fix failed: ${error.message}`, colors.red);
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

fixDistributionSystem();
import sequelize from './config/database.js';

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

async function fixDistributionTables() {
    try {
        log('🔧 Fixing Distribution Tables Structure...', colors.blue);
        
        await sequelize.authenticate();
        log('✅ Database connection successful', colors.green);
        
        // 1. Check and fix distribution_trips table
        log('\n🚛 Checking distribution_trips table...', colors.blue);
        
        try {
            const [tripsColumns] = await sequelize.query('DESCRIBE distribution_trips');
            const columnNames = tripsColumns.map(r => r.Field);
            log(`Current columns: ${columnNames.join(', ')}`, colors.cyan);
            
            // Add missing columns
            const missingTripColumns = [];
            
            if (!columnNames.includes('trip_status')) {
                missingTripColumns.push("ADD COLUMN trip_status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned'");
            }
            
            if (!columnNames.includes('start_time')) {
                missingTripColumns.push("ADD COLUMN start_time DATETIME");
            }
            
            if (!columnNames.includes('end_time')) {
                missingTripColumns.push("ADD COLUMN end_time DATETIME");
            }
            
            if (!columnNames.includes('total_distance')) {
                missingTripColumns.push("ADD COLUMN total_distance DECIMAL(10,2) DEFAULT 0.00");
            }
            
            if (!columnNames.includes('total_duration')) {
                missingTripColumns.push("ADD COLUMN total_duration INT DEFAULT 0");
            }
            
            if (!columnNames.includes('fuel_consumption')) {
                missingTripColumns.push("ADD COLUMN fuel_consumption DECIMAL(8,2) DEFAULT 0.00");
            }
            
            if (!columnNames.includes('vehicle_id')) {
                missingTripColumns.push("ADD COLUMN vehicle_id INT");
            }
            
            if (!columnNames.includes('notes')) {
                missingTripColumns.push("ADD COLUMN notes TEXT");
            }
            
            if (missingTripColumns.length > 0) {
                const alterQuery = `ALTER TABLE distribution_trips ${missingTripColumns.join(', ')}`;
                await sequelize.query(alterQuery);
                log(`✅ Added missing columns to distribution_trips: ${missingTripColumns.length} columns`, colors.green);
            } else {
                log('✅ distribution_trips table is already complete', colors.green);
            }
            
        } catch (error) {
            log(`❌ Error with distribution_trips: ${error.message}`, colors.red);
        }
        
        // 2. Check and fix distribution_notifications table  
        log('\n🔔 Checking distribution_notifications table...', colors.blue);
        
        try {
            const [notifColumns] = await sequelize.query('DESCRIBE distribution_notifications');
            const notifColumnNames = notifColumns.map(r => r.Field);
            log(`Current columns: ${notifColumnNames.join(', ')}`, colors.cyan);
            
            const missingNotifColumns = [];
            
            if (!notifColumnNames.includes('updated_at')) {
                missingNotifColumns.push("ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
            }
            
            if (!notifColumnNames.includes('created_at')) {
                missingNotifColumns.push("ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
            }
            
            if (missingNotifColumns.length > 0) {
                const alterQuery = `ALTER TABLE distribution_notifications ${missingNotifColumns.join(', ')}`;
                await sequelize.query(alterQuery);
                log(`✅ Added missing columns to distribution_notifications: ${missingNotifColumns.length} columns`, colors.green);
            } else {
                log('✅ distribution_notifications table is already complete', colors.green);
            }
            
        } catch (error) {
            log(`❌ Error with distribution_notifications: ${error.message}`, colors.red);
        }
        
        // 3. Verify all distribution table structures
        log('\n✅ Verifying all distribution tables...', colors.blue);
        
        const tables = [
            'distribution_trips',
            'daily_distribution_schedule', 
            'location_tracking',
            'distribution_performance',
            'distribution_notifications',
            'distribution_settings'
        ];
        
        for (const table of tables) {
            try {
                const [columns] = await sequelize.query(`DESCRIBE ${table}`);
                log(`✅ ${table}: ${columns.length} columns`, colors.green);
            } catch (error) {
                log(`❌ ${table}: ERROR - ${error.message}`, colors.red);
            }
        }
        
        log('\n🎉 Distribution Tables Fix Completed!', colors.green);
        
    } catch (error) {
        log(`💥 Fix failed: ${error.message}`, colors.red);
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

fixDistributionTables();
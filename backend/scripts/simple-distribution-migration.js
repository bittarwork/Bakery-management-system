import sequelize from '../config/database.js';

const simpleMigration = async () => {
    try {
        console.log('🚚 Starting simple distribution migration...');

        // Test connection first
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Create tables one by one
        const migrations = [
            {
                name: 'daily_distribution_schedule',
                sql: `
                    CREATE TABLE IF NOT EXISTS daily_distribution_schedule (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        distributor_id INT NOT NULL,
                        schedule_date DATE NOT NULL,
                        store_id INT NOT NULL,
                        visit_order INT NOT NULL,
                        planned_arrival_time TIME,
                        planned_departure_time TIME,
                        actual_arrival_time DATETIME,
                        actual_departure_time DATETIME,
                        visit_status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'failed') DEFAULT 'scheduled',
                        order_ids JSON,
                        estimated_duration INT DEFAULT 15,
                        actual_duration INT,
                        distance_from_previous DECIMAL(8,2),
                        notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_distributor_date (distributor_id, schedule_date),
                        INDEX idx_store_date (store_id, schedule_date),
                        INDEX idx_visit_status (visit_status),
                        FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                `
            },
            {
                name: 'location_tracking',
                sql: `
                    CREATE TABLE IF NOT EXISTS location_tracking (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        distributor_id INT NOT NULL,
                        latitude DECIMAL(10,8) NOT NULL,
                        longitude DECIMAL(11,8) NOT NULL,
                        accuracy DECIMAL(5,2),
                        speed DECIMAL(5,2),
                        heading INT,
                        altitude DECIMAL(8,2),
                        battery_level INT,
                        is_moving BOOLEAN DEFAULT FALSE,
                        activity_type ENUM('still', 'walking', 'running', 'driving', 'unknown') DEFAULT 'unknown',
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        INDEX idx_distributor_timestamp (distributor_id, timestamp),
                        INDEX idx_timestamp (timestamp),
                        INDEX idx_location (latitude, longitude),
                        FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                `
            },
            {
                name: 'distribution_performance',
                sql: `
                    CREATE TABLE IF NOT EXISTS distribution_performance (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        distributor_id INT NOT NULL,
                        performance_date DATE NOT NULL,
                        total_trips INT DEFAULT 0,
                        completed_trips INT DEFAULT 0,
                        total_orders INT DEFAULT 0,
                        completed_orders INT DEFAULT 0,
                        total_distance DECIMAL(10,2) DEFAULT 0.00,
                        total_duration INT DEFAULT 0,
                        fuel_consumption DECIMAL(8,2) DEFAULT 0.00,
                        on_time_deliveries INT DEFAULT 0,
                        late_deliveries INT DEFAULT 0,
                        customer_satisfaction DECIMAL(3,2) DEFAULT 0.00,
                        efficiency_score DECIMAL(5,2) DEFAULT 0.00,
                        notes TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        UNIQUE KEY unique_distributor_date (distributor_id, performance_date),
                        INDEX idx_performance_date (performance_date),
                        INDEX idx_efficiency_score (efficiency_score),
                        FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                `
            },
            {
                name: 'route_optimization_cache',
                sql: `
                    CREATE TABLE IF NOT EXISTS route_optimization_cache (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        cache_key VARCHAR(255) NOT NULL,
                        distributor_id INT,
                        store_ids JSON NOT NULL,
                        optimized_route JSON NOT NULL,
                        total_distance DECIMAL(10,2),
                        total_duration INT,
                        fuel_estimate DECIMAL(8,2),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        expires_at TIMESTAMP NOT NULL,
                        UNIQUE KEY unique_cache_key (cache_key),
                        INDEX idx_distributor (distributor_id),
                        INDEX idx_expires_at (expires_at),
                        FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                `
            },
            {
                name: 'distribution_notifications',
                sql: `
                    CREATE TABLE IF NOT EXISTS distribution_notifications (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        distributor_id INT NOT NULL,
                        notification_type ENUM('schedule_update', 'route_change', 'delay_alert', 'performance_alert', 'system_alert') NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        message TEXT NOT NULL,
                        priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
                        is_read BOOLEAN DEFAULT FALSE,
                        action_required BOOLEAN DEFAULT FALSE,
                        action_url VARCHAR(500),
                        metadata JSON,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        read_at TIMESTAMP NULL,
                        INDEX idx_distributor_read (distributor_id, is_read),
                        INDEX idx_notification_type (notification_type),
                        INDEX idx_priority (priority),
                        INDEX idx_created_at (created_at),
                        FOREIGN KEY (distributor_id) REFERENCES users(id) ON DELETE CASCADE
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                `
            },
            {
                name: 'distribution_settings',
                sql: `
                    CREATE TABLE IF NOT EXISTS distribution_settings (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        setting_key VARCHAR(100) NOT NULL,
                        setting_value TEXT NOT NULL,
                        setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
                        description TEXT,
                        is_system BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        UNIQUE KEY unique_setting_key (setting_key),
                        INDEX idx_setting_type (setting_type)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                `
            }
        ];

        // Execute each migration
        for (const migration of migrations) {
            try {
                console.log(`📋 Creating table: ${migration.name}`);
                await sequelize.query(migration.sql);
                console.log(`✅ Table '${migration.name}' created successfully`);
            } catch (error) {
                console.error(`❌ Error creating table '${migration.name}':`, error.message);
            }
        }

        // Add columns to existing tables
        console.log('\n📋 Adding columns to existing tables...');

        const alterStatements = [
            {
                table: 'orders',
                sql: `
                    ALTER TABLE orders 
                    ADD COLUMN IF NOT EXISTS distribution_trip_id INT NULL,
                    ADD COLUMN IF NOT EXISTS scheduled_delivery_time TIME NULL,
                    ADD COLUMN IF NOT EXISTS actual_delivery_time DATETIME NULL,
                    ADD COLUMN IF NOT EXISTS delivery_notes TEXT NULL,
                    ADD COLUMN IF NOT EXISTS delivery_rating INT NULL,
                    ADD COLUMN IF NOT EXISTS delivery_feedback TEXT NULL
                `
            },
            {
                table: 'users',
                sql: `
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS current_trip_id INT NULL,
                    ADD COLUMN IF NOT EXISTS current_schedule_id INT NULL,
                    ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMP NULL,
                    ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
                    ADD COLUMN IF NOT EXISTS working_status ENUM('available', 'busy', 'break', 'offline') DEFAULT 'offline',
                    ADD COLUMN IF NOT EXISTS daily_quota_orders INT DEFAULT 0,
                    ADD COLUMN IF NOT EXISTS daily_quota_distance DECIMAL(10,2) DEFAULT 0.00
                `
            },
            {
                table: 'stores',
                sql: `
                    ALTER TABLE stores 
                    ADD COLUMN IF NOT EXISTS preferred_delivery_days JSON NULL,
                    ADD COLUMN IF NOT EXISTS delivery_time_slot VARCHAR(50) NULL,
                    ADD COLUMN IF NOT EXISTS delivery_instructions TEXT NULL,
                    ADD COLUMN IF NOT EXISTS last_delivery_date DATE NULL,
                    ADD COLUMN IF NOT EXISTS average_delivery_rating DECIMAL(3,2) DEFAULT 0.00
                `
            }
        ];

        for (const alter of alterStatements) {
            try {
                console.log(`📋 Adding columns to table: ${alter.table}`);
                await sequelize.query(alter.sql);
                console.log(`✅ Columns added to '${alter.table}' successfully`);
            } catch (error) {
                console.error(`❌ Error adding columns to '${alter.table}':`, error.message);
            }
        }

        // Insert default settings
        console.log('\n📋 Inserting default distribution settings...');
        const settingsSQL = `
            INSERT INTO distribution_settings (setting_key, setting_value, setting_type, description, is_system) VALUES
            ('default_visit_duration', '15', 'number', 'Default visit duration in minutes', TRUE),
            ('max_daily_distance', '200', 'number', 'Maximum daily distance in kilometers', TRUE),
            ('max_daily_orders', '50', 'number', 'Maximum orders per distributor per day', TRUE),
            ('route_optimization_enabled', 'true', 'boolean', 'Enable automatic route optimization', TRUE),
            ('real_time_tracking_enabled', 'true', 'boolean', 'Enable real-time location tracking', TRUE),
            ('location_update_interval', '30', 'number', 'Location update interval in seconds', TRUE),
            ('performance_alert_threshold', '80', 'number', 'Performance alert threshold percentage', TRUE),
            ('google_maps_api_key', '', 'string', 'Google Maps API key for route optimization', TRUE),
            ('default_working_hours', '{"start": "08:00", "end": "18:00"}', 'json', 'Default working hours for distributors', TRUE),
            ('break_time_minutes', '60', 'number', 'Total break time in minutes per day', TRUE)
            ON DUPLICATE KEY UPDATE
                setting_value = VALUES(setting_value),
                updated_at = CURRENT_TIMESTAMP
        `;

        try {
            await sequelize.query(settingsSQL);
            console.log('✅ Default distribution settings inserted successfully');
        } catch (error) {
            console.error('❌ Error inserting default settings:', error.message);
        }

        console.log('\n🎉 Simple distribution migration completed!');

    } catch (error) {
        console.error('💥 Migration failed:', error);
    } finally {
        await sequelize.close();
        console.log('🔌 Database connection closed');
    }
};

simpleMigration();
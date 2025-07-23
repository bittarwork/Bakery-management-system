import mysql from 'mysql2/promise';
import smartSchedulingService from '../services/smartSchedulingService.js';
import logger from '../config/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration for Railway production
const dbConfig = {
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    port: 24785
};

/**
 * Create scheduling drafts for existing orders that don't have them
 * This script helps populate the auto-scheduling system with existing orders
 */
async function createMissingSchedulingDrafts() {
    let connection;
    let processedCount = 0;
    let errorCount = 0;
    
    try {
        console.log('🔍 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected successfully');

        // Ensure scheduling_drafts table exists
        console.log('\n📋 Ensuring scheduling_drafts table exists...');
        await ensureSchedulingDraftsTable(connection);

        // Get orders that don't have scheduling drafts
        console.log('\n🔍 Finding orders without scheduling drafts...');
        const query = `
            SELECT 
                o.id,
                o.order_number,
                o.store_id,
                o.total_amount_eur,
                o.total_amount_syp,
                o.order_date,
                o.delivery_date,
                o.priority,
                o.status,
                o.created_at,
                s.name as store_name
            FROM orders o
            LEFT JOIN stores s ON o.store_id = s.id
            LEFT JOIN scheduling_drafts sd ON o.id = sd.order_id
            WHERE sd.id IS NULL 
                AND o.status IN ('draft', 'confirmed', 'in_progress')
                AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            ORDER BY o.created_at DESC
            LIMIT 50
        `;

        const [orders] = await connection.execute(query);
        
        if (orders.length === 0) {
            console.log('✅ No orders found that need scheduling drafts');
            return;
        }

        console.log(`\n📦 Found ${orders.length} orders that need scheduling drafts`);
        console.log('🚀 Starting to create scheduling drafts...\n');

        // Process each order
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            
            try {
                console.log(`⏳ Processing order ${i + 1}/${orders.length}: ${order.order_number} (${order.store_name})`);
                
                // Create scheduling draft using smart service
                const result = await smartSchedulingService.createSchedulingDraft(
                    {
                        id: order.id,
                        order_number: order.order_number,
                        store_id: order.store_id,
                        total_amount_eur: order.total_amount_eur,
                        total_amount_syp: order.total_amount_syp,
                        order_date: order.order_date,
                        delivery_date: order.delivery_date,
                        priority: order.priority || 'normal'
                    },
                    1 // System user ID
                );

                if (result.success) {
                    processedCount++;
                    console.log(`✅ Created scheduling draft ${result.draft_id} for order ${order.order_number}`);
                } else {
                    errorCount++;
                    console.log(`❌ Failed to create draft for order ${order.order_number}: ${result.message}`);
                }

                // Small delay to avoid overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                errorCount++;
                console.error(`❌ Error processing order ${order.order_number}:`, error.message);
            }
        }

        console.log('\n🎉 Processing completed!');
        console.log(`✅ Successfully created: ${processedCount} scheduling drafts`);
        console.log(`❌ Errors encountered: ${errorCount}`);
        
        if (processedCount > 0) {
            console.log('\n📋 Summary of created drafts:');
            const [summaryResults] = await connection.execute(`
                SELECT 
                    COUNT(*) as total_drafts,
                    AVG(confidence_score) as avg_confidence,
                    COUNT(CASE WHEN status = 'pending_review' THEN 1 END) as pending_review,
                    COUNT(CASE WHEN confidence_score > 80 THEN 1 END) as high_confidence
                FROM scheduling_drafts 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            const summary = summaryResults[0];
            console.log(`   📊 Total drafts in system: ${summary.total_drafts}`);
            console.log(`   🎯 Average confidence: ${Math.round(summary.avg_confidence)}%`);
            console.log(`   ⏳ Pending review: ${summary.pending_review}`);
            console.log(`   🌟 High confidence (>80%): ${summary.high_confidence}`);
        }

    } catch (error) {
        console.error('❌ Script failed:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔚 Database connection closed');
        }
    }
}

/**
 * Ensure scheduling_drafts table exists
 */
async function ensureSchedulingDraftsTable(connection) {
    try {
        // Check if table exists
        const [tables] = await connection.execute(`
            SHOW TABLES LIKE 'scheduling_drafts'
        `);

        if (tables.length === 0) {
            console.log('📦 Creating scheduling_drafts table...');
            
            const createTableQuery = `
                CREATE TABLE scheduling_drafts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT NOT NULL,
                    suggested_distributor_id INT NOT NULL,
                    suggested_distributor_name VARCHAR(100) NOT NULL,
                    confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
                    suggested_delivery_date DATE NOT NULL,
                    suggested_priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
                    reasoning JSON,
                    alternative_suggestions JSON,
                    route_optimization JSON,
                    estimated_delivery_time TIME,
                    estimated_duration INT COMMENT 'Duration in minutes',
                    status ENUM('pending_review', 'approved', 'rejected', 'modified') NOT NULL DEFAULT 'pending_review',
                    reviewed_by INT NULL,
                    reviewed_at TIMESTAMP NULL,
                    admin_notes TEXT,
                    modifications JSON,
                    approved_distributor_id INT NULL,
                    approved_delivery_date DATE NULL,
                    approved_priority ENUM('low', 'normal', 'high', 'urgent') NULL,
                    created_by INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    INDEX idx_order_id (order_id),
                    INDEX idx_status (status),
                    INDEX idx_suggested_distributor_id (suggested_distributor_id),
                    INDEX idx_confidence_score (confidence_score),
                    INDEX idx_created_at (created_at),
                    INDEX idx_suggested_delivery_date (suggested_delivery_date),
                    
                    UNIQUE KEY unique_order_draft (order_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `;

            await connection.execute(createTableQuery);
            console.log('✅ scheduling_drafts table created successfully');
        } else {
            console.log('✅ scheduling_drafts table already exists');
        }
    } catch (error) {
        console.error('Error ensuring scheduling_drafts table:', error);
        throw error;
    }
}

// Display usage information
function showUsage() {
    console.log(`
🚀 Create Missing Scheduling Drafts Script
==========================================

This script creates scheduling drafts for existing orders that don't have them.
It helps populate the auto-scheduling system with historical orders.

Usage:
  node scripts/create-missing-scheduling-drafts.js

What it does:
  ✅ Finds orders without scheduling drafts (last 30 days)
  ✅ Creates intelligent scheduling suggestions using AI
  ✅ Processes up to 50 orders at a time
  ✅ Provides detailed progress and summary reports

Requirements:
  - Database connection to Railway
  - Smart scheduling service functional
  - Orders and stores tables populated

Notes:
  - Only processes recent orders (last 30 days)
  - Skips cancelled and delivered orders
  - Creates drafts with 'pending_review' status
  - Safe to run multiple times (won't create duplicates)
    `);
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
    process.exit(0);
}

// Run the script
console.log('🚀 Starting Create Missing Scheduling Drafts Script...\n');
createMissingSchedulingDrafts()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    }); 
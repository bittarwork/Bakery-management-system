import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables from config.env
dotenv.config({ path: './config.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

async function createVehiclesTable() {
    let connection;
    try {
        console.log('🔍 Connecting to database...');
        console.log(`Host: ${config.host}:${config.port}`);
        console.log(`Database: ${config.database}`);

        connection = await mysql.createConnection(config);
        console.log('✅ Database connected successfully');

        // Read the SQL migration file
        console.log('\n📄 Reading migration file...');
        const migrationPath = join(__dirname, '../migrations/create-vehicles-table.sql');
        const migrationSQL = readFileSync(migrationPath, 'utf8');

        console.log('📝 Raw SQL content length:', migrationSQL.length);

        // Split the SQL into individual statements - improved parsing
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => {
                // Filter out empty statements and comment-only lines
                if (!stmt || stmt.length === 0) return false;
                if (stmt.startsWith('--') && !stmt.includes('CREATE') && !stmt.includes('INSERT')) return false;
                return true;
            });

        console.log(`📋 Found ${statements.length} SQL statements to execute`);

        // Debug: show first few characters of each statement
        statements.forEach((stmt, index) => {
            console.log(`Statement ${index + 1}: ${stmt.substring(0, 50)}...`);
        });

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement) {
                console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}...`);
                try {
                    await connection.execute(statement);
                    console.log('✅ Statement executed successfully');
                } catch (error) {
                    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                        console.log('⚠️  Table already exists, skipping...');
                    } else {
                        console.error(`❌ Error executing statement: ${error.message}`);
                        throw error;
                    }
                }
            }
        }

        // Verify table creation
        console.log('\n🔍 Verifying vehicles table...');
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'vehicles'
        `, [config.database]);

        if (tables.length > 0) {
            console.log('✅ Vehicles table created successfully');

            // Get table structure
            console.log('\n📋 Table structure:');
            const [structure] = await connection.execute('DESCRIBE vehicles');
            console.table(structure);

            // Get count of vehicles
            const [count] = await connection.execute('SELECT COUNT(*) as count FROM vehicles');
            console.log(`\n📊 Total vehicles in table: ${count[0].count}`);

            if (count[0].count > 0) {
                console.log('\n🚗 Sample vehicles:');
                const [vehicles] = await connection.execute(`
                    SELECT id, vehicle_type, vehicle_model, vehicle_plate, status, 
                           assigned_distributor_id 
                    FROM vehicles 
                    LIMIT 5
                `);
                console.table(vehicles);
            }
        } else {
            console.log('❌ Failed to create vehicles table');
        }

    } catch (error) {
        console.error('💥 Migration failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the migration
console.log('🚀 Starting vehicles table migration...');
createVehiclesTable()
    .then(() => {
        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Migration failed:', error);
        process.exit(1);
    }); 
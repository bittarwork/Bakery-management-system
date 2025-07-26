import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSequelizeConnection } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyDistributorWorkloadMigration() {
    console.log('🚀 Starting distributor workload migration...');
    
    try {
        const sequelize = await getSequelizeConnection();
        
        // Read the SQL migration file
        const migrationPath = path.join(__dirname, '..', 'migrations', 'add-distributor-workload-fields.sql');
        const sqlContent = fs.readFileSync(migrationPath, 'utf8');
        
        // Split by semicolon and filter out empty statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📄 Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`⚡ Executing statement ${i + 1}/${statements.length}:`);
            console.log(`   ${statement.substring(0, 50)}...`);
            
            try {
                await sequelize.query(statement);
                console.log(`✅ Statement ${i + 1} executed successfully`);
            } catch (error) {
                if (error.message.includes('Duplicate column name')) {
                    console.log(`⚠️  Column already exists, skipping statement ${i + 1}`);
                } else {
                    console.error(`❌ Error executing statement ${i + 1}:`, error.message);
                    throw error;
                }
            }
        }
        
        // Verify the changes
        console.log('\n🔍 Verifying migration results...');
        
        const [results] = await sequelize.query(`
            SELECT COUNT(*) as distributor_count 
            FROM users 
            WHERE role = 'distributor' AND status = 'active'
        `);
        
        console.log(`📊 Found ${results[0].distributor_count} active distributors`);
        
        // Show sample of updated distributors
        const [distributors] = await sequelize.query(`
            SELECT id, full_name, current_workload, performance_rating, last_active
            FROM users 
            WHERE role = 'distributor' 
            LIMIT 3
        `);
        
        console.log('\n👥 Sample distributors with new fields:');
        distributors.forEach(dist => {
            console.log(`   - ${dist.full_name}: Workload=${dist.current_workload}, Rating=${dist.performance_rating}`);
        });
        
        await sequelize.close();
        console.log('\n✅ Migration completed successfully!');
        console.log('🎯 Automatic distributor assignment should now work properly');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run the migration
applyDistributorWorkloadMigration(); 
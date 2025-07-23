const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration for Railway production
const dbConfig = {
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    port: 24785
};

async function runSchedulingMigration() {
    console.log('🚀 Starting Auto-Scheduling Migration...\n');

    let connection;

    try {
        // Connect to database
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database successfully');

        // Read migration file
        const migrationPath = path.join(__dirname, '../migrations/create-scheduling-drafts-table.sql');

        if (!fs.existsSync(migrationPath)) {
            throw new Error(`Migration file not found: ${migrationPath}`);
        }

        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        console.log('✅ Migration file loaded successfully');

        // Split SQL into individual statements
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`\n📋 Found ${statements.length} SQL statements to execute\n`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            try {
                if (statement.includes('CREATE TABLE')) {
                    console.log(`📊 Creating table: scheduling_drafts...`);
                } else if (statement.includes('CREATE INDEX')) {
                    console.log(`🔗 Creating index...`);
                } else if (statement.includes('INSERT INTO')) {
                    console.log(`📝 Inserting sample data...`);
                } else {
                    console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
                }

                await connection.execute(statement);
                console.log(`   ✅ Success!\n`);

            } catch (error) {
                if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log(`   ⚠️  Table already exists, skipping...\n`);
                } else if (error.code === 'ER_DUP_KEYNAME') {
                    console.log(`   ⚠️  Index already exists, skipping...\n`);
                } else if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`   ⚠️  Sample data already exists, skipping...\n`);
                } else {
                    console.error(`   ❌ Error executing statement ${i + 1}:`, error.message);
                    console.error(`   📄 Statement: ${statement.substring(0, 100)}...`);
                    // Continue with other statements
                }
            }
        }

        // Verify table creation
        console.log('🔍 Verifying table structure...');

        const [tableInfo] = await connection.execute(`
            DESCRIBE scheduling_drafts
        `);

        console.log('\n📋 Table structure:');
        console.table(tableInfo.map(field => ({
            Field: field.Field,
            Type: field.Type,
            Null: field.Null,
            Key: field.Key,
            Default: field.Default
        })));

        // Check if sample data exists
        const [sampleCount] = await connection.execute(`
            SELECT COUNT(*) as count FROM scheduling_drafts
        `);

        console.log(`\n📊 Sample data records: ${sampleCount[0].count}`);

        console.log('\n🎉 Auto-Scheduling Migration completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Test creating a new order to trigger auto-scheduling');
        console.log('   2. Check the admin dashboard for pending reviews');
        console.log('   3. Test the approval/rejection workflow');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Database connection closed');
        }
    }
}

// Run migration
runSchedulingMigration(); 
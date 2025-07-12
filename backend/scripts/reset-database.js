import sequelize from '../config/database.js';

console.log('🔄 Starting database reset...');

try {
    // Test database connection first
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Drop all tables and recreate them
    console.log('🗑️ Dropping and recreating tables...');
    await sequelize.sync({ force: true });

    console.log('✅ All tables recreated successfully');
    console.log('🎉 Database reset completed successfully!');

} catch (error) {
    console.error('❌ Database reset error:', error.message);
    console.error('Error details:', error);
} finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
} 
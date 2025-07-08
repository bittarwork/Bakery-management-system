import { up as createAdminUser } from './seeders/20240320000000-admin-user.js';
import { connectDB } from './config/database.js';

const seed = async () => {
    try {
        // Connect to database
        await connectDB();

        // Run seeders
        await createAdminUser();

        console.log('✅ Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seed(); 
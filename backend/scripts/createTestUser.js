import bcrypt from 'bcrypt';
import { initializeModels } from '../models/index.js';
import User from '../models/User.js';

const createTestUser = async () => {
    try {
        console.log('🔄 Creating test user...');

        // Initialize database
        await initializeModels();

        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Check if user already exists
        const existingUser = await User.findOne({
            where: { email: 'admin@example.com' }
        });

        if (existingUser) {
            console.log('⚠️ User already exists');
            console.log('Email: admin@example.com');
            console.log('Password: password123');
            return;
        }

        // Create user
        const user = await User.create({
            username: 'admin',
            full_name: 'مدير النظام',
            email: 'admin@example.com',
            password: 'password123', // سيتم hash تلقائياً بواسطة beforeCreate hook
            role: 'admin',
            phone: '123456789',
            status: 'active'
        });

        console.log('✅ Test user created successfully!');
        console.log('═'.repeat(40));
        console.log('📧 Email: admin@example.com');
        console.log('🔐 Password: password123');
        console.log('👤 Role: admin');
        console.log('🆔 ID:', user.id);
        console.log('═'.repeat(40));
        console.log('You can now login using these credentials');

    } catch (error) {
        console.error('❌ Error creating test user:', error);
    } finally {
        process.exit(0);
    }
};

createTestUser(); 
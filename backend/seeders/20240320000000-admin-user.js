import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const up = async () => {
    try {
        // Check if admin user already exists
        const existingAdmin = await User.findOne({
            where: {
                username: 'admin'
            }
        });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            return;
        }

        // Create admin user (password will be hashed automatically by the model)
        await User.create({
            username: 'admin',
            email: 'admin@bakery.com',
            password: 'admin123', // Will be hashed to password_hash by the model
            full_name: 'مدير النظام',
            role: 'admin',
            is_active: true
        });

        console.log('✅ Admin user created successfully');
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        throw error;
    }
};

export const down = async () => {
    try {
        // Remove admin user
        await User.destroy({
            where: {
                username: 'admin'
            }
        });

        console.log('✅ Admin user removed successfully');
    } catch (error) {
        console.error('❌ Error removing admin user:', error);
        throw error;
    }
}; 
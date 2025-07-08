import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const up = async () => {
    try {
        // Create admin user
        await User.create({
            username: 'admin',
            email: 'admin@bakery.com',
            password_hash: 'admin123',
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
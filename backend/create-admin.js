import User from './models/User.js';
import sequelize from './config/database.js';
import bcrypt from 'bcryptjs';

const createAdmin = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // Delete existing admin user if exists
        await User.destroy({
            where: {
                username: 'admin'
            }
        });
        console.log('🗑️ Existing admin user deleted');

        // Hash the password manually
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);
        console.log('🔒 Password hashed successfully');

        // Create new admin user
        const admin = await User.create({
            username: 'admin',
            email: 'admin@bakery.com',
            password: hashedPassword,
            full_name: 'مدير النظام',
            role: 'admin',
            is_active: true
        });

        console.log('✅ Admin user created successfully');
        console.log('📋 Admin details:', {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            full_name: admin.full_name,
            role: admin.role,
            is_active: admin.is_active
        });

        // Test password comparison
        const isPasswordValid = await admin.comparePassword('admin123');
        console.log('🔐 Password test:', isPasswordValid ? '✅ Valid' : '❌ Invalid');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin(); 
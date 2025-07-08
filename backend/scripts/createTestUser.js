import bcrypt from 'bcrypt';
import { initializeModels } from '../models/index.js';
import User from '../models/User.js';

const createTestUser = async () => {
    try {
        console.log('🔄 جاري إنشاء مستخدم للاختبار...');

        // Initialize database
        await initializeModels();

        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Check if user already exists
        const existingUser = await User.findOne({
            where: { email: 'admin@example.com' }
        });

        if (existingUser) {
            console.log('⚠️ المستخدم موجود مسبقاً');
            console.log('Email: admin@example.com');
            console.log('Password: password123');
            return;
        }

        // Create user
        const user = await User.create({
            username: 'admin',
            full_name: 'مدير النظام',
            email: 'admin@example.com',
            password_hash: 'password123', // سيتم hash تلقائياً بواسطة beforeCreate hook
            role: 'admin',
            phone: '123456789',
            is_active: true
        });

        console.log('✅ تم إنشاء المستخدم بنجاح!');
        console.log('═'.repeat(40));
        console.log('📧 Email: admin@example.com');
        console.log('🔐 Password: password123');
        console.log('👤 Role: admin');
        console.log('🆔 ID:', user.id);
        console.log('═'.repeat(40));
        console.log('يمكنك الآن تسجيل الدخول باستخدام هذه البيانات');

    } catch (error) {
        console.error('❌ خطأ في إنشاء المستخدم:', error);
    } finally {
        process.exit(0);
    }
};

createTestUser(); 
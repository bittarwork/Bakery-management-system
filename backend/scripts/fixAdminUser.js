import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const fixAdminUser = async () => {
    try {
        console.log('🔧 Fixing admin user...');

        // البحث عن مستخدم admin
        const adminUser = await User.findOne({
            where: {
                username: 'admin'
            }
        });

        if (!adminUser) {
            console.log('❌ Admin user not found!');
            return;
        }

        console.log('✅ Admin user found:', {
            username: adminUser.username,
            email: adminUser.email,
            role: adminUser.role,
            status: adminUser.status
        });

        // تفعيل المستخدم إذا كان غير مفعل
        if (adminUser.status !== 'active') {
            console.log('🔄 Activating admin user...');
            adminUser.status = 'active';
            await adminUser.save();
            console.log('✅ Admin user activated successfully!');
        } else {
            console.log('✅ Admin user is already active');
        }

        // التحقق من كلمة المرور وإعادة تشفيرها إذا لزم الأمر
        console.log('🔍 Testing password...');
        const testPassword = 'admin123';
        const isPasswordValid = await adminUser.comparePassword(testPassword);

        if (!isPasswordValid) {
            console.log('🔄 Password seems incorrect, resetting...');
            // إعادة تعيين كلمة المرور
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
            const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
            adminUser.password = hashedPassword;
            await adminUser.save();
            console.log('✅ Password reset successfully!');
        } else {
            console.log('✅ Password is correct');
        }

        // اختبار تسجيل الدخول
        console.log('🧪 Testing login...');
        try {
            const loginTest = await User.findByCredentials('admin', testPassword);
            console.log('✅ Login test successful!');
            console.log('📋 User details:', {
                username: loginTest.username,
                email: loginTest.email,
                role: loginTest.role,
                status: loginTest.status
            });
        } catch (error) {
            console.log('❌ Login test failed:', error.message);
        }

        console.log('🎉 Admin user fix completed!');

    } catch (error) {
        console.error('❌ Error fixing admin user:', error);
    }
};

// تشغيل السكريبت
fixAdminUser()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }); 
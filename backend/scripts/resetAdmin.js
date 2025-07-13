import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';

const sequelize = new Sequelize('railway', 'root', 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA', {
    host: 'shinkansen.proxy.rlwy.net',
    port: 24785,
    dialect: 'mysql',
    logging: false,
});

async function resetAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database!');

        // تحقق من وجود الأدمن
        const [admins] = await sequelize.query("SELECT * FROM users WHERE username = 'admin'");
        const password = await bcrypt.hash('admin123', 12);

        if (admins.length > 0) {
            // تحديث كلمة المرور والحالة
            await sequelize.query("UPDATE users SET password = :password, status = 'active' WHERE username = 'admin'", {
                replacements: { password },
            });
            console.log('🔑 Admin password reset to admin123 and status set to active!');
        } else {
            // إنشاء حساب أدمن جديد
            await sequelize.query(`INSERT INTO users (username, email, password, full_name, phone, role, status, email_verified, created_by_name)
        VALUES ('admin', 'admin@bakery.com', :password, 'System Admin', '+32-123-456-789', 'admin', 'active', 1, 'System')`, {
                replacements: { password },
            });
            console.log('🆕 Admin user created with username "admin" and password "admin123"!');
        }
        await sequelize.close();
        console.log('🎉 Done!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetAdmin(); 
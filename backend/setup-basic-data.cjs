const mysql = require('mysql2/promise');

// إعدادات قاعدة البيانات
const dbConfig = {
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    port: 24785,
    database: 'railway',
    charset: 'utf8mb4'
};

async function insertBasicData() {
    let connection;

    try {
        console.log('🔄 Connecting to Railway database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected successfully!');

        // 1. إدراج المستخدمين الأساسيين
        console.log('👥 Inserting users...');
        await connection.execute(`
            INSERT IGNORE INTO users (username, email, password, full_name, phone, role, status, email_verified, created_by_name) VALUES
            ('admin', 'admin@bakery.com', '$2b$12$LQv3c1yqBwEHFigPRgOCKO.2QHz/a1Qz5xGY7JR.ZjXqKlZGJnx/a', 'مدير النظام', '+32-123-456-789', 'admin', 'active', TRUE, 'System'),
            ('manager', 'manager@bakery.com', '$2b$12$LQv3c1yqBwEHFigPRgOCKO.2QHz/a1Qz5xGY7JR.ZjXqKlZGJnx/a', 'مدير العمليات', '+32-123-456-790', 'manager', 'active', TRUE, 'System'),
            ('distributor1', 'distributor1@bakery.com', '$2b$12$LQv3c1yqBwEHFigPRgOCKO.2QHz/a1Qz5xGY7JR.ZjXqKlZGJnx/a', 'محمد الموزع', '+32-123-456-791', 'distributor', 'active', TRUE, 'System')
        `);

        // 2. إدراج المنتجات الأساسية
        console.log('🍞 Inserting products...');
        await connection.execute(`
            INSERT IGNORE INTO products (name, description, unit, price_eur, price_syp, cost_eur, cost_syp, category, barcode, is_active) VALUES
            ('خبز أبيض فرنسي', 'خبز فرنسي طازج يومياً', 'رغيف', 2.50, 4500.00, 1.20, 2160.00, 'خبز', '2001001', TRUE),
            ('كرواسان زبدة', 'كرواسان فرنسي بالزبدة', 'قطعة', 4.50, 8100.00, 2.20, 3960.00, 'معجنات', '2002001', TRUE),
            ('كيك الفانيليا', 'كيك الفانيليا الكلاسيكي', 'قطعة', 15.00, 27000.00, 7.50, 13500.00, 'كعك', '2003001', TRUE),
            ('قهوة إسبريسو', 'قهوة إسبريسو إيطالية', 'كوب', 2.80, 5040.00, 1.40, 2520.00, 'مشروبات', '2006001', TRUE),
            ('فطيرة السبانخ', 'فطيرة محشوة بالسبانخ والجبن', 'قطعة', 4.80, 8640.00, 2.40, 4320.00, 'فطائر', '2005001', TRUE)
        `);

        // 3. إدراج المحلات الأساسية (باستخدام أعمدة صحيحة)
        console.log('🏪 Inserting stores...');
        await connection.execute(`
            INSERT IGNORE INTO stores (name, owner_name, phone, address, store_type, category, created_by_name) VALUES
            ('سوبرماركت الأمل', 'عبدالله بن سعد', '+32-123-456-800', 'شارع الملك فيصل، بروكسل', 'retail', 'supermarket', 'System'),
            ('مقهى الياسمين', 'مريم الخضراء', '+32-123-456-801', 'شارع العرب، أنتويرب', 'retail', 'cafe', 'System'),
            ('مطعم دمشق', 'حسام الدين', '+32-123-456-802', 'حي الشام، غنت', 'retail', 'restaurant', 'System')
        `);

        console.log('\n🔍 Database summary:');

        // عرض إحصائيات الجداول
        const [users] = await connection.execute(`SELECT COUNT(*) as count FROM users`);
        const [products] = await connection.execute(`SELECT COUNT(*) as count FROM products`);
        const [stores] = await connection.execute(`SELECT COUNT(*) as count FROM stores`);

        console.log(`   📊 المستخدمين: ${users[0].count} سجل`);
        console.log(`   📊 المنتجات: ${products[0].count} سجل`);
        console.log(`   📊 المحلات: ${stores[0].count} سجل`);

        // اختبار بيانات admin
        console.log('\n🔐 Admin Login Info:');
        const [admin] = await connection.execute('SELECT username, email, role FROM users WHERE role = "admin" LIMIT 1');
        if (admin.length > 0) {
            console.log(`   👤 Username: ${admin[0].username}`);
            console.log(`   📧 Email: ${admin[0].email}`);
            console.log(`   🔑 Password: admin123`);
            console.log(`   🎯 Role: ${admin[0].role}`);
        }

        return true;

    } catch (error) {
        console.error('❌ Data insertion failed:');
        console.error(error.message);
        return false;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed.');
        }
    }
}

// تشغيل إدراج البيانات الأساسية
if (require.main === module) {
    insertBasicData().then(success => {
        if (success) {
            console.log('\n🎉 Basic data inserted successfully!');
            console.log('Your bakery management system is now ready!');
            console.log('\n🚀 Next steps:');
            console.log('1. Start your backend server: npm start');
            console.log('2. Login with admin credentials');
            console.log('3. Start managing your bakery!');
        } else {
            console.log('\n💥 Data insertion failed!');
            process.exit(1);
        }
    });
}

module.exports = insertBasicData; 
const bcrypt = require('bcrypt');

async function generateHash() {
    const password = 'password123';
    const saltRounds = 12;

    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Password:', password);
        console.log('Hash:', hash);

        // التحقق من صحة الـ hash
        const isValid = await bcrypt.compare(password, hash);
        console.log('Hash is valid:', isValid);

        // إنشاء SQL للتحديث
        console.log('\n--- SQL Update Commands ---');
        console.log(`UPDATE users SET password_hash = '${hash}' WHERE username = 'admin';`);
        console.log(`UPDATE users SET password_hash = '${hash}' WHERE username = 'manager1';`);
        console.log(`UPDATE users SET password_hash = '${hash}' WHERE username = 'distributor1';`);
        console.log(`UPDATE users SET password_hash = '${hash}' WHERE username = 'distributor2';`);

    } catch (error) {
        console.error('Error generating hash:', error);
    }
}

generateHash(); 
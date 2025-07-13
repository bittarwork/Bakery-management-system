import bcrypt from 'bcrypt';

// Generate password hashes with 12 salt rounds (matching the User model)
async function generatePasswordHashes() {
    console.log('🔐 Generating password hashes with 12 salt rounds...\n');

    const passwords = [
        'admin123',
        'manager123',
        'distributor123',
        'store123'
    ];

    console.log('Password hashes for SQL seeders:');
    console.log('=====================================\n');

    for (const password of passwords) {
        const hash = await bcrypt.hash(password, 12);
        console.log(`Password: "${password}"`);
        console.log(`Hash: "${hash}"`);
        console.log('---');
    }

    console.log('\n✅ All password hashes generated successfully!');
    console.log('📝 Copy these hashes to your SQL seeders file.');
}

// Run the function
generatePasswordHashes().catch(console.error); 
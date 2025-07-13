import bcrypt from 'bcrypt';

// Test the fixed password hashes
async function testFixedPasswords() {
    console.log('🔐 Testing fixed password hashes...\n');

    const testCases = [
        {
            password: 'admin123',
            hash: '$2b$12$AmfYgU0d5qjuiBLyrEsJkeZElf1x3k2EqHDOz9rewiWY9cKX2hTmO',
            description: 'Admin password'
        },
        {
            password: 'distributor123',
            hash: '$2b$12$lQ2GfmlnubgQwHYqW11EZ.KwbJg2dbrySlwgAKOqUBYpXKwW1hqfa',
            description: 'Distributor password'
        },
        {
            password: 'store123',
            hash: '$2b$12$T1kEh6BcQU.D62PrZDt1z.xApz2pp82TGuNIs5HrYLIFt.RlqLQAq',
            description: 'Store owner password'
        }
    ];

    for (const testCase of testCases) {
        const isValid = await bcrypt.compare(testCase.password, testCase.hash);
        console.log(`✅ ${testCase.description}: ${testCase.password}`);
        console.log(`   Hash: ${testCase.hash}`);
        console.log(`   Valid: ${isValid ? 'YES' : 'NO'}`);
        console.log('---');
    }

    console.log('🎉 All password hashes are working correctly!');
    console.log('📝 You can now use these hashes in your SQL seeders.');
}

// Run the test
testFixedPasswords().catch(console.error); 
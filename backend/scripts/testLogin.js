import { initializeModels } from '../models/index.js';
import User from '../models/User.js';

const testLogin = async () => {
    try {
        console.log('🔄 Testing login functionality...');

        // Initialize database
        await initializeModels();

        // Test credentials
        const testCredentials = [
            { username: 'admin', password: 'admin123' },
            { username: 'manager', password: 'admin123' },
            { username: 'distributor1', password: 'admin123' }
        ];

        for (const cred of testCredentials) {
            console.log(`\n🔍 Testing: ${cred.username}`);

            try {
                // Find user
                const user = await User.findOne({
                    where: {
                        username: cred.username,
                        status: 'active'
                    }
                });

                if (!user) {
                    console.log('❌ User not found');
                    continue;
                }

                console.log('✅ User found:', user.username);
                console.log('Role:', user.role);
                console.log('Status:', user.status);

                // Test password comparison
                const isMatch = await user.comparePassword(cred.password);
                console.log('Password match:', isMatch);

                if (isMatch) {
                    console.log('🎉 Login successful!');
                } else {
                    console.log('❌ Password incorrect');
                }

            } catch (error) {
                console.log('❌ Error:', error.message);
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        process.exit(0);
    }
};

testLogin(); 
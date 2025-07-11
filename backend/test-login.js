import axios from 'axios';

const testLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });

        console.log('✅ Login successful!');
        console.log('📋 Response:', {
            success: response.data.success,
            message: response.data.message,
            user: response.data.data?.user,
            token: response.data.data?.token ? 'Token received' : 'No token'
        });

    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
    }
};

testLogin(); 
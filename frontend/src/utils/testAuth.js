// Utility للاختبار السريع - يمكن استخدامه في console المتصفح

export const loginForTesting = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@example.com', // استخدم إيميل موجود في النظام
                password: 'password123'      // استخدم كلمة المرور الصحيحة
            })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log('✅ تم تسجيل الدخول بنجاح');
            console.log('User:', data.user);
            window.location.reload(); // إعادة تحميل الصفحة
        } else {
            console.error('❌ فشل في تسجيل الدخول:', data.message);
        }
    } catch (error) {
        console.error('❌ خطأ في الشبكة:', error);
    }
};

export const logoutForTesting = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ تم تسجيل الخروج');
    window.location.reload();
};

export const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        console.log('✅ المستخدم مسجل دخول');
        console.log('User:', JSON.parse(user));
        console.log('Token:', token.substring(0, 20) + '...');
    } else {
        console.log('❌ المستخدم غير مسجل دخول');
    }
};

// في console المتصفح، يمكنك استخدام:
// import * as testAuth from './utils/testAuth.js'
// testAuth.loginForTesting()
// testAuth.checkAuthStatus()
// testAuth.logoutForTesting() 
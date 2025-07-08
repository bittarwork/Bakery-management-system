import { useToastContext } from '../components/common';

// Hook للحصول على toast من context مع fallback
const useGlobalToast = () => {
    try {
        return useToastContext();
    } catch (error) {
        // إذا لم يكن في context، استخدم console.log كـ fallback
        return {
            success: (msg) => console.log('✅ Success:', msg),
            error: (msg) => console.log('❌ Error:', msg),
            info: (msg) => console.log('ℹ️ Info:', msg),
            warning: (msg) => console.log('⚠️ Warning:', msg),
        };
    }
};

export default useGlobalToast; 
import { useState, useCallback } from 'react';

const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const toast = {
            id,
            message,
            type,
            duration,
        };

        setToasts(prev => [...prev, toast]);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, duration = 4000) => {
        return addToast(message, 'success', duration);
    }, [addToast]);

    const error = useCallback((message, duration = 6000) => {
        return addToast(message, 'error', duration);
    }, [addToast]);

    const warning = useCallback((message, duration = 5000) => {
        return addToast(message, 'warning', duration);
    }, [addToast]);

    const info = useCallback((message, duration = 4000) => {
        return addToast(message, 'info', duration);
    }, [addToast]);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    const showToast = useCallback((message, type = 'info', duration) => {
        return addToast(message, type, duration);
    }, [addToast]);

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
        clearAll,
        showToast,
    };
};

export default useToast; 
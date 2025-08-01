import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

/**
 * Custom hook to track user activity and update session
 * This helps extend session based on user interaction
 */
const useActivityTracker = () => {
    const { updateActivity, isAuthenticated } = useAuthStore();

    // Throttle activity updates to avoid excessive calls
    const throttledUpdateActivity = useCallback(() => {
        let lastUpdate = 0;
        const THROTTLE_DELAY = 60000; // 1 minute

        return () => {
            const now = Date.now();
            if (now - lastUpdate >= THROTTLE_DELAY) {
                updateActivity();
                lastUpdate = now;
            }
        };
    }, [updateActivity])();

    useEffect(() => {
        // Only track activity if user is authenticated
        if (!isAuthenticated) return;

        // Events that indicate user activity
        const activityEvents = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        // Add event listeners
        activityEvents.forEach(event => {
            document.addEventListener(event, throttledUpdateActivity, { passive: true });
        });

        // Track page visibility changes
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                throttledUpdateActivity();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Track focus events
        const handleFocus = () => {
            throttledUpdateActivity();
        };

        window.addEventListener('focus', handleFocus);

        // Cleanup function
        return () => {
            activityEvents.forEach(event => {
                document.removeEventListener(event, throttledUpdateActivity);
            });
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [isAuthenticated, throttledUpdateActivity]);

    return {
        // Manually trigger activity update
        updateActivity: throttledUpdateActivity
    };
};

export default useActivityTracker;
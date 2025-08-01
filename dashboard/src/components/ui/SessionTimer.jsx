import React, { useState, useEffect } from 'react';
import { Clock, Wifi, WifiOff } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import sessionManager from '../../utils/sessionManager';

/**
 * Session Timer Component - Shows remaining session time in header/navbar
 */
const SessionTimer = ({ className = '', showIcon = true, compact = false }) => {
    const { isAuthenticated, sessionTimeRemaining } = useAuthStore();
    const [timeLeft, setTimeLeft] = useState('');
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        // Update online status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            setTimeLeft('');
            return;
        }

        const updateTimer = () => {
            const formatted = sessionManager.getRemainingTimeFormatted();
            setTimeLeft(formatted);
        };

        // Update immediately
        updateTimer();
        
        // Update every minute for performance
        const interval = setInterval(updateTimer, 60000);
        
        return () => clearInterval(interval);
    }, [isAuthenticated, sessionTimeRemaining]);

    // Don't render if not authenticated
    if (!isAuthenticated || !timeLeft) {
        return null;
    }

    const remaining = sessionManager.getRemainingTime();
    const isLowTime = remaining <= 15 * 60 * 1000; // Less than 15 minutes
    const isCritical = remaining <= 5 * 60 * 1000; // Less than 5 minutes

    return (
        <div className={`flex items-center space-x-2 rtl:space-x-reverse ${className}`}>
            {showIcon && (
                <div className="flex items-center">
                    <Clock 
                        className={`h-4 w-4 ${
                            isCritical 
                                ? 'text-red-500 animate-pulse' 
                                : isLowTime 
                                    ? 'text-amber-500' 
                                    : 'text-gray-500'
                        }`} 
                    />
                    {/* Connection status indicator */}
                    <div className="ml-1">
                        {isOnline ? (
                            <Wifi className="h-3 w-3 text-green-500" />
                        ) : (
                            <WifiOff className="h-3 w-3 text-red-500" />
                        )}
                    </div>
                </div>
            )}
            
            {!compact && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                    الجلسة:
                </span>
            )}
            
            <span 
                className={`font-mono text-sm font-medium ${
                    isCritical 
                        ? 'text-red-600 dark:text-red-400 animate-pulse' 
                        : isLowTime 
                            ? 'text-amber-600 dark:text-amber-400' 
                            : 'text-gray-700 dark:text-gray-300'
                }`}
                title={`الجلسة تنتهي في ${timeLeft}`}
            >
                {timeLeft}
            </span>
            
            {isCritical && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
        </div>
    );
};

export default SessionTimer;
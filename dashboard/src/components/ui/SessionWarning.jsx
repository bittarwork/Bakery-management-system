import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import sessionManager from '../../utils/sessionManager';

const SessionWarning = () => {
    const { 
        showSessionWarning, 
        sessionTimeRemaining, 
        renewSession, 
        dismissSessionWarning,
        logout 
    } = useAuthStore();
    
    const [timeLeft, setTimeLeft] = useState('');
    const [isRenewing, setIsRenewing] = useState(false);

    useEffect(() => {
        if (showSessionWarning) {
            const updateTimer = () => {
                const formatted = sessionManager.getRemainingTimeFormatted();
                setTimeLeft(formatted);
            };

            // Update immediately
            updateTimer();
            
            // Update every second for better UX
            const interval = setInterval(updateTimer, 1000);
            
            return () => clearInterval(interval);
        }
    }, [showSessionWarning, sessionTimeRemaining]);

    const handleRenewSession = async () => {
        setIsRenewing(true);
        try {
            const renewed = renewSession();
            if (renewed) {
                dismissSessionWarning();
            } else {
                // If renewal failed, logout
                logout();
            }
        } catch (error) {
            console.error('Error renewing session:', error);
            logout();
        } finally {
            setIsRenewing(false);
        }
    };

    const handleLogout = () => {
        logout();
    };

    if (!showSessionWarning) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg"
            >
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <Clock className="h-4 w-4 text-white" />
                                    <p className="text-white font-medium text-sm">
                                        سينتهي تسجيل الدخول خلال: 
                                        <span className="font-mono font-bold mx-2 bg-white/20 px-2 py-1 rounded">
                                            {timeLeft}
                                        </span>
                                    </p>
                                </div>
                                <p className="text-white/80 text-xs mt-1">
                                    يمكنك تجديد الجلسة أو إعادة تسجيل الدخول
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <button
                                onClick={handleRenewSession}
                                disabled={isRenewing}
                                className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    isRenewing
                                        ? 'bg-white/20 text-white/60 cursor-not-allowed'
                                        : 'bg-white text-amber-600 hover:bg-gray-100 focus:bg-gray-100'
                                }`}
                            >
                                {isRenewing ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 ml-1.5 animate-spin" />
                                        جاري التجديد...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4 ml-1.5" />
                                        تجديد الجلسة
                                    </>
                                )}
                            </button>
                            
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:bg-red-700 transition-colors duration-200"
                            >
                                تسجيل خروج
                            </button>
                            
                            <button
                                onClick={dismissSessionWarning}
                                className="p-1.5 rounded-md text-white hover:bg-white/20 focus:bg-white/20 transition-colors duration-200"
                                aria-label="إخفاء التحذير"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SessionWarning;
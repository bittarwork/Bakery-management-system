import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import useActivityTracker from '../hooks/useActivityTracker';
import SessionWarning from '../components/ui/SessionWarning';

/**
 * Session Provider Component
 * Handles session management, activity tracking, and warning display
 * Should be placed high in the component tree (e.g., in App.js)
 */
const SessionProvider = ({ children }) => {
    const { initializeAuth, isAuthenticated } = useAuthStore();
    
    // Initialize activity tracking
    useActivityTracker();

    useEffect(() => {
        // Initialize authentication and session management
        initializeAuth();
    }, [initializeAuth]);

    return (
        <>
            <SessionWarning />
            {children}
        </>
    );
};

export default SessionProvider;
import Cookies from 'js-cookie';

// Session management utility class
class SessionManager {
    constructor() {
        this.SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
        this.CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds
        this.intervalId = null;
        this.onSessionExpired = null;
    }

    /**
     * Create a new session with expiration time
     * @param {string} token - Authentication token
     * @param {Function} onExpired - Callback when session expires
     */
    createSession(token, onExpired = null) {
        const now = new Date().getTime();
        const expirationTime = now + this.SESSION_DURATION;

        // Store token with session metadata
        const sessionData = {
            token,
            createdAt: now,
            expiresAt: expirationTime,
            lastActivity: now
        };

        // Save to cookies with 3 hours expiration
        Cookies.set('auth_token', token, {
            expires: new Date(expirationTime),
            secure: window.location.protocol === 'https:',
            sameSite: 'strict'
        });

        // Save session metadata to localStorage for checking
        localStorage.setItem('session_data', JSON.stringify(sessionData));

        // Set expiration callback
        this.onSessionExpired = onExpired;

        // Start monitoring session
        this.startSessionMonitoring();

        console.log('Session created - expires at:', new Date(expirationTime).toLocaleString());
    }

    /**
     * Check if current session is valid
     * @returns {boolean} - True if session is valid
     */
    isSessionValid() {
        const sessionData = this.getSessionData();
        if (!sessionData) return false;

        const now = new Date().getTime();
        const isValid = now < sessionData.expiresAt;

        if (!isValid) {
            console.log('Session expired');
            this.destroySession();
        }

        return isValid;
    }

    /**
     * Get session data from localStorage
     * @returns {Object|null} - Session data or null
     */
    getSessionData() {
        try {
            const sessionDataStr = localStorage.getItem('session_data');
            if (!sessionDataStr) return null;

            const sessionData = JSON.parse(sessionDataStr);
            
            // Validate session data structure
            if (!sessionData.token || !sessionData.expiresAt) {
                console.warn('Invalid session data structure');
                this.destroySession();
                return null;
            }

            return sessionData;
        } catch (error) {
            console.error('Error reading session data:', error);
            this.destroySession();
            return null;
        }
    }

    /**
     * Update last activity time to extend session
     */
    updateLastActivity() {
        const sessionData = this.getSessionData();
        if (!sessionData) return;

        const now = new Date().getTime();
        
        // Don't extend if session is about to expire (less than 5 minutes left)
        const timeRemaining = sessionData.expiresAt - now;
        if (timeRemaining < 5 * 60 * 1000) return;

        sessionData.lastActivity = now;
        localStorage.setItem('session_data', JSON.stringify(sessionData));
    }

    /**
     * Get remaining session time in milliseconds
     * @returns {number} - Remaining time in milliseconds
     */
    getRemainingTime() {
        const sessionData = this.getSessionData();
        if (!sessionData) return 0;

        const now = new Date().getTime();
        return Math.max(0, sessionData.expiresAt - now);
    }

    /**
     * Get remaining time formatted as string
     * @returns {string} - Formatted remaining time
     */
    getRemainingTimeFormatted() {
        const remaining = this.getRemainingTime();
        if (remaining <= 0) return '0:00:00';

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Start monitoring session expiration
     */
    startSessionMonitoring() {
        // Clear existing interval if any
        this.stopSessionMonitoring();

        this.intervalId = setInterval(() => {
            if (!this.isSessionValid()) {
                console.log('Session expired during monitoring');
                if (this.onSessionExpired) {
                    this.onSessionExpired();
                }
                this.stopSessionMonitoring();
            }
        }, this.CHECK_INTERVAL);

        console.log('Session monitoring started');
    }

    /**
     * Stop monitoring session expiration
     */
    stopSessionMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Session monitoring stopped');
        }
    }

    /**
     * Destroy current session
     */
    destroySession() {
        // Remove cookies
        Cookies.remove('auth_token');
        
        // Remove session data
        localStorage.removeItem('session_data');
        
        // Stop monitoring
        this.stopSessionMonitoring();
        
        console.log('Session destroyed');
    }

    /**
     * Check if session warning should be shown (less than 15 minutes remaining)
     * @returns {boolean} - True if warning should be shown
     */
    shouldShowWarning() {
        const remaining = this.getRemainingTime();
        return remaining > 0 && remaining <= 15 * 60 * 1000; // 15 minutes
    }

    /**
     * Extend session by another 3 hours (renew)
     * Only works if current session is still valid
     */
    renewSession() {
        const sessionData = this.getSessionData();
        if (!sessionData || !this.isSessionValid()) {
            console.warn('Cannot renew expired or invalid session');
            return false;
        }

        const now = new Date().getTime();
        const newExpirationTime = now + this.SESSION_DURATION;

        // Update session data
        sessionData.expiresAt = newExpirationTime;
        sessionData.lastActivity = now;

        // Update cookies
        Cookies.set('auth_token', sessionData.token, {
            expires: new Date(newExpirationTime),
            secure: window.location.protocol === 'https:',
            sameSite: 'strict'
        });

        // Update localStorage
        localStorage.setItem('session_data', JSON.stringify(sessionData));

        console.log('Session renewed - new expiration:', new Date(newExpirationTime).toLocaleString());
        return true;
    }
}

// Export singleton instance
export default new SessionManager();
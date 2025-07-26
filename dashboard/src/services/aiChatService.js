import apiService from './apiService';
import { toast } from 'react-hot-toast';

class AIChatService {
    constructor() {
        this.baseUrl = '/ai-chat';
        this.chatHistory = [];
        this.isTyping = false;
        this.config = null;
    }

    /**
     * Send message to AI and get response
     */
    async sendMessage(message, context = {}) {
        try {
            this.isTyping = true;
            
            const response = await apiService.post(
                `${this.baseUrl}/message`,
                { message, context }
            );

            if (response.success) {
                // Add messages to chat history
                this.addToHistory('user', message);
                this.addToHistory('ai', response.data.message, {
                    cached: response.data.cached,
                    provider: response.data.provider,
                    timestamp: response.data.timestamp
                });

                return response.data;
            } else {
                throw new Error(response.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('❌ Error sending message:', error);
            toast.error('حدث خطأ أثناء إرسال الرسالة');
            throw error;
        } finally {
            this.isTyping = false;
        }
    }

    /**
     * Get suggested questions based on user role
     */
    async getSuggestedQuestions() {
        try {
            const response = await apiService.get(
                `${this.baseUrl}/suggested-questions`
            );

            if (response.success) {
                return response.data.questions;
            } else {
                throw new Error(response.error || 'Failed to get suggested questions');
            }
        } catch (error) {
            console.error('❌ Error getting suggested questions:', error);
            return [];
        }
    }

    /**
     * Get chat configuration
     */
    async getChatConfig() {
        try {
            if (this.config) {
                return this.config;
            }

            const response = await apiService.get(
                `${this.baseUrl}/config`
            );

            if (response.success) {
                this.config = response.data;
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to get chat configuration');
            }
        } catch (error) {
            console.error('❌ Error getting chat config:', error);
            return {
                botName: 'مساعد المخبز الذكي',
                welcomeMessage: 'أهلاً وسهلاً! كيف يمكنني مساعدتك اليوم؟',
                maxMessageLength: 1000,
                enabledFeatures: {
                    suggestedQuestions: true,
                    contextMemory: true,
                    advancedAnalytics: false
                }
            };
        }
    }

    /**
     * Get analytics report (admin only)
     */
    async getAnalyticsReport(reportType = 'general') {
        try {
            const response = await apiService.get(
                `${this.baseUrl}/analytics?reportType=${reportType}`
            );

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to get analytics report');
            }
        } catch (error) {
            console.error('❌ Error getting analytics report:', error);
            toast.error('فشل في الحصول على التقرير');
            throw error;
        }
    }

    /**
     * Clear AI cache (admin only)
     */
    async clearCache() {
        try {
            const response = await apiService.delete(
                `${this.baseUrl}/cache`
            );

            if (response.success) {
                toast.success('تم مسح الذاكرة المؤقتة بنجاح');
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to clear cache');
            }
        } catch (error) {
            console.error('❌ Error clearing cache:', error);
            toast.error('فشل في مسح الذاكرة المؤقتة');
            throw error;
        }
    }

    /**
     * Get cache statistics (admin only)
     */
    async getCacheStats() {
        try {
            const response = await apiService.get(
                `${this.baseUrl}/cache/stats`
            );

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to get cache stats');
            }
        } catch (error) {
            console.error('❌ Error getting cache stats:', error);
            return null;
        }
    }

    /**
     * Health check for AI services
     */
    async healthCheck() {
        try {
            const response = await apiService.get(
                `${this.baseUrl}/health`
            );

            return response.success ? response.data : null;
        } catch (error) {
            console.error('❌ AI Health check failed:', error);
            return null;
        }
    }

    /**
     * Add message to chat history
     */
    addToHistory(sender, message, metadata = {}) {
        const historyItem = {
            id: Date.now() + Math.random(),
            sender,
            message,
            timestamp: new Date(),
            ...metadata
        };

        this.chatHistory.push(historyItem);

        // Keep only last 50 messages to prevent memory issues
        const maxHistory = parseInt(import.meta.env.VITE_MAX_CHAT_HISTORY || '50');
        if (this.chatHistory.length > maxHistory) {
            this.chatHistory = this.chatHistory.slice(-maxHistory);
        }

        // Save to localStorage if enabled
        if (import.meta.env.VITE_SAVE_CHAT_HISTORY === 'true') {
            this.saveChatHistory();
        }
    }

    /**
     * Get chat history
     */
    getChatHistory() {
        return this.chatHistory;
    }

    /**
     * Clear chat history
     */
    clearChatHistory() {
        this.chatHistory = [];
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('aiChatHistory');
        }
        toast.success('تم مسح سجل المحادثة');
    }

    /**
     * Save chat history to localStorage
     */
    saveChatHistory() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('aiChatHistory', JSON.stringify(this.chatHistory));
            }
        } catch (error) {
            console.warn('Failed to save chat history to localStorage:', error);
        }
    }

    /**
     * Load chat history from localStorage
     */
    loadChatHistory() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('aiChatHistory');
                if (saved) {
                    this.chatHistory = JSON.parse(saved);
                }
            }
        } catch (error) {
            console.warn('Failed to load chat history from localStorage:', error);
            this.chatHistory = [];
        }
    }

    /**
     * Get typing status
     */
    getTypingStatus() {
        return this.isTyping;
    }

    /**
     * Validate message before sending
     */
    validateMessage(message) {
        if (!message || message.trim().length === 0) {
            return { valid: false, error: 'الرسالة مطلوبة' };
        }

        const maxLength = parseInt(import.meta.env.VITE_MAX_MESSAGE_LENGTH || '1000');
        if (message.length > maxLength) {
            return { 
                valid: false, 
                error: `الرسالة طويلة جداً. الحد الأقصى ${maxLength} حرف` 
            };
        }

        return { valid: true };
    }

    /**
     * Format message for display
     */
    formatMessage(message) {
        if (!message) return '';
        
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        message = message.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Convert line breaks to <br>
        message = message.replace(/\n/g, '<br>');
        
        return message;
    }

    /**
     * Get message statistics
     */
    getMessageStats() {
        const total = this.chatHistory.length;
        const userMessages = this.chatHistory.filter(msg => msg.sender === 'user').length;
        const aiMessages = this.chatHistory.filter(msg => msg.sender === 'ai').length;
        const cachedResponses = this.chatHistory.filter(msg => msg.sender === 'ai' && msg.cached).length;

        return {
            total,
            userMessages,
            aiMessages,
            cachedResponses,
            cacheHitRate: aiMessages > 0 ? (cachedResponses / aiMessages * 100).toFixed(1) : 0
        };
    }
}

// Export singleton instance
const aiChatService = new AIChatService();

// Load chat history on initialization
aiChatService.loadChatHistory();

export default aiChatService; 
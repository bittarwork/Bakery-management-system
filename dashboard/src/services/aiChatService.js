import apiService from './apiService';
import { toast } from 'react-hot-toast';

class AIChatService {
    constructor() {
        this.baseUrl = '/ai-chat';
        this.chatHistory = [];
        this.isTyping = false;
        this.config = null;
        // Multi-chat support
        this.chats = [];
        this.activeChat = null;
        this.loadChats();
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

        // Add to active chat if exists, otherwise use legacy chatHistory
        if (this.activeChat) {
            this.activeChat.messages.push(historyItem);
            this.activeChat.lastUsedAt = new Date().toISOString();
            this.activeChat.messageCount = this.activeChat.messages.length;
            
            // Update chatHistory for backward compatibility
            this.chatHistory = this.activeChat.messages;
            
            // Keep only last 50 messages per chat to prevent memory issues
            const maxHistory = parseInt(import.meta.env.VITE_MAX_CHAT_HISTORY || '50');
            if (this.activeChat.messages.length > maxHistory) {
                this.activeChat.messages = this.activeChat.messages.slice(-maxHistory);
                this.chatHistory = this.activeChat.messages;
            }
            
            this.saveChats();
        } else {
            // Legacy behavior - create new chat if none exists
            if (this.chats.length === 0) {
                this.createNewChat();
            }
            
            // Add to current chat
            if (this.activeChat) {
                this.activeChat.messages.push(historyItem);
                this.activeChat.lastUsedAt = new Date().toISOString();
                this.activeChat.messageCount = this.activeChat.messages.length;
                this.chatHistory = this.activeChat.messages;
                this.saveChats();
            } else {
                // Fallback to old system
                this.chatHistory.push(historyItem);
                const maxHistory = parseInt(import.meta.env.VITE_MAX_CHAT_HISTORY || '50');
                if (this.chatHistory.length > maxHistory) {
                    this.chatHistory = this.chatHistory.slice(-maxHistory);
                }
                this.saveChatHistory();
            }
        }
    }

    /**
     * Get chat history
     */
    getChatHistory() {
        return this.activeChat ? this.activeChat.messages : this.chatHistory;
    }

    /**
     * Clear chat history
     */
    clearChatHistory() {
        if (this.activeChat) {
            this.activeChat.messages = [];
            this.activeChat.messageCount = 0;
            this.activeChat.lastUsedAt = new Date().toISOString();
            this.chatHistory = [];
            this.saveChats();
        } else {
            this.chatHistory = [];
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('aiChatHistory');
            }
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
        const messages = this.activeChat?.messages || this.chatHistory;
        const total = messages.length;
        const userMessages = messages.filter(msg => msg.sender === 'user').length;
        const aiMessages = messages.filter(msg => msg.sender === 'ai').length;
        const cachedResponses = messages.filter(msg => msg.sender === 'ai' && msg.cached).length;

        return {
            total,
            userMessages,
            aiMessages,
            cachedResponses,
            cacheHitRate: aiMessages > 0 ? (cachedResponses / aiMessages * 100).toFixed(1) : 0
        };
    }

    // === MULTI-CHAT MANAGEMENT METHODS ===

    /**
     * Create a new chat session
     */
    createNewChat(title = null) {
        const now = new Date();
        const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newChat = {
            id: chatId,
            title: title || `دردشة جديدة - ${now.toLocaleDateString('ar')}`,
            messages: [],
            createdAt: now.toISOString(),
            lastUsedAt: now.toISOString(),
            messageCount: 0,
            archived: false,
            starred: false
        };

        this.chats.unshift(newChat);
        this.activeChat = newChat;
        this.saveChats();
        
        return newChat;
    }

    /**
     * Get all chats
     */
    getAllChats() {
        return this.chats;
    }

    /**
     * Get active chat
     */
    getActiveChat() {
        return this.activeChat;
    }

    /**
     * Select a chat as active
     */
    selectChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            this.activeChat = chat;
            chat.lastUsedAt = new Date().toISOString();
            this.saveChats();
            
            // Update chatHistory for backward compatibility
            this.chatHistory = chat.messages;
            return chat;
        }
        return null;
    }

    /**
     * Delete a chat
     */
    deleteChat(chatId) {
        const chatIndex = this.chats.findIndex(c => c.id === chatId);
        if (chatIndex !== -1) {
            const deletedChat = this.chats[chatIndex];
            this.chats.splice(chatIndex, 1);
            
            // If deleted chat was active, select another one
            if (this.activeChat && this.activeChat.id === chatId) {
                this.activeChat = this.chats.length > 0 ? this.chats[0] : null;
                this.chatHistory = this.activeChat ? this.activeChat.messages : [];
            }
            
            this.saveChats();
            return deletedChat;
        }
        return null;
    }

    /**
     * Rename a chat
     */
    renameChat(chatId, newTitle) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            chat.title = newTitle;
            chat.lastUsedAt = new Date().toISOString();
            this.saveChats();
            return chat;
        }
        return null;
    }

    /**
     * Archive/Unarchive a chat
     */
    archiveChat(chatId, archived = true) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            chat.archived = archived;
            chat.lastUsedAt = new Date().toISOString();
            this.saveChats();
            return chat;
        }
        return null;
    }

    /**
     * Star/Unstar a chat
     */
    starChat(chatId, starred = true) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            chat.starred = starred;
            chat.lastUsedAt = new Date().toISOString();
            this.saveChats();
            return chat;
        }
        return null;
    }

    /**
     * Load chats from localStorage
     */
    loadChats() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('aiChats');
                if (saved) {
                    const data = JSON.parse(saved);
                    this.chats = data.chats || [];
                    const activeChatId = data.activeChatId;
                    
                    if (activeChatId) {
                        this.activeChat = this.chats.find(c => c.id === activeChatId);
                    }
                    
                    // If no active chat but chats exist, select the first one
                    if (!this.activeChat && this.chats.length > 0) {
                        this.activeChat = this.chats[0];
                    }
                    
                    // Update chatHistory for backward compatibility
                    this.chatHistory = this.activeChat ? this.activeChat.messages : [];
                }
                
                // Migrate old chat history if exists and no chats
                if (this.chats.length === 0) {
                    this.migrateOldChatHistory();
                }
            }
        } catch (error) {
            console.warn('Failed to load chats from localStorage:', error);
            this.chats = [];
            this.activeChat = null;
        }
    }

    /**
     * Save chats to localStorage
     */
    saveChats() {
        try {
            if (typeof localStorage !== 'undefined') {
                const data = {
                    chats: this.chats,
                    activeChatId: this.activeChat?.id || null,
                    lastSaved: new Date().toISOString()
                };
                localStorage.setItem('aiChats', JSON.stringify(data));
            }
        } catch (error) {
            console.warn('Failed to save chats to localStorage:', error);
        }
    }

    /**
     * Migrate old chat history to new format
     */
    migrateOldChatHistory() {
        try {
            if (typeof localStorage !== 'undefined') {
                const oldHistory = localStorage.getItem('aiChatHistory');
                if (oldHistory) {
                    const messages = JSON.parse(oldHistory);
                    if (messages.length > 0) {
                        const migrationChat = {
                            id: `migrated_chat_${Date.now()}`,
                            title: 'الدردشة السابقة',
                            messages: messages,
                            createdAt: new Date().toISOString(),
                            lastUsedAt: new Date().toISOString(),
                            messageCount: messages.length,
                            archived: false,
                            starred: false
                        };
                        
                        this.chats = [migrationChat];
                        this.activeChat = migrationChat;
                        this.chatHistory = messages;
                        this.saveChats();
                        
                        // Remove old storage
                        localStorage.removeItem('aiChatHistory');
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to migrate old chat history:', error);
        }
    }
}

// Export singleton instance
const aiChatService = new AIChatService();

// Load chat history on initialization
aiChatService.loadChatHistory();

export default aiChatService; 
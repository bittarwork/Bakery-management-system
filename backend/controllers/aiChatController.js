import aiService from '../services/aiService.js';
import logger from '../config/logger.js';
import rateLimit from 'express-rate-limit';

class AIChatController {
    /**
     * Send message to AI and get response
     */
    async sendMessage(req, res) {
        try {
            const { message, context } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Validate input
            if (!message || message.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Message is required'
                });
            }

            // Check message length
            const maxLength = parseInt(process.env.AI_MAX_MESSAGE_LENGTH || '1000');
            if (message.length > maxLength) {
                return res.status(400).json({
                    success: false,
                    error: `Message too long. Maximum ${maxLength} characters allowed.`
                });
            }

            // Content filtering (basic)
            if (this.containsInappropriateContent(message)) {
                return res.status(400).json({
                    success: false,
                    error: 'Message contains inappropriate content'
                });
            }

            // Get AI response
            const aiResponse = await aiService.getAIResponse(message, userId, {
                userRole,
                ...context
            });

            // Log the interaction
            logger.info(`💬 AI Chat - User: ${userId}, Role: ${userRole}, Message: ${message.substring(0, 100)}...`);

            res.json({
                success: true,
                data: {
                    message: aiResponse.response,
                    cached: aiResponse.cached || false,
                    provider: aiResponse.provider || 'unknown',
                    timestamp: aiResponse.timestamp,
                    userId: userId
                }
            });

        } catch (error) {
            logger.error('❌ Error in sendMessage:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                error: error
            });
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'عذراً، حدث خطأ أثناء معالجة طلبك',
                details: error.message
            });
        }
    }

    /**
     * Get suggested questions based on user role
     */
    async getSuggestedQuestions(req, res) {
        try {
            const userRole = req.user.role;
            const questions = aiService.getSuggestedQuestions(userRole);

            res.json({
                success: true,
                data: {
                    questions,
                    userRole,
                    enabled: process.env.ENABLE_SUGGESTED_QUESTIONS === 'true'
                }
            });

        } catch (error) {
            logger.error('❌ Error getting suggested questions:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                error: error.toString()
            });
            res.status(500).json({
                success: false,
                error: 'Failed to get suggested questions'
            });
        }
    }

    /**
     * Get chat configuration
     */
    async getChatConfig(req, res) {
        try {
            const config = {
                botName: process.env.BOT_NAME || 'مساعد المخبز الذكي',
                welcomeMessage: process.env.BOT_WELCOME_MESSAGE || 'أهلاً وسهلاً! كيف يمكنني مساعدتك اليوم؟',
                maxMessageLength: parseInt(process.env.AI_MAX_MESSAGE_LENGTH || '1000'),
                enabledFeatures: {
                    suggestedQuestions: process.env.ENABLE_SUGGESTED_QUESTIONS === 'true',
                    contextMemory: process.env.ENABLE_CONTEXT_MEMORY === 'true',
                    advancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS === 'true'
                },
                provider: 'gemini',
                userRole: req.user.role
            };

            res.json({
                success: true,
                data: config
            });

        } catch (error) {
            logger.error('❌ Error getting chat config:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                error: error.toString()
            });
            res.status(500).json({
                success: false,
                error: 'Failed to get chat configuration'
            });
        }
    }

    /**
     * Get analytics report (admin only)
     */
    async getAnalyticsReport(req, res) {
        try {
            // Check admin permission
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Admin access required'
                });
            }

            const { reportType = 'general' } = req.query;

            const analyticsPrompt = this.generateAnalyticsPrompt(reportType);
            const aiResponse = await aiService.getAIResponse(analyticsPrompt, req.user.id, {
                userRole: 'admin',
                reportType
            });

            res.json({
                success: true,
                data: {
                    report: aiResponse.response,
                    type: reportType,
                    cached: aiResponse.cached || false,
                    timestamp: aiResponse.timestamp
                }
            });

        } catch (error) {
            logger.error('❌ Error generating analytics report:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                error: error.toString()
            });
            res.status(500).json({
                success: false,
                error: 'Failed to generate analytics report'
            });
        }
    }

    /**
     * Clear AI cache (admin only)
     */
    async clearCache(req, res) {
        try {
            // Check admin permission
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Admin access required'
                });
            }

            const result = aiService.clearCache();

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            logger.error('❌ Error clearing cache:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                error: error.toString()
            });
            res.status(500).json({
                success: false,
                error: 'Failed to clear cache'
            });
        }
    }

    /**
     * Get cache statistics (admin only)
     */
    async getCacheStats(req, res) {
        try {
            // Check admin permission
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Admin access required'
                });
            }

            const stats = aiService.getCacheStats();

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            logger.error('❌ Error getting cache stats:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                error: error.toString()
            });
            res.status(500).json({
                success: false,
                error: 'Failed to get cache statistics'
            });
        }
    }

    /**
     * Health check for AI services
     */
    async healthCheck(req, res) {
        try {
            const health = {
                aiService: 'operational',
                provider: 'gemini',
                cacheEnabled: process.env.AI_CACHE_ENABLED === 'true',
                timestamp: new Date().toISOString()
            };

            res.json({
                success: true,
                data: health
            });

        } catch (error) {
            logger.error('❌ AI Health check failed:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                error: error.toString()
            });
            res.status(500).json({
                success: false,
                error: 'AI service health check failed'
            });
        }
    }

    /**
     * Generate analytics prompt based on report type
     */
    generateAnalyticsPrompt(reportType) {
        const prompts = {
            general: 'قدم تحليلاً شاملاً لأداء المخبز اليوم بناءً على البيانات المتوفرة',
            sales: 'حلل بيانات المبيعات وقدم اقتراحات لتحسين الأداء',
            inventory: 'راجع حالة المخزون وقدم توصيات للإدارة',
            stores: 'حلل أداء المتاجر وحدد نقاط القوة والضعف',
            financial: 'قدم تحليلاً مالياً شاملاً مع توصيات استراتيجية'
        };

        return prompts[reportType] || prompts.general;
    }

    /**
     * Basic content filtering
     */
    containsInappropriateContent(message) {
        // Basic filtering - can be enhanced with more sophisticated methods
        const inappropriateWords = ['spam', 'hack', 'malware'];
        const lowerMessage = message.toLowerCase();

        return inappropriateWords.some(word => lowerMessage.includes(word));
    }
}

export const aiChatController = new AIChatController();
export const aiChatRateLimit = rateLimit({
    windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW || '3600000'), // 1 hour
    max: parseInt(process.env.AI_RATE_LIMIT_REQUESTS || '100'), // requests per window
    message: {
        success: false,
        error: 'Too many AI requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
}); 
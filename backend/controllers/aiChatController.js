import enhancedAIService from '../services/enhancedAIService.js';
import logger from '../config/logger.js';
import rateLimit from 'express-rate-limit';
import aiActionSystem from '../services/aiActionSystem.js';

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
            const maxLength = parseInt(process.env.AI_MAX_MESSAGE_LENGTH || '2000');
            if (message.length > maxLength) {
                return res.status(400).json({
                    success: false,
                    error: `Message too long. Maximum ${maxLength} characters allowed.`
                });
            }

            // Enhanced content filtering
            const contentValidation = this.validateMessageContent(message);
            if (!contentValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: contentValidation.reason
                });
            }

            // Generate session ID if not provided
            const sessionId = context?.sessionId || `sess_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Process message with enhanced AI service
            const aiResponse = await enhancedAIService.processMessage(
                message,
                userId,
                userRole,
                {
                    sessionId,
                    ...context
                }
            );

            // Log the interaction
            logger.info(`💬 Enhanced AI Chat - User: ${userId}, Role: ${userRole}, Intent: ${aiResponse.metadata?.intent?.primaryIntent}`, {
                processingTime: aiResponse.metadata?.processingTime,
                actionsExecuted: aiResponse.metadata?.actionsExecuted?.length || 0,
                sentiment: aiResponse.metadata?.sentiment?.sentiment
            });

            res.json({
                success: true,
                data: {
                    message: aiResponse.response,
                    sessionId,
                    metadata: aiResponse.metadata,
                    timestamp: new Date().toISOString(),
                    userId: userId,
                    enhanced: true
                }
            });

        } catch (error) {
            logger.error('❌ Error in enhanced sendMessage:', {
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
     * Get enhanced suggested questions based on user role and context
     */
    async getSuggestedQuestions(req, res) {
        try {
            const userRole = req.user.role;
            const userId = req.user.id;

            // Get personalized suggestions
            const suggestions = await this.getPersonalizedSuggestions(userId, userRole);

            res.json({
                success: true,
                data: {
                    questions: suggestions,
                    userRole,
                    enhanced: true,
                    enabled: process.env.ENABLE_SUGGESTED_QUESTIONS === 'true'
                }
            });

        } catch (error) {
            logger.error('❌ Error getting enhanced suggested questions:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get suggested questions'
            });
        }
    }

    /**
     * Get enhanced chat configuration
     */
    async getChatConfig(req, res) {
        try {
            const stats = enhancedAIService.getConversationStats();

            const config = {
                botName: process.env.BOT_NAME || 'مساعد المخبز الذكي المحسن',
                welcomeMessage: process.env.BOT_WELCOME_MESSAGE || 'أهلاً وسهلاً! أنا مساعدك الذكي المحسن. يمكنني مساعدتك في جميع جوانب إدارة المخبز من التحليلات المتقدمة إلى تنفيذ المهام الفعلية! 🚀',
                maxMessageLength: parseInt(process.env.AI_MAX_MESSAGE_LENGTH || '2000'),
                enabledFeatures: {
                    suggestedQuestions: process.env.ENABLE_SUGGESTED_QUESTIONS === 'true',
                    contextMemory: true,
                    advancedAnalytics: true,
                    actionExecution: true,
                    databaseIntegration: true,
                    personalizedResponses: true,
                    sentimentAnalysis: true,
                    intentRecognition: true
                },
                capabilities: [
                    'تحليل البيانات المتقدم',
                    'تنفيذ الإجراءات النظام',
                    'التنبؤ بالمخزون',
                    'تحليل أنماط المبيعات',
                    'إدارة الطلبات',
                    'التقارير المخصصة',
                    'الذاكرة السياقية',
                    'الردود الشخصية'
                ],
                provider: 'enhanced-gemini',
                userRole: req.user.role,
                version: '2.0',
                stats
            };

            res.json({
                success: true,
                data: config
            });

        } catch (error) {
            logger.error('❌ Error getting enhanced chat config:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get chat configuration'
            });
        }
    }

    /**
     * Get enhanced analytics report with AI insights
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

            const { reportType = 'general', period = 'month' } = req.query;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Generate intelligent report request
            const reportPrompt = this.generateIntelligentReportPrompt(reportType, period);

            // Process with enhanced AI
            const aiResponse = await enhancedAIService.processMessage(
                reportPrompt,
                userId,
                userRole,
                {
                    sessionId: `report_${Date.now()}`,
                    reportContext: true
                }
            );

            res.json({
                success: true,
                data: {
                    report: aiResponse.response,
                    type: reportType,
                    period,
                    metadata: aiResponse.metadata,
                    timestamp: new Date().toISOString(),
                    enhanced: true
                }
            });

        } catch (error) {
            logger.error('❌ Error generating enhanced analytics report:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate analytics report'
            });
        }
    }

    /**
     * Get conversation memory for user
     */
    async getConversationMemory(req, res) {
        try {
            const userId = req.user.id;
            const { sessionId, limit = 10 } = req.query;

            const stats = enhancedAIService.getConversationStats();

            res.json({
                success: true,
                data: {
                    conversationStats: stats,
                    userId,
                    sessionId: sessionId || 'all',
                    enhanced: true
                }
            });

        } catch (error) {
            logger.error('❌ Error getting conversation memory:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get conversation memory'
            });
        }
    }

    /**
     * Clear user conversation memory
     */
    async clearConversationMemory(req, res) {
        try {
            const userId = req.user.id;
            const { sessionId } = req.body;

            enhancedAIService.clearUserMemory(userId, sessionId);

            res.json({
                success: true,
                data: {
                    message: 'تم مسح ذاكرة المحادثة بنجاح',
                    userId,
                    sessionId: sessionId || 'all'
                }
            });

        } catch (error) {
            logger.error('❌ Error clearing conversation memory:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to clear conversation memory'
            });
        }
    }

    /**
     * Get available actions for user role
     */
    async getAvailableActions(req, res) {
        try {
            const userRole = req.user.role;
            const actions = aiActionSystem.getAvailableActions(userRole);

            res.json({
                success: true,
                data: {
                    actions,
                    userRole,
                    totalActions: Object.keys(actions).length
                }
            });

        } catch (error) {
            logger.error('❌ Error getting available actions:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get available actions'
            });
        }
    }

    /**
     * Get user action history
     */
    async getActionHistory(req, res) {
        try {
            const userId = req.user.id;
            const { limit = 10 } = req.query;

            const history = aiActionSystem.getUserActionHistory(userId, parseInt(limit));

            res.json({
                success: true,
                data: {
                    history,
                    userId,
                    count: history.length
                }
            });

        } catch (error) {
            logger.error('❌ Error getting action history:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get action history'
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
                provider: 'enhanced-gemini',
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
     * Enhanced content validation
     */
    validateMessageContent(message) {
        // Check if message exists and is string
        if (!message || typeof message !== 'string') {
            return { isValid: false, reason: 'Invalid message format' };
        }

        // Check message length
        if (message.trim().length === 0) {
            return { isValid: false, reason: 'Message cannot be empty' };
        }

        // Basic inappropriate content filtering
        const inappropriatePatterns = [
            /\b(hack|crack|exploit|malware|virus|spam)\b/gi,
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi
        ];

        const lowerMessage = message.toLowerCase();

        for (const pattern of inappropriatePatterns) {
            if (pattern.test(message)) {
                return { isValid: false, reason: 'Message contains inappropriate content' };
            }
        }

        // Check for SQL injection attempts
        const sqlPatterns = [
            /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bunion\b).*(\bfrom\b|\binto\b|\bwhere\b)/gi,
            /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/gi,
            /['"]\s*(or|and)\s+['"]\w+['"]\s*=\s*['"]\w+['"]|['"]\s*(or|and)\s+\d+\s*=\s*\d+/gi
        ];

        for (const pattern of sqlPatterns) {
            if (pattern.test(message)) {
                return { isValid: false, reason: 'Suspicious content detected' };
            }
        }

        return { isValid: true };
    }

    /**
     * Generate personalized suggestions based on user patterns
     */
    async getPersonalizedSuggestions(userId, userRole) {
        try {
            // Get user behavioral patterns
            const userPatterns = await enhancedAIService.getUserBehavioralPatterns(userId);

            let suggestions = [];

            // Role-based base suggestions
            const roleSuggestions = {
                admin: [
                    "📊 أعطني تحليل شامل لأداء المخبز اليوم",
                    "💰 ما هو الملخص المالي لهذا الشهر؟",
                    "🏪 كيف أداء المتاجر مقارنة ببعضها؟",
                    "🔮 تنبؤ باحتياجات المخزون للأسبوع القادم",
                    "📈 تحليل أنماط المبيعات والاتجاهات",
                    "⚠️ ما هي التحذيرات الحرجة الحالية؟"
                ],
                manager: [
                    "📦 حالة المخزون والتحذيرات",
                    "🛒 الطلبات المعلقة والمؤكدة اليوم",
                    "📊 أداء المنتجات الأكثر مبيعاً",
                    "💳 تحليل المدفوعات والديون",
                    "📋 إنشاء تقرير مخصص",
                    "🔍 البحث في الطلبات"
                ],
                user: [
                    "📊 الإحصائيات العامة",
                    "📦 معلومات المنتجات",
                    "🏪 معلومات المتاجر",
                    "🔍 البحث في البيانات"
                ]
            };

            suggestions = roleSuggestions[userRole] || roleSuggestions.user;

            // Personalize based on user patterns
            if (userPatterns.preferredIntents && userPatterns.preferredIntents.length > 0) {
                const topIntent = userPatterns.preferredIntents[0].intent;

                const intentSuggestions = {
                    'report_request': ["📊 تقرير مبيعات مفصل لهذا الأسبوع"],
                    'inventory_inquiry': ["📦 أي منتجات تحتاج إعادة تموين؟"],
                    'sales_inquiry': ["💰 أفضل المنتجات مبيعاً هذا الشهر"],
                    'store_inquiry': ["🏪 أداء المتاجر في منطقة معينة"]
                };

                if (intentSuggestions[topIntent]) {
                    suggestions.unshift(...intentSuggestions[topIntent]);
                }
            }

            // Add time-based suggestions
            const currentHour = new Date().getHours();
            if (currentHour >= 8 && currentHour <= 10) {
                suggestions.unshift("🌅 تقرير الصباح - ماذا حدث منذ أمس؟");
            } else if (currentHour >= 17 && currentHour <= 19) {
                suggestions.unshift("🌆 ملخص اليوم - كيف كان الأداء؟");
            }

            return suggestions.slice(0, 8); // Limit to 8 suggestions

        } catch (error) {
            logger.error('Error getting personalized suggestions:', error);
            return [
                "📊 أعطني إحصائيات اليوم",
                "📦 حالة المخزون",
                "🛒 الطلبات الحالية",
                "💰 الأداء المالي"
            ];
        }
    }

    /**
     * Generate intelligent report prompt
     */
    generateIntelligentReportPrompt(reportType, period) {
        const prompts = {
            general: `أعطني تحليلاً شاملاً ومفصلاً لأداء المخبز خلال ${this.translatePeriod(period)} مع التركيز على الاتجاهات والتوصيات`,
            sales: `حلل بيانات المبيعات لفترة ${this.translatePeriod(period)} وقدم رؤى عميقة مع اقتراحات لتحسين الأداء`,
            inventory: `راجع حالة المخزون وقدم تحليلاً للاتجاهات وتوصيات للإدارة مع التنبؤ بالاحتياجات المستقبلية`,
            stores: `حلل أداء المتاجر خلال ${this.translatePeriod(period)} وحدد نقاط القوة والضعف مع خطة تحسين`,
            financial: `قدم تحليلاً مالياً شاملاً لفترة ${this.translatePeriod(period)} مع توصيات استراتيجية وتحليل المخاطر`,
            products: `تحليل أداء المنتجات والفئات خلال ${this.translatePeriod(period)} مع تحديد الفرص والتحديات`,
            trends: `حلل الاتجاهات والأنماط في البيانات لفترة ${this.translatePeriod(period)} وقدم توقعات مستقبلية`
        };

        return prompts[reportType] || prompts.general;
    }

    /**
     * Translate period to Arabic
     */
    translatePeriod(period) {
        const translations = {
            'today': 'اليوم',
            'yesterday': 'أمس',
            'week': 'الأسبوع الحالي',
            'month': 'الشهر الحالي',
            'quarter': 'الربع الحالي',
            'year': 'السنة الحالية'
        };
        return translations[period] || 'الفترة المحددة';
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
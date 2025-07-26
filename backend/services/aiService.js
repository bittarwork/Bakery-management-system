import { GoogleGenerativeAI } from '@google/generative-ai';
import mysql from 'mysql2/promise';
import logger from '../config/logger.js';
import sentimentAnalysis from './sentimentAnalysis.js';
import AiConversation from '../models/AiConversation.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables are loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
try {
    dotenv.config({ path: path.join(__dirname, '../config.env') });
} catch (err) {
    dotenv.config();
}

class AIService {
    constructor() {
        this.gemini = null;
        this.dbPool = null;
        this.cache = new Map();
        this.contextMemory = new Map(); // Short-term memory
        this.initialized = false;
        this.conversationSessions = new Map(); // Track active sessions
        // Don't initialize immediately, do it lazily
    }

    /**
     * Initialize AI services and database connection
     */
    async initializeServices() {
        try {
            if (this.initialized) {
                return; // Already initialized
            }

            logger.info('🔧 Initializing Gemini AI service...');

            // Initialize Gemini - Required for AI functionality
            if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
                this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                logger.info('✅ Gemini AI service initialized successfully');
            } else {
                logger.error('❌ Gemini API key not provided - AI functionality will not work');
                logger.error('Environment variables status:');
                logger.error('- GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
                logger.error('- GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
                throw new Error('Gemini API key is required for AI functionality');
            }

            // Initialize database connection for context
            this.dbPool = mysql.createPool({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });

            this.initialized = true;
            logger.info('🚀 Gemini AI Service fully initialized');
        } catch (error) {
            logger.error('❌ Failed to initialize Gemini AI Service:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                error: error.toString()
            });
            this.initialized = false;
            throw error;
        }
    }

    /**
     * Get AI response using the configured provider
     */
    async getAIResponse(message, userId, context = {}) {
        const startTime = Date.now();

        try {
            // Initialize services if not already done
            if (!this.initialized) {
                await this.initializeServices();
            }

            // Generate session ID for conversation tracking
            const sessionId = context.sessionId || this.generateSessionId(userId);
            const conversationId = context.conversationId || this.generateConversationId(sessionId);

            // Analyze message sentiment and intent
            const messageAnalysis = await sentimentAnalysis.analyzeMessage(message);

            // Get conversation context and memory
            const conversationContext = await this.getConversationContext(userId, sessionId);

            const cacheKey = await this.generateCacheKey(message, userId, conversationContext);

            // Check cache first
            if (process.env.AI_CACHE_ENABLED === 'true' && this.cache.has(cacheKey)) {
                const cachedResponse = this.cache.get(cacheKey);
                if (this.isCacheValid(cachedResponse)) {
                    logger.info('📦 Returning cached AI response');

                    // Save user message to database
                    await this.saveConversation(userId, sessionId, conversationId, 'user', message, {
                        cached: true,
                        sentiment: messageAnalysis.sentiment.sentiment,
                        intent: messageAnalysis.intent.intent,
                        confidence_score: messageAnalysis.intent.confidence,
                        analysis: messageAnalysis
                    });

                    return {
                        response: cachedResponse.data,
                        cached: true,
                        timestamp: new Date(),
                        sessionId,
                        conversationId,
                        analysis: messageAnalysis
                    };
                }
            }

            // Get business context from database
            const businessContext = await this.getBusinessContext(userId);

            // Save user message to database first
            await this.saveConversation(userId, sessionId, conversationId, 'user', message, {
                sentiment: messageAnalysis.sentiment.sentiment,
                intent: messageAnalysis.intent.intent,
                confidence_score: messageAnalysis.intent.confidence,
                analysis: messageAnalysis
            });

            // Prepare enhanced message with conversation context
            const enhancedMessage = await this.prepareEnhancedMessageWithContext(
                message,
                businessContext,
                conversationContext,
                messageAnalysis,
                context
            );

            // Check if Gemini AI service is initialized
            if (!this.gemini) {
                throw new Error('Gemini AI service not initialized. Check API key.');
            }

            logger.info('🤖 Using Gemini AI with enhanced context');
            const responseStartTime = Date.now();
            const response = await this.getGeminiResponse(enhancedMessage);
            const responseTime = Date.now() - responseStartTime;

            // Update context with AI response
            await this.updateContextWithResponse(userId, sessionId, conversationId, response, {
                responseTime,
                tokensUsed: this.estimateTokens(message + response),
                cached: false
            });

            // Cache the response
            if (process.env.AI_CACHE_ENABLED === 'true') {
                this.cacheResponse(cacheKey, response);
            }

            logger.info('🤖 Enhanced AI response generated successfully', {
                responseTime: `${responseTime}ms`,
                sentiment: messageAnalysis.sentiment.sentiment,
                intent: messageAnalysis.intent.intent,
                sessionId
            });

            return {
                response,
                cached: false,
                provider: 'gemini',
                timestamp: new Date(),
                sessionId,
                conversationId,
                analysis: messageAnalysis,
                responseTime,
                metadata: {
                    tokensUsed: this.estimateTokens(message + response),
                    model: 'gemini-1.5-flash'
                }
            };

        } catch (error) {
            logger.error('❌ Error getting AI response:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                error: error.toString()
            });
            return {
                response: 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
                error: true,
                errorMessage: error.message,
                timestamp: new Date()
            };
        }
    }

    /**
     * Get response from Google Gemini
     */
    async getGeminiResponse(message) {
        try {
            if (!this.gemini) {
                throw new Error('Gemini AI service not initialized');
            }

            const model = this.gemini.getGenerativeModel({
                model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
            });

            const generationConfig = {
                temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.4'),
                topK: parseInt(process.env.GEMINI_TOP_K || '40'),
                topP: parseFloat(process.env.GEMINI_TOP_P || '0.95'),
                maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048'),
            };

            logger.info('🤖 Sending request to Gemini API...');
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: message }] }],
                generationConfig
            });

            const responseText = result.response.text();
            logger.info('✅ Gemini API response received successfully');
            return responseText;
        } catch (error) {
            logger.error('❌ Gemini API error:', {
                message: error.message,
                status: error.status,
                statusText: error.statusText,
                stack: error.stack,
                error: error.toString()
            });
            throw new Error(`Gemini API Error: ${error.message}`);
        }
    }



    /**
     * Get business context from database
     */
    async getBusinessContext(userId) {
        try {
            const [rows] = await this.dbPool.execute(`
                SELECT 
                    (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()) as today_orders,
                    (SELECT COUNT(*) FROM products WHERE status = 'active') as active_products,
                    (SELECT COUNT(*) FROM stores WHERE status = 'active') as active_stores,
                    (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
                    (SELECT COALESCE(SUM(total_amount_eur), 0) FROM orders WHERE DATE(created_at) = CURDATE()) as today_revenue,
                    (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders
            `);

            return rows[0] || {};
        } catch (error) {
            logger.error('❌ Error fetching business context:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                error: error.toString()
            });
            return {};
        }
    }

    /**
     * Prepare message with business context (legacy method)
     */
    async prepareMessageWithContext(message, businessContext, additionalContext) {
        const systemPrompt = `
أنت ${process.env.BOT_NAME || 'مساعد المخبز الذكي'}, مساعد ذكي لنظام إدارة المخبز.

معلومات النظام الحالية:
- الطلبات اليوم: ${businessContext.today_orders || 0}
- المنتجات النشطة: ${businessContext.active_products || 0}
- المتاجر النشطة: ${businessContext.active_stores || 0}
- المستخدمين النشطين: ${businessContext.active_users || 0}
- إيرادات اليوم: ${businessContext.today_revenue || 0} ${process.env.DEFAULT_CURRENCY || 'EUR'}
- الطلبات المعلقة: ${businessContext.pending_orders || 0}

تعليمات مهمة:
1. استخدم اللغة العربية في الردود
2. قدم إجابات دقيقة ومفيدة
3. استخدم الإحصائيات المتوفرة في إجاباتك
4. اجعل ردودك واضحة ومنظمة
5. أضف رموز تعبيرية مناسبة لجعل الرد أكثر ودية

السؤال: ${message}
`;

        return systemPrompt;
    }

    /**
     * Enhanced message preparation with conversation context and sentiment analysis
     */
    async prepareEnhancedMessageWithContext(message, businessContext, conversationContext, messageAnalysis, additionalContext) {
        // Build conversation history context
        let conversationHistory = '';
        if (conversationContext.recentConversations && conversationContext.recentConversations.length > 0) {
            conversationHistory = '\n\nسجل المحادثة الأخيرة:\n';
            conversationContext.recentConversations.forEach((conv, index) => {
                const speaker = conv.message_type === 'user' ? 'المستخدم' : 'المساعد';
                conversationHistory += `${index + 1}. ${speaker}: ${conv.content.substring(0, 100)}${conv.content.length > 100 ? '...' : ''}\n`;
            });
        }

        // Build user pattern analysis
        const userStats = conversationContext.userStats || {};
        let userPatterns = '';
        if (userStats.totalMessages > 0) {
            userPatterns = `\n\nتحليل أنماط المستخدم:
- إجمالي الرسائل: ${userStats.totalMessages}
- متوسط وقت الاستجابة: ${Math.round(userStats.avgResponseTime || 0)}ms
- التقييم المتوسط: ${(userStats.avgRating || 0).toFixed(1)}/5
- المشاعر الإيجابية: ${userStats.positiveCount || 0}
- المشاعر السلبية: ${userStats.negativeCount || 0}
- المشاعر المحايدة: ${userStats.neutralCount || 0}`;
        }

        // Current message analysis
        const currentAnalysis = `
تحليل الرسالة الحالية:
- المشاعر: ${this.translateSentiment(messageAnalysis.sentiment.sentiment)} (ثقة: ${(messageAnalysis.sentiment.confidence * 100).toFixed(1)}%)
- النية: ${this.translateIntent(messageAnalysis.intent.intent)} (ثقة: ${(messageAnalysis.intent.confidence * 100).toFixed(1)}%)
- الفئة: ${this.translateCategory(messageAnalysis.intent.category)}
- طول الرسالة: ${messageAnalysis.messageLength} حرف
- اللغة: ${messageAnalysis.language}`;

        const enhancedSystemPrompt = `
أنت ${process.env.BOT_NAME || 'مساعد المخبز الذكي'}, مساعد ذكي متقدم لنظام إدارة المخبز.

معلومات النظام الحالية:
- الطلبات اليوم: ${businessContext.today_orders || 0}
- المنتجات النشطة: ${businessContext.active_products || 0}
- المتاجر النشطة: ${businessContext.active_stores || 0}
- المستخدمين النشطين: ${businessContext.active_users || 0}
- إيرادات اليوم: ${businessContext.today_revenue || 0} ${process.env.DEFAULT_CURRENCY || 'EUR'}
- الطلبات المعلقة: ${businessContext.pending_orders || 0}

${currentAnalysis}

${conversationHistory}

${userPatterns}

تعليمات متقدمة:
1. استخدم اللغة العربية في الردود
2. راعي مشاعر المستخدم ونيته في الرد
3. استفد من سجل المحادثة لتقديم ردود أكثر دقة
4. قدم إجابات مخصصة بناءً على أنماط المستخدم
5. استخدم الإحصائيات المتوفرة في إجاباتك
6. اجعل ردودك واضحة ومنظمة ومناسبة للسياق
7. أضف رموز تعبيرية مناسبة للمشاعر المكتشفة
8. إذا كانت المشاعر سلبية، كن أكثر تفهماً ومساعدة
9. إذا كانت المشاعر إيجابية، شارك الفرحة وقدم معلومات إضافية
10. اقترح أسئلة أو إجراءات تالية مناسبة للنية المكتشفة

السؤال الحالي: ${message}
`;

        return enhancedSystemPrompt;
    }

    /**
     * Translate sentiment to Arabic
     */
    translateSentiment(sentiment) {
        const translations = {
            'positive': 'إيجابية',
            'negative': 'سلبية',
            'neutral': 'محايدة'
        };
        return translations[sentiment] || 'غير محدد';
    }

    /**
     * Translate intent to Arabic
     */
    translateIntent(intent) {
        const translations = {
            'question': 'سؤال',
            'request': 'طلب',
            'complaint': 'شكوى',
            'compliment': 'مجاملة',
            'report_request': 'طلب تقرير',
            'sales_inquiry': 'استفسار مبيعات',
            'inventory_inquiry': 'استفسار مخزون',
            'store_inquiry': 'استفسار متجر',
            'greeting': 'تحية',
            'goodbye': 'وداع',
            'unknown': 'غير محدد'
        };
        return translations[intent] || 'غير محدد';
    }

    /**
     * Translate category to Arabic
     */
    translateCategory(category) {
        const translations = {
            'business': 'أعمال',
            'support': 'دعم',
            'social': 'اجتماعي',
            'general': 'عام'
        };
        return translations[category] || 'عام';
    }

    /**
     * Estimate token count (rough approximation)
     */
    estimateTokens(text) {
        if (!text) return 0;
        // Rough estimation: Arabic words are typically 1.5 tokens each
        const words = text.split(/\s+/).length;
        return Math.ceil(words * 1.5);
    }

    /**
     * Generate cache key for message
     */
    async generateCacheKey(message, userId) {
        const crypto = await import('crypto');
        return crypto.default.createHash('md5').update(`${message}_${userId}`).digest('hex');
    }

    /**
     * Cache AI response
     */
    cacheResponse(key, response) {
        const ttl = parseInt(process.env.AI_CACHE_TTL || '3600') * 1000; // Convert to milliseconds
        this.cache.set(key, {
            data: response,
            timestamp: Date.now(),
            ttl
        });

        // Clean old cache entries
        this.cleanCache();
    }

    /**
     * Check if cached response is still valid
     */
    isCacheValid(cachedItem) {
        return (Date.now() - cachedItem.timestamp) < cachedItem.ttl;
    }

    /**
     * Clean expired cache entries
     */
    cleanCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if ((now - value.timestamp) >= value.ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get suggested questions based on user role and context
     */
    getSuggestedQuestions(userRole = 'user') {
        const questions = {
            admin: [
                "📊 كم عدد الطلبات اليوم؟",
                "💰 ما هي إيرادات هذا الشهر؟",
                "🏪 كم عدد المتاجر النشطة؟",
                "📦 ما هي المنتجات الأكثر مبيعاً؟",
                "🚚 تقرير التوزيع اليوم",
                "📈 تحليل الأداء العام"
            ],
            manager: [
                "📊 إحصائيات المبيعات اليوم",
                "📦 حالة المخزون الحالية",
                "🏪 أداء المتاجر هذا الأسبوع",
                "🚚 تقرير التوزيع",
                "💰 تحليل الأرباح"
            ],
            user: [
                "📊 إحصائيات عامة",
                "📦 معلومات المنتجات",
                "🏪 معلومات المتاجر",
                "🚚 حالة التوزيع"
            ]
        };

        return questions[userRole] || questions.user;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        logger.info('🧹 AI cache cleared');
        return { success: true, message: 'تم مسح الذاكرة المؤقتة بنجاح' };
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: parseInt(process.env.AI_CACHE_MAX_SIZE || '1000'),
            enabled: process.env.AI_CACHE_ENABLED === 'true'
        };
    }

    /**
     * Generate session ID for conversation tracking
     */
    generateSessionId(userId) {
        return `sess_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate conversation ID
     */
    generateConversationId(sessionId) {
        return `conv_${sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get conversation context and memory
     */
    async getConversationContext(userId, sessionId) {
        try {
            // Get short-term memory (current session)
            const shortTermKey = `${userId}_${sessionId}`;
            const shortTermMemory = this.contextMemory.get(shortTermKey) || {};

            // Get recent conversations from database (last 10 messages)
            const recentConversations = await AiConversation.findAll({
                where: { userId, sessionId },
                order: [['created_at', 'DESC']],
                limit: 10,
                attributes: ['content', 'message_type', 'sentiment', 'intent', 'created_at']
            });

            // Get user preferences and long-term patterns
            const userStats = await AiConversation.getUserStats(userId, '30d');

            return {
                shortTerm: shortTermMemory,
                recentConversations: recentConversations.reverse(), // Chronological order
                userStats,
                sessionId,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            logger.error('Error getting conversation context:', error);
            return {
                shortTerm: {},
                recentConversations: [],
                userStats: {},
                sessionId,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Save conversation to database
     */
    async saveConversation(userId, sessionId, conversationId, messageType, content, metadata = {}) {
        try {
            const conversation = await AiConversation.create({
                userId,
                sessionId,
                conversationId,
                messageType,
                content,
                sentiment: metadata.sentiment || null,
                intent: metadata.intent || null,
                confidenceScore: metadata.confidence_score || null,
                responseTimeMs: metadata.response_time || null,
                tokensUsed: metadata.tokens_used || null,
                modelUsed: metadata.model_used || 'gemini-1.5-flash',
                cached: metadata.cached || false,
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString()
                }
            });

            // Update short-term memory
            const shortTermKey = `${userId}_${sessionId}`;
            const currentMemory = this.contextMemory.get(shortTermKey) || {};

            this.contextMemory.set(shortTermKey, {
                ...currentMemory,
                lastMessage: content,
                lastMessageType: messageType,
                messageCount: (currentMemory.messageCount || 0) + 1,
                lastActivity: new Date().toISOString(),
                sentiment: metadata.sentiment,
                intent: metadata.intent
            });

            return conversation;

        } catch (error) {
            logger.error('Error saving conversation:', error);
            return null;
        }
    }

    /**
     * Enhanced cache key generation with context
     */
    async generateCacheKey(message, userId, context = {}) {
        const contextHash = JSON.stringify({
            recentMessages: context.recentConversations?.slice(-3) || [], // Last 3 messages
            userRole: context.userRole || 'user',
            sessionInfo: {
                messageCount: context.shortTerm?.messageCount || 0,
                lastIntent: context.shortTerm?.intent
            }
        });

        const crypto = await import('crypto');
        const hash = crypto.default.createHash('md5').update(message + userId + contextHash).digest('hex');
        return `ai_cache_${hash}`;
    }

    /**
     * Update conversation context with AI response
     */
    async updateContextWithResponse(userId, sessionId, conversationId, response, metadata = {}) {
        try {
            // Save AI response to database
            await this.saveConversation(userId, sessionId, conversationId, 'ai', response, {
                ...metadata,
                response_time: metadata.responseTime,
                tokens_used: metadata.tokensUsed,
                model_used: 'gemini-1.5-flash'
            });

            // Update context memory with response patterns
            const shortTermKey = `${userId}_${sessionId}`;
            const currentMemory = this.contextMemory.get(shortTermKey) || {};

            this.contextMemory.set(shortTermKey, {
                ...currentMemory,
                lastResponse: response.substring(0, 200), // Store first 200 chars
                responseCount: (currentMemory.responseCount || 0) + 1,
                lastResponseTime: metadata.responseTime,
                avgResponseTime: this.calculateAverageResponseTime(currentMemory, metadata.responseTime)
            });

        } catch (error) {
            logger.error('Error updating context with response:', error);
        }
    }

    /**
     * Calculate average response time
     */
    calculateAverageResponseTime(currentMemory, newResponseTime) {
        const currentAvg = currentMemory.avgResponseTime || 0;
        const count = currentMemory.responseCount || 0;

        if (count === 0) return newResponseTime;

        return ((currentAvg * count) + newResponseTime) / (count + 1);
    }

    /**
     * Clean expired context memory
     */
    cleanContextMemory() {
        const now = Date.now();
        const expiredKeys = [];
        const maxAge = 2 * 60 * 60 * 1000; // 2 hours

        for (const [key, memory] of this.contextMemory.entries()) {
            const lastActivity = new Date(memory.lastActivity || 0).getTime();
            if (now - lastActivity > maxAge) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.contextMemory.delete(key));

        if (expiredKeys.length > 0) {
            logger.info(`🧹 Cleaned ${expiredKeys.length} expired context memory entries`);
        }
    }
}

// Export singleton instance
export default new AIService(); 
import { GoogleGenerativeAI } from '@google/generative-ai';
import mysql from 'mysql2/promise';
import logger from '../config/logger.js';

class AIService {
    constructor() {
        this.gemini = null;
        this.dbPool = null;
        this.cache = new Map();
        this.initializeServices();
    }

    /**
     * Initialize AI services and database connection
     */
    async initializeServices() {
        try {
            logger.info('🔧 Initializing Gemini AI service...');

            // Initialize Gemini - Required for AI functionality
            if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
                this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                logger.info('✅ Gemini AI service initialized successfully');
            } else {
                logger.error('❌ Gemini API key not provided - AI functionality will not work');
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

            logger.info('🚀 Gemini AI Service fully initialized');
        } catch (error) {
            logger.error('❌ Failed to initialize Gemini AI Service:', error);
            throw error;
        }
    }

    /**
     * Get AI response using the configured provider
     */
    async getAIResponse(message, userId, context = {}) {
        try {
            const cacheKey = await this.generateCacheKey(message, userId);

            // Check cache first
            if (process.env.AI_CACHE_ENABLED === 'true' && this.cache.has(cacheKey)) {
                const cachedResponse = this.cache.get(cacheKey);
                if (this.isCacheValid(cachedResponse)) {
                    logger.info('📦 Returning cached AI response');
                    return {
                        response: cachedResponse.data,
                        cached: true,
                        timestamp: new Date()
                    };
                }
            }

            // Get business context from database
            const businessContext = await this.getBusinessContext(userId);

            // Prepare the enhanced message with context
            const enhancedMessage = await this.prepareMessageWithContext(message, businessContext, context);

            // Check if Gemini AI service is initialized
            if (!this.gemini) {
                throw new Error('Gemini AI service not initialized. Check API key.');
            }

            logger.info('🤖 Using Gemini AI');
            const response = await this.getGeminiResponse(enhancedMessage);

            // Cache the response
            if (process.env.AI_CACHE_ENABLED === 'true') {
                this.cacheResponse(cacheKey, response);
            }

            logger.info('🤖 Gemini AI response generated successfully');
            return {
                response,
                cached: false,
                provider: 'gemini',
                timestamp: new Date()
            };

        } catch (error) {
            logger.error('❌ Error getting AI response:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                error: error
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
                stack: error.stack
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
                    (SELECT SUM(total_amount) FROM orders WHERE DATE(created_at) = CURDATE()) as today_revenue,
                    (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders
            `);

            return rows[0] || {};
        } catch (error) {
            logger.error('❌ Error fetching business context:', error);
            return {};
        }
    }

    /**
     * Prepare message with business context
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
}

// Export singleton instance
export default new AIService(); 
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../config/logger.js';
import sentimentAnalysis from './sentimentAnalysis.js';
import aiDatabaseTools from './aiDatabaseTools.js';
import aiActionSystem from './aiActionSystem.js';
import AiConversation from '../models/AiConversation.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Enhanced AI Service
 * Provides intelligent conversational AI with database integration and action capabilities
 */
class EnhancedAIService {
    constructor() {
        this.gemini = null;
        this.initialized = false;
        this.conversationMemory = new Map();
        this.intentRecognizer = new IntentRecognizer();
        this.responseGenerator = new ResponseGenerator();
        this.contextManager = new ContextManager();
    }

    /**
     * Initialize the enhanced AI service
     */
    async initialize() {
        if (this.initialized) return;

        try {
            logger.info('🚀 Initializing Enhanced AI Service...');

            // Initialize Gemini AI
            if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
                this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                logger.info('✅ Gemini AI initialized');
            } else {
                throw new Error('Gemini API key not provided');
            }

            // Initialize subsystems
            await aiDatabaseTools.initialize();
            await aiActionSystem.initialize();

            this.initialized = true;
            logger.info('🎉 Enhanced AI Service fully initialized');

        } catch (error) {
            logger.error('❌ Failed to initialize Enhanced AI Service:', error);
            throw error;
        }
    }

    /**
     * Process user message with enhanced intelligence
     */
    async processMessage(message, userId, userRole, context = {}) {
        await this.initialize();

        try {
            const startTime = Date.now();
            logger.info(`🧠 Processing enhanced message from user ${userId} (${userRole})`);

            // Step 1: Analyze message sentiment and intent
            const messageAnalysis = await sentimentAnalysis.analyzeMessage(message);

            // Step 2: Get conversation context and memory
            const conversationContext = await this.getEnhancedConversationContext(userId, context.sessionId);

            // Step 3: Recognize advanced intent and extract parameters
            const intentResult = await this.intentRecognizer.recognizeIntent(
                message,
                messageAnalysis,
                conversationContext,
                userRole
            );

            // Step 4: Execute actions if needed
            let actionResults = [];
            if (intentResult.actions && intentResult.actions.length > 0) {
                for (const action of intentResult.actions) {
                    try {
                        const result = await aiActionSystem.executeAction(
                            action.name,
                            action.parameters,
                            userId,
                            userRole
                        );
                        actionResults.push(result);
                    } catch (error) {
                        logger.error(`Action execution failed: ${action.name}`, error);
                        actionResults.push({
                            success: false,
                            action: action.name,
                            error: error.message
                        });
                    }
                }
            }

            // Step 5: Generate contextual response
            const responseData = await this.responseGenerator.generateResponse(
                message,
                messageAnalysis,
                conversationContext,
                intentResult,
                actionResults,
                userRole
            );

            // Step 6: Update conversation memory
            await this.updateConversationMemory(
                userId,
                context.sessionId,
                message,
                responseData.response,
                messageAnalysis,
                intentResult,
                actionResults
            );

            const processingTime = Date.now() - startTime;

            logger.info(`✅ Enhanced AI response generated in ${processingTime}ms`, {
                intent: intentResult.primaryIntent,
                actionsExecuted: actionResults.length,
                sentiment: messageAnalysis.sentiment.sentiment
            });

            return {
                response: responseData.response,
                metadata: {
                    processingTime,
                    sentiment: messageAnalysis.sentiment,
                    intent: intentResult,
                    actionsExecuted: actionResults,
                    confidence: responseData.confidence,
                    provider: 'gemini',
                    model: 'enhanced-ai-service'
                }
            };

        } catch (error) {
            logger.error('❌ Error in enhanced AI processing:', error);
            return {
                response: 'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
                metadata: {
                    error: true,
                    errorMessage: error.message
                }
            };
        }
    }

    /**
     * Get enhanced conversation context with deep memory
     */
    async getEnhancedConversationContext(userId, sessionId) {
        try {
            // Get recent conversation history
            const recentConversations = await AiConversation.findAll({
                where: { userId, sessionId },
                order: [['created_at', 'DESC']],
                limit: 15,
                attributes: ['content', 'message_type', 'sentiment', 'intent', 'metadata', 'created_at']
            });

            // Get user behavioral patterns
            const userPatterns = await this.getUserBehavioralPatterns(userId);

            // Get business context for the user's role
            const businessContext = await aiDatabaseTools.getBusinessAnalytics('today');

            // Get relevant system alerts
            const systemAlerts = await this.getRelevantSystemAlerts(userId);

            return {
                recentConversations: recentConversations.reverse(),
                userPatterns,
                businessContext,
                systemAlerts,
                sessionId,
                contextGenerated: new Date().toISOString()
            };

        } catch (error) {
            logger.error('Error getting enhanced conversation context:', error);
            return {
                recentConversations: [],
                userPatterns: {},
                businessContext: {},
                systemAlerts: [],
                sessionId,
                contextGenerated: new Date().toISOString()
            };
        }
    }

    /**
     * Get user behavioral patterns for personalization
     */
    async getUserBehavioralPatterns(userId) {
        try {
            const patterns = await AiConversation.getUserStats(userId, '90d');

            // Analyze interaction patterns
            const recentInteractions = await AiConversation.findAll({
                where: { userId },
                order: [['created_at', 'DESC']],
                limit: 100,
                attributes: ['intent', 'sentiment', 'metadata', 'created_at']
            });

            // Calculate preferences
            const intentFrequency = {};
            const timePatterns = {};
            let totalInteractions = 0;

            recentInteractions.forEach(interaction => {
                totalInteractions++;

                // Count intent frequency
                if (interaction.intent) {
                    intentFrequency[interaction.intent] = (intentFrequency[interaction.intent] || 0) + 1;
                }

                // Analyze time patterns
                const hour = new Date(interaction.created_at).getHours();
                timePatterns[hour] = (timePatterns[hour] || 0) + 1;
            });

            // Find most common intents and active hours
            const preferredIntents = Object.entries(intentFrequency)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);

            const activeHours = Object.entries(timePatterns)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3);

            return {
                ...patterns,
                totalInteractions,
                preferredIntents: preferredIntents.map(([intent, count]) => ({ intent, frequency: count / totalInteractions })),
                activeHours: activeHours.map(([hour, count]) => ({ hour: parseInt(hour), frequency: count / totalInteractions })),
                lastInteraction: recentInteractions[0]?.created_at,
                personalityProfile: this.determinePersonalityProfile(recentInteractions)
            };

        } catch (error) {
            logger.error('Error getting user behavioral patterns:', error);
            return {};
        }
    }

    /**
     * Determine user personality profile for personalized responses
     */
    determinePersonalityProfile(interactions) {
        if (!interactions || interactions.length === 0) {
            return { type: 'new_user', confidence: 0 };
        }

        const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
        const intentCounts = {};

        interactions.forEach(interaction => {
            if (interaction.sentiment) {
                sentimentCounts[interaction.sentiment]++;
            }
            if (interaction.intent) {
                intentCounts[interaction.intent] = (intentCounts[interaction.intent] || 0) + 1;
            }
        });

        const totalInteractions = interactions.length;
        const positiveRatio = sentimentCounts.positive / totalInteractions;
        const negativeRatio = sentimentCounts.negative / totalInteractions;

        // Determine personality type
        let personalityType = 'balanced';
        if (positiveRatio > 0.6) personalityType = 'optimistic';
        else if (negativeRatio > 0.4) personalityType = 'analytical';
        else if (intentCounts.question > totalInteractions * 0.5) personalityType = 'inquisitive';
        else if (intentCounts.complaint > totalInteractions * 0.3) personalityType = 'detail_oriented';

        return {
            type: personalityType,
            confidence: Math.min(totalInteractions / 20, 1), // Higher confidence with more interactions
            traits: {
                positiveRatio,
                negativeRatio,
                questionFrequency: (intentCounts.question || 0) / totalInteractions,
                complaintFrequency: (intentCounts.complaint || 0) / totalInteractions
            }
        };
    }

    /**
     * Get relevant system alerts for user
     */
    async getRelevantSystemAlerts(userId) {
        try {
            // Get inventory alerts
            const inventoryAlerts = await aiDatabaseTools.getInventoryAlerts();
            const criticalAlerts = inventoryAlerts.filter(alert =>
                alert.alert_level === 'critical' || alert.alert_level === 'out_of_stock'
            );

            // Get recent trending changes
            const trendingData = await aiDatabaseTools.getTrendingAnalysis('week');
            const importantTrends = trendingData.filter(trend =>
                Math.abs(trend.growth_percentage) > 50
            );

            return {
                inventoryAlerts: criticalAlerts.slice(0, 5),
                trendingAlerts: importantTrends.slice(0, 3),
                alertCount: criticalAlerts.length + importantTrends.length
            };

        } catch (error) {
            logger.error('Error getting system alerts:', error);
            return {
                inventoryAlerts: [],
                trendingAlerts: [],
                alertCount: 0
            };
        }
    }

    /**
     * Update conversation memory with enhanced context
     */
    async updateConversationMemory(userId, sessionId, userMessage, aiResponse, analysis, intentResult, actionResults) {
        try {
            // Save user message
            await AiConversation.create({
                userId,
                sessionId,
                conversationId: intentResult.conversationId || `conv_${Date.now()}`,
                messageType: 'user',
                content: userMessage,
                sentiment: analysis.sentiment.sentiment,
                intent: intentResult.primaryIntent,
                confidenceScore: analysis.intent.confidence,
                metadata: {
                    analysis,
                    intentResult,
                    timestamp: new Date().toISOString()
                }
            });

            // Save AI response
            await AiConversation.create({
                userId,
                sessionId,
                conversationId: intentResult.conversationId || `conv_${Date.now()}`,
                messageType: 'ai',
                content: aiResponse,
                metadata: {
                    actionResults,
                    intentResult,
                    generated: true,
                    timestamp: new Date().toISOString()
                }
            });

            // Update in-memory context
            const memoryKey = `${userId}_${sessionId}`;
            const currentMemory = this.conversationMemory.get(memoryKey) || {
                messageCount: 0,
                topics: new Set(),
                lastInteraction: null
            };

            currentMemory.messageCount += 2; // User + AI message
            if (intentResult.topics) {
                intentResult.topics.forEach(topic => currentMemory.topics.add(topic));
            }
            currentMemory.lastInteraction = new Date().toISOString();
            currentMemory.lastIntent = intentResult.primaryIntent;
            currentMemory.lastSentiment = analysis.sentiment.sentiment;

            this.conversationMemory.set(memoryKey, currentMemory);

        } catch (error) {
            logger.error('Error updating conversation memory:', error);
        }
    }

    /**
     * Get conversation statistics for analytics
     */
    getConversationStats() {
        const stats = {
            activeConversations: this.conversationMemory.size,
            totalMemoryEntries: Array.from(this.conversationMemory.values())
                .reduce((sum, memory) => sum + memory.messageCount, 0),
            uniqueTopics: new Set()
        };

        // Collect all unique topics
        Array.from(this.conversationMemory.values()).forEach(memory => {
            if (memory.topics) {
                memory.topics.forEach(topic => stats.uniqueTopics.add(topic));
            }
        });

        stats.uniqueTopics = stats.uniqueTopics.size;

        return stats;
    }

    /**
     * Clear conversation memory for user
     */
    clearUserMemory(userId, sessionId = null) {
        if (sessionId) {
            this.conversationMemory.delete(`${userId}_${sessionId}`);
        } else {
            // Clear all sessions for user
            const keysToDelete = Array.from(this.conversationMemory.keys())
                .filter(key => key.startsWith(`${userId}_`));
            keysToDelete.forEach(key => this.conversationMemory.delete(key));
        }

        logger.info(`🧹 Cleared conversation memory for user ${userId}${sessionId ? `, session ${sessionId}` : ''}`);
    }
}

/**
 * Advanced Intent Recognition System
 */
class IntentRecognizer {
    constructor() {
        this.actionTriggers = {
            // Data queries
            'analytics': ['إحصائيات', 'تحليل', 'أرقام', 'بيانات', 'تقرير', 'معلومات عن', 'كم عدد', 'ما هو مجموع'],
            'product_info': ['منتج', 'منتجات', 'سعر', 'مخزون', 'كمية', 'متوفر', 'نفد'],
            'store_info': ['متجر', 'محل', 'فرع', 'عميل', 'زبون', 'دكان'],
            'order_info': ['طلب', 'طلبات', 'أوردر', 'حالة الطلب', 'تاريخ التسليم'],
            'financial_info': ['مالية', 'دفع', 'دفعات', 'مبلغ', 'فلوس', 'حساب', 'رصيد'],

            // Actions
            'update_stock': ['تحديث المخزون', 'تعديل الكمية', 'زيادة المخزون', 'تقليل المخزون'],
            'create_report': ['إنشاء تقرير', 'تقرير جديد', 'أريد تقرير'],
            'send_notification': ['إرسال إشعار', 'تنبيه', 'إبلاغ'],
            'predict': ['توقع', 'تنبؤ', 'متوقع', 'سيحتاج', 'سينفد'],

            // Time periods
            'today': ['اليوم', 'اليوم الحالي', 'هذا اليوم'],
            'yesterday': ['أمس', 'البارحة', 'يوم أمس'],
            'week': ['الأسبوع', 'هذا الأسبوع', 'أسبوعياً'],
            'month': ['الشهر', 'هذا الشهر', 'شهرياً'],
            'year': ['السنة', 'هذه السنة', 'سنوياً']
        };
    }

    async recognizeIntent(message, messageAnalysis, conversationContext, userRole) {
        try {
            const lowerMessage = message.toLowerCase();

            // Detect primary intent
            const primaryIntent = messageAnalysis.intent.intent;

            // Detect actions needed
            const actions = this.detectRequiredActions(lowerMessage, primaryIntent, userRole);

            // Extract parameters
            const parameters = this.extractParameters(lowerMessage, actions);

            // Determine topics
            const topics = this.extractTopics(lowerMessage);

            // Generate conversation ID
            const conversationId = conversationContext.sessionId ?
                `conv_${conversationContext.sessionId}_${Date.now()}` :
                `conv_${Date.now()}`;

            return {
                primaryIntent,
                confidence: messageAnalysis.intent.confidence,
                actions,
                parameters,
                topics,
                conversationId,
                requiresSystemAccess: actions.length > 0,
                complexity: this.calculateComplexity(actions, parameters)
            };

        } catch (error) {
            logger.error('Error in intent recognition:', error);
            return {
                primaryIntent: 'unknown',
                confidence: 0,
                actions: [],
                parameters: {},
                topics: [],
                conversationId: `conv_${Date.now()}`,
                requiresSystemAccess: false,
                complexity: 'low'
            };
        }
    }

    detectRequiredActions(message, primaryIntent, userRole) {
        const actions = [];

        // Check for data retrieval actions
        if (this.containsAny(message, this.actionTriggers.analytics)) {
            actions.push({ name: 'get_business_analytics', priority: 'high' });
        }

        if (this.containsAny(message, this.actionTriggers.product_info)) {
            actions.push({ name: 'get_product_analytics', priority: 'medium' });
        }

        if (this.containsAny(message, this.actionTriggers.store_info)) {
            actions.push({ name: 'get_store_performance', priority: 'medium' });
        }

        if (this.containsAny(message, this.actionTriggers.order_info)) {
            actions.push({ name: 'search_orders', priority: 'medium' });
        }

        if (this.containsAny(message, this.actionTriggers.financial_info) && (userRole === 'admin' || userRole === 'manager')) {
            actions.push({ name: 'get_financial_summary', priority: 'high' });
        }

        // Check for system actions (manager/admin only)
        if (userRole === 'admin' || userRole === 'manager') {
            if (this.containsAny(message, this.actionTriggers.update_stock)) {
                actions.push({ name: 'update_product_stock', priority: 'high' });
            }

            if (this.containsAny(message, this.actionTriggers.create_report)) {
                actions.push({ name: 'generate_report', priority: 'high' });
            }

            if (this.containsAny(message, this.actionTriggers.predict)) {
                actions.push({ name: 'predict_stock_needs', priority: 'medium' });
            }
        }

        // Always check inventory alerts if user asks about stock
        if (message.includes('مخزون') || message.includes('كمية') || message.includes('نفد')) {
            actions.push({ name: 'get_inventory_alerts', priority: 'high' });
        }

        return actions.map(action => ({
            ...action,
            parameters: this.extractActionParameters(message, action.name)
        }));
    }

    extractActionParameters(message, actionName) {
        const params = {};

        // Extract time period
        if (this.containsAny(message, this.actionTriggers.today)) {
            params.period = 'today';
        } else if (this.containsAny(message, this.actionTriggers.yesterday)) {
            params.period = 'yesterday';
        } else if (this.containsAny(message, this.actionTriggers.week)) {
            params.period = 'week';
        } else if (this.containsAny(message, this.actionTriggers.month)) {
            params.period = 'month';
        } else if (this.containsAny(message, this.actionTriggers.year)) {
            params.period = 'year';
        }

        // Extract specific parameters based on action
        switch (actionName) {
            case 'get_product_analytics':
                const limitMatch = message.match(/(\d+)\s*(منتج|منتجات)/);
                if (limitMatch) {
                    params.limit = parseInt(limitMatch[1]);
                }
                break;

            case 'search_orders':
                params.filters = {};
                if (message.includes('معلق') || message.includes('pending')) {
                    params.filters.status = 'pending';
                } else if (message.includes('مؤكد') || message.includes('confirmed')) {
                    params.filters.status = 'confirmed';
                } else if (message.includes('مسلم') || message.includes('delivered')) {
                    params.filters.status = 'delivered';
                }
                break;

            case 'predict_stock_needs':
                const daysMatch = message.match(/(\d+)\s*(يوم|أيام)/);
                if (daysMatch) {
                    params.daysAhead = parseInt(daysMatch[1]);
                }
                break;
        }

        return params;
    }

    extractParameters(message, actions) {
        const params = {};

        // Extract numeric values
        const numbers = message.match(/\d+/g);
        if (numbers) {
            params.numbers = numbers.map(n => parseInt(n));
        }

        // Extract product/store names (simple heuristic)
        const namePatterns = [
            /منتج\s+([^\s]+)/gi,
            /متجر\s+([^\s]+)/gi,
            /محل\s+([^\s]+)/gi
        ];

        namePatterns.forEach(pattern => {
            const matches = message.match(pattern);
            if (matches) {
                params.entityNames = params.entityNames || [];
                params.entityNames.push(...matches.map(m => m.split(' ')[1]));
            }
        });

        return params;
    }

    extractTopics(message) {
        const topics = [];
        const topicKeywords = {
            'sales': ['مبيعات', 'بيع', 'شراء', 'عائد'],
            'inventory': ['مخزون', 'كمية', 'متوفر', 'نفد'],
            'finance': ['مالية', 'دفعات', 'فلوس', 'رصيد'],
            'orders': ['طلبات', 'أوردر', 'تسليم'],
            'stores': ['متاجر', 'فروع', 'عملاء'],
            'products': ['منتجات', 'سلع', 'بضائع'],
            'analytics': ['تحليل', 'إحصائيات', 'تقارير']
        };

        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (this.containsAny(message.toLowerCase(), keywords)) {
                topics.push(topic);
            }
        });

        return topics;
    }

    containsAny(text, keywords) {
        return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    }

    calculateComplexity(actions, parameters) {
        let score = 0;

        // More actions = higher complexity
        score += actions.length * 2;

        // More parameters = higher complexity
        score += Object.keys(parameters).length;

        // System actions are more complex
        const systemActions = ['update_product_stock', 'update_order_status', 'send_notification'];
        if (actions.some(action => systemActions.includes(action.name))) {
            score += 5;
        }

        if (score <= 3) return 'low';
        if (score <= 7) return 'medium';
        return 'high';
    }
}

/**
 * Advanced Response Generation System
 */
class ResponseGenerator {
    constructor() {
        this.responseTemplates = {
            greeting: [
                "أهلاً وسهلاً! كيف يمكنني مساعدتك اليوم؟ 😊",
                "مرحباً بك! أنا هنا لمساعدتك في أي استفسار حول المخبز 🏪",
                "السلام عليكم! كيف يمكنني خدمتك؟ 👋"
            ],
            analytics_success: [
                "إليك التحليل المطلوب! 📊",
                "هذه هي الإحصائيات الحالية 📈",
                "تم جمع البيانات بنجاح ✅"
            ],
            action_success: [
                "تم تنفيذ العملية بنجاح! ✅",
                "تمت المهمة كما طلبت 👍",
                "العملية مكتملة بنجاح! 🎉"
            ],
            error: [
                "عذراً، واجهت بعض الصعوبة في تنفيذ طلبك 😔",
                "أعتذر، حدث خطأ أثناء المعالجة ⚠️",
                "للأسف لم أتمكن من إكمال العملية 🚫"
            ]
        };
    }

    async generateResponse(message, messageAnalysis, conversationContext, intentResult, actionResults, userRole) {
        try {
            let response = '';
            let confidence = 0.8;

            // Generate greeting if appropriate
            if (intentResult.primaryIntent === 'greeting') {
                response += this.getRandomTemplate('greeting') + '\n\n';
            }

            // Process action results
            if (actionResults.length > 0) {
                response += await this.processActionResults(actionResults, intentResult, userRole);
                confidence = Math.min(confidence + 0.1, 1.0);
            } else {
                // Generate contextual response using Gemini
                response += await this.generateContextualResponse(
                    message,
                    messageAnalysis,
                    conversationContext,
                    intentResult,
                    userRole
                );
            }

            // Add personalized touch based on user patterns
            if (conversationContext.userPatterns) {
                response = this.personalizeResponse(response, conversationContext.userPatterns);
            }

            // Add relevant suggestions
            const suggestions = this.generateSuggestions(intentResult, actionResults, userRole);
            if (suggestions.length > 0) {
                response += '\n\n💡 **اقتراحات:**\n' + suggestions.join('\n');
            }

            return {
                response: response.trim(),
                confidence
            };

        } catch (error) {
            logger.error('Error generating response:', error);
            return {
                response: this.getRandomTemplate('error') + ' يرجى المحاولة مرة أخرى.',
                confidence: 0.3
            };
        }
    }

    async processActionResults(actionResults, intentResult, userRole) {
        let response = '';

        for (const result of actionResults) {
            if (result.success) {
                response += this.formatActionResult(result) + '\n\n';
            } else {
                response += `⚠️ فشل في تنفيذ ${result.action}: ${result.error}\n\n`;
            }
        }

        return response;
    }

    formatActionResult(result) {
        const { action, result: data } = result;

        switch (action) {
            case 'get_business_analytics':
                return this.formatBusinessAnalytics(data);

            case 'get_product_analytics':
                return this.formatProductAnalytics(data);

            case 'get_store_performance':
                return this.formatStorePerformance(data);

            case 'get_inventory_alerts':
                return this.formatInventoryAlerts(data);

            case 'get_financial_summary':
                return this.formatFinancialSummary(data);

            case 'search_orders':
                return this.formatOrderSearch(data);

            case 'predict_stock_needs':
                return this.formatStockPrediction(data);

            default:
                return `✅ تم تنفيذ ${action} بنجاح`;
        }
    }

    formatBusinessAnalytics(data) {
        if (!data || !data.summary) {
            return '📊 لا توجد بيانات متاحة للفترة المحددة.';
        }

        const { summary } = data;
        return `📊 **تحليل الأعمال:**

🛒 **الطلبات:** ${summary.total_orders || 0} طلب
💰 **الإيرادات:** ${(summary.total_revenue_eur || 0).toFixed(2)} EUR
📈 **متوسط قيمة الطلب:** ${(summary.avg_order_value || 0).toFixed(2)} EUR
✅ **معدل النجاح:** ${(summary.success_rate || 0).toFixed(1)}%

**توزيع الطلبات:**
- معلقة: ${summary.pending_orders || 0}
- مؤكدة: ${summary.confirmed_orders || 0}
- مسلمة: ${summary.delivered_orders || 0}
- ملغاة: ${summary.cancelled_orders || 0}`;
    }

    formatProductAnalytics(data) {
        if (!data || data.length === 0) {
            return '📦 لا توجد بيانات منتجات متاحة.';
        }

        let response = '📦 **تحليل المنتجات الأكثر مبيعاً:**\n\n';

        data.slice(0, 5).forEach((product, index) => {
            response += `${index + 1}. **${product.name}**\n`;
            response += `   💰 السعر: ${product.price_eur} EUR\n`;
            response += `   📊 المبيعات: ${product.total_sold || 0} قطعة\n`;
            response += `   💵 الإيرادات: ${(product.revenue_eur || 0).toFixed(2)} EUR\n`;
            response += `   📦 المخزون: ${product.current_stock} (${product.stock_status})\n\n`;
        });

        return response;
    }

    formatStorePerformance(data) {
        if (!data || data.length === 0) {
            return '🏪 لا توجد بيانات متاجر متاحة.';
        }

        let response = '🏪 **أداء المتاجر:**\n\n';

        data.slice(0, 5).forEach((store, index) => {
            response += `${index + 1}. **${store.name}** (${store.area})\n`;
            response += `   📞 ${store.phone}\n`;
            response += `   🛒 الطلبات: ${store.total_orders || 0}\n`;
            response += `   💰 الإيرادات: ${(store.total_revenue_eur || 0).toFixed(2)} EUR\n`;
            response += `   ✅ معدل النجاح: ${(store.delivery_success_rate || 0).toFixed(1)}%\n`;
            response += `   💳 استخدام الائتمان: ${(store.credit_utilization_percent || 0).toFixed(1)}%\n\n`;
        });

        return response;
    }

    formatInventoryAlerts(data) {
        if (!data || data.length === 0) {
            return '✅ لا توجد تحذيرات مخزون حالياً. جميع المنتجات في مستوى جيد!';
        }

        let response = '⚠️ **تحذيرات المخزون:**\n\n';

        data.forEach(item => {
            const alertEmoji = {
                'out_of_stock': '🚫',
                'critical': '🔴',
                'low': '🟡',
                'medium': '🟠'
            }[item.alert_level] || '⚠️';

            response += `${alertEmoji} **${item.name}**\n`;
            response += `   📦 المخزون الحالي: ${item.current_stock}\n`;
            response += `   📉 الحد الأدنى: ${item.minimum_stock}\n`;
            response += `   📅 أيام التوفر المتبقية: ${item.days_stock_remaining === 999 ? 'غير محدد' : item.days_stock_remaining}\n`;
            response += `   💰 السعر: ${item.price_eur} EUR\n\n`;
        });

        return response;
    }

    formatFinancialSummary(data) {
        if (!data) {
            return '💰 لا توجد بيانات مالية متاحة.';
        }

        return `💰 **الملخص المالي:**

📈 **الإيرادات:**
- مؤكدة: ${(data.confirmed_revenue_eur || 0).toFixed(2)} EUR
- معلقة: ${(data.pending_revenue_eur || 0).toFixed(2)} EUR

💳 **المدفوعات:**
- نقدية: ${data.cash_payments || 0} عملية (${(data.cash_amount_eur || 0).toFixed(2)} EUR)
- بنكية: ${data.bank_payments || 0} عملية (${(data.bank_amount_eur || 0).toFixed(2)} EUR)
- مختلطة: ${data.mixed_payments || 0} عملية

📊 **المؤشرات:**
- إجمالي الطلبات: ${data.total_orders || 0}
- العملاء النشطين: ${data.active_customers || 0}
- متوسط قيمة الطلب: ${(data.avg_order_value || 0).toFixed(2)} EUR

⚠️ **الديون:**
- إجمالي الديون: ${(data.total_debt_eur || 0).toFixed(2)} EUR
- متاجر ديون عالية: ${data.high_debt_stores || 0}`;
    }

    formatOrderSearch(data) {
        if (!data || data.length === 0) {
            return '🔍 لم يتم العثور على طلبات تطابق معايير البحث.';
        }

        let response = `🔍 **نتائج البحث (${data.length} طلب):**\n\n`;

        data.slice(0, 5).forEach(order => {
            response += `📋 **طلب #${order.order_number}**\n`;
            response += `   🏪 المتجر: ${order.store_name} (${order.store_area})\n`;
            response += `   💰 القيمة: ${order.total_amount_eur} EUR\n`;
            response += `   📊 الحالة: ${order.status}\n`;
            response += `   📅 التاريخ: ${new Date(order.created_at).toLocaleDateString('ar')}\n`;
            response += `   📦 عدد الأصناف: ${order.items_count}\n\n`;
        });

        if (data.length > 5) {
            response += `... و ${data.length - 5} طلب آخر`;
        }

        return response;
    }

    formatStockPrediction(data) {
        if (!data) {
            return '🔮 لا يمكن إجراء التنبؤ في الوقت الحالي.';
        }

        const urgencyEmoji = data.prediction.urgency === 'high' ? '🔴' : '🟢';
        const statusEmoji = data.prediction.status === 'needs_restock' ? '⚠️' : '✅';

        return `🔮 **تنبؤ المخزون - ${data.productName}:**

📊 **الوضع الحالي:**
- المخزون: ${data.currentStock} قطعة
- متوسط المبيعات اليومي: ${data.avgDailySales.toFixed(1)} قطعة
- أيام حتى النفاد: ${data.daysUntilStockOut} يوم

📈 **التنبؤ لـ ${data.daysAhead} أيام قادمة:**
- الحاجة المتوقعة: ${data.projectedNeed.toFixed(0)} قطعة
- أسوأ سيناريو: ${data.worstCaseNeed.toFixed(0)} قطعة

${statusEmoji} **التوصية:**
- ${urgencyEmoji} مستوى الأولوية: ${data.prediction.urgency === 'high' ? 'عالي' : 'عادي'}
- 📦 الكمية المقترحة للطلب: ${data.recommendedOrder} قطعة
- 🛡️ مخزون الأمان: ${data.safetyStock} قطعة`;
    }

    async generateContextualResponse(message, messageAnalysis, conversationContext, intentResult, userRole) {
        try {
            // Build context for Gemini
            const contextPrompt = this.buildContextPrompt(
                message,
                messageAnalysis,
                conversationContext,
                intentResult,
                userRole
            );

            // Get response from Gemini
            const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: contextPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1000,
                }
            });

            return result.response.text();

        } catch (error) {
            logger.error('Error generating contextual response:', error);
            return 'أعتذر، أواجه صعوبة في فهم طلبك. هل يمكنك إعادة صياغته؟';
        }
    }

    buildContextPrompt(message, messageAnalysis, conversationContext, intentResult, userRole) {
        const businessContext = conversationContext.businessContext?.summary || {};
        const userPatterns = conversationContext.userPatterns || {};

        return `أنت مساعد ذكي متخصص في إدارة المخبز. اسمك "مساعد المخبز الذكي".

معلومات المستخدم:
- الدور: ${userRole}
- نمط الشخصية: ${userPatterns.personalityProfile?.type || 'متوازن'}
- عدد التفاعلات: ${userPatterns.totalInteractions || 0}

السياق التجاري الحالي:
- الطلبات اليوم: ${businessContext.total_orders || 0}
- الإيرادات اليوم: ${(businessContext.total_revenue_eur || 0).toFixed(2)} EUR
- الطلبات المعلقة: ${businessContext.pending_orders || 0}

تحليل الرسالة:
- المشاعر: ${messageAnalysis.sentiment.sentiment}
- النية: ${messageAnalysis.intent.intent}
- الثقة: ${(messageAnalysis.intent.confidence * 100).toFixed(1)}%

المحادثة السابقة:
${conversationContext.recentConversations.slice(-3).map(conv =>
            `${conv.message_type === 'user' ? 'المستخدم' : 'المساعد'}: ${conv.content.substring(0, 100)}...`
        ).join('\n')}

التحذيرات النشطة:
- تحذيرات المخزون: ${conversationContext.systemAlerts?.alertCount || 0}

تعليمات:
1. استخدم اللغة العربية فقط
2. كن ودوداً ومفيداً
3. استخدم الرموز التعبيرية بشكل مناسب
4. اجعل الإجابة مفصلة ومفيدة
5. راعي مشاعر المستخدم ونمط شخصيته
6. استفد من السياق والمحادثات السابقة
7. قدم نصائح عملية عند الإمكان

السؤال: ${message}`;
    }

    personalizeResponse(response, userPatterns) {
        const personality = userPatterns.personalityProfile?.type;

        switch (personality) {
            case 'optimistic':
                return response.replace('📊', '🎉📊').replace('✅', '🌟✅');
            case 'analytical':
                return response + '\n\n📋 هل تحتاج تفاصيل إضافية أو تحليل أعمق؟';
            case 'inquisitive':
                return response + '\n\n🤔 هل لديك أسئلة أخرى حول هذا الموضوع؟';
            case 'detail_oriented':
                return response + '\n\n📝 يمكنني تقديم معلومات أكثر تفصيلاً إذا كنت بحاجة لذلك.';
            default:
                return response;
        }
    }

    generateSuggestions(intentResult, actionResults, userRole) {
        const suggestions = [];

        // Suggest related actions
        if (intentResult.primaryIntent === 'question' && actionResults.length === 0) {
            suggestions.push('🔍 يمكنني البحث في قاعدة البيانات للحصول على معلومات محددة');
        }

        // Role-based suggestions
        if (userRole === 'admin' || userRole === 'manager') {
            if (intentResult.topics.includes('inventory')) {
                suggestions.push('📦 هل تريد تحديث مستويات المخزون؟');
                suggestions.push('🔮 يمكنني التنبؤ بالاحتياجات المستقبلية للمخزون');
            }

            if (intentResult.topics.includes('sales')) {
                suggestions.push('📊 هل تريد تقرير مبيعات مخصص؟');
                suggestions.push('📈 يمكنني تحليل أنماط المبيعات');
            }
        }

        // General suggestions
        if (suggestions.length === 0) {
            suggestions.push('💡 جرب سؤالي عن: المبيعات، المخزون، الطلبات، أو التقارير');
        }

        return suggestions.slice(0, 3); // Limit to 3 suggestions
    }

    getRandomTemplate(category) {
        const templates = this.responseTemplates[category] || this.responseTemplates.error;
        return templates[Math.floor(Math.random() * templates.length)];
    }
}

/**
 * Context Management System
 */
class ContextManager {
    constructor() {
        this.contexts = new Map();
        this.maxContextAge = 2 * 60 * 60 * 1000; // 2 hours
    }

    getContext(userId, sessionId) {
        const key = `${userId}_${sessionId}`;
        return this.contexts.get(key);
    }

    setContext(userId, sessionId, context) {
        const key = `${userId}_${sessionId}`;
        this.contexts.set(key, {
            ...context,
            lastAccessed: Date.now()
        });
    }

    cleanupOldContexts() {
        const now = Date.now();
        for (const [key, context] of this.contexts.entries()) {
            if (now - context.lastAccessed > this.maxContextAge) {
                this.contexts.delete(key);
            }
        }
    }
}

export default new EnhancedAIService();
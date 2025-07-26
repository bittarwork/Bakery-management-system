import AiConversation from '../models/AiConversation.js';
import logger from '../config/logger.js';
import { Op } from 'sequelize';

/**
 * AI Conversation Controller
 * Handles conversation history, ratings, search, and analytics
 */
class ConversationController {
    /**
     * Get conversation history for a user
     */
    async getConversationHistory(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                conversationId,
                sessionId,
                search,
                sentiment,
                intent,
                dateFrom,
                dateTo
            } = req.query;

            const userId = req.user.id;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Build where clause
            const whereClause = { userId };

            if (conversationId) {
                whereClause.conversationId = conversationId;
            }

            if (sessionId) {
                whereClause.sessionId = sessionId;
            }

            if (search) {
                whereClause.content = {
                    [Op.like]: `%${search}%`
                };
            }

            if (sentiment) {
                whereClause.sentiment = sentiment;
            }

            if (intent) {
                whereClause.intent = intent;
            }

            if (dateFrom || dateTo) {
                whereClause.created_at = {};
                if (dateFrom) {
                    whereClause.created_at[Op.gte] = new Date(dateFrom);
                }
                if (dateTo) {
                    whereClause.created_at[Op.lte] = new Date(dateTo);
                }
            }

            const conversations = await AiConversation.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset,
                attributes: [
                    'id', 'conversationId', 'sessionId', 'messageType',
                    'content', 'sentiment', 'intent', 'rating',
                    'cached', 'responseTimeMs', 'created_at'
                ]
            });

            // Group by conversation for better presentation
            const groupedConversations = this.groupConversationsBySession(conversations.rows);

            res.json({
                success: true,
                data: {
                    conversations: groupedConversations,
                    pagination: {
                        total: conversations.count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(conversations.count / parseInt(limit))
                    },
                    filters: {
                        search, sentiment, intent, dateFrom, dateTo
                    }
                }
            });

        } catch (error) {
            logger.error('Error fetching conversation history:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch conversation history',
                message: 'حدث خطأ أثناء جلب سجل المحادثات'
            });
        }
    }

    /**
     * Rate a conversation message
     */
    async rateConversation(req, res) {
        try {
            const { messageId } = req.params;
            const { rating, feedback } = req.body;
            const userId = req.user.id;

            // Validate rating
            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    error: 'Rating must be between 1 and 5',
                    message: 'التقييم يجب أن يكون بين 1 و 5'
                });
            }

            // Find the AI message to rate
            const conversation = await AiConversation.findOne({
                where: {
                    id: messageId,
                    userId,
                    messageType: 'ai'
                }
            });

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    error: 'Message not found or not ratable',
                    message: 'الرسالة غير موجودة أو لا يمكن تقييمها'
                });
            }

            // Update rating
            await conversation.update({
                rating,
                metadata: {
                    ...conversation.metadata,
                    feedback: feedback || null,
                    ratedAt: new Date().toISOString(),
                    ratedBy: userId
                }
            });

            logger.info(`Message ${messageId} rated ${rating}/5 by user ${userId}`);

            res.json({
                success: true,
                message: 'تم حفظ التقييم بنجاح',
                data: {
                    messageId,
                    rating,
                    feedback
                }
            });

        } catch (error) {
            logger.error('Error rating conversation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to save rating',
                message: 'حدث خطأ أثناء حفظ التقييم'
            });
        }
    }

    /**
     * Get conversation statistics for user
     */
    async getConversationStats(req, res) {
        try {
            const userId = req.user.id;
            const { period = '30d' } = req.query;

            const stats = await AiConversation.getUserStats(userId, period);

            res.json({
                success: true,
                data: {
                    period,
                    stats
                }
            });

        } catch (error) {
            logger.error('Error fetching conversation stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch statistics',
                message: 'حدث خطأ أثناء جلب الإحصائيات'
            });
        }
    }

    // Helper methods

    /**
     * Group conversations by session for better presentation
     */
    groupConversationsBySession(conversations) {
        const grouped = {};

        conversations.forEach(conv => {
            if (!grouped[conv.sessionId]) {
                grouped[conv.sessionId] = {
                    sessionId: conv.sessionId,
                    messages: [],
                    messageCount: 0,
                    lastActivity: null,
                    avgRating: 0,
                    sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 }
                };
            }

            grouped[conv.sessionId].messages.push(conv);
            grouped[conv.sessionId].messageCount++;

            if (!grouped[conv.sessionId].lastActivity ||
                new Date(conv.created_at) > new Date(grouped[conv.sessionId].lastActivity)) {
                grouped[conv.sessionId].lastActivity = conv.created_at;
            }

            if (conv.sentiment) {
                grouped[conv.sessionId].sentimentBreakdown[conv.sentiment]++;
            }
        });

        return Object.values(grouped);
    }
}

export default new ConversationController();

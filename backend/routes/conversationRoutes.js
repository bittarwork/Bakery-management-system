import express from 'express';
import conversationController from '../controllers/conversationController.js';
import { protect } from '../middleware/auth.js';
import { aiChatRateLimit } from '../controllers/aiChatController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Apply rate limiting to conversation routes
router.use(aiChatRateLimit);

/**
 * @route   GET /api/conversations/history
 * @desc    Get conversation history for authenticated user
 * @access  Private
 * @params  page, limit, conversationId, sessionId, search, sentiment, intent, dateFrom, dateTo
 */
router.get('/history', conversationController.getConversationHistory);

/**
 * @route   POST /api/conversations/:messageId/rate
 * @desc    Rate a conversation message
 * @access  Private
 * @body    { rating: number (1-5), feedback?: string }
 */
router.post('/:messageId/rate', conversationController.rateConversation);

/**
 * @route   GET /api/conversations/stats
 * @desc    Get conversation statistics for user
 * @access  Private
 * @params  period (7d, 30d, 90d)
 */
router.get('/stats', conversationController.getConversationStats);

export default router; 
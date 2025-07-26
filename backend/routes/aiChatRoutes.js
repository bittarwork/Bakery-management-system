import express from 'express';
import { aiChatController, aiChatRateLimit } from '../controllers/aiChatController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();

/**
 * AI Chat Routes
 * All routes require authentication
 */

// Apply rate limiting to all AI chat routes
router.use(aiChatRateLimit);

// Apply authentication middleware to all routes
router.use(protect);

/**
 * @route POST /api/ai-chat/message
 * @desc Send message to AI and get response
 * @access Private (All authenticated users)
 */
router.post('/message', aiChatController.sendMessage);

/**
 * @route GET /api/ai-chat/suggested-questions
 * @desc Get suggested questions based on user role
 * @access Private (All authenticated users)
 */
router.get('/suggested-questions', aiChatController.getSuggestedQuestions);

/**
 * @route GET /api/ai-chat/config
 * @desc Get chat configuration for user
 * @access Private (All authenticated users)
 */
router.get('/config', aiChatController.getChatConfig);

/**
 * @route GET /api/ai-chat/analytics
 * @desc Generate analytics report using AI
 * @access Private (Admin only)
 */
router.get('/analytics', aiChatController.getAnalyticsReport);

/**
 * @route DELETE /api/ai-chat/cache
 * @desc Clear AI response cache
 * @access Private (Admin only)
 */
router.delete('/cache', aiChatController.clearCache);

/**
 * @route GET /api/ai-chat/cache/stats
 * @desc Get cache statistics
 * @access Private (Admin only)
 */
router.get('/cache/stats', aiChatController.getCacheStats);

/**
 * @route GET /api/ai-chat/health
 * @desc Health check for AI services
 * @access Private (All authenticated users)
 */
router.get('/health', aiChatController.healthCheck);

export default router; 
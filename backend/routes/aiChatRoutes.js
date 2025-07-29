import express from 'express';
import { aiChatController, aiChatRateLimit } from '../controllers/aiChatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply rate limiting to all AI chat routes
router.use(aiChatRateLimit);

// Apply authentication to all routes
router.use(protect);

// Core AI chat endpoints
router.post('/message', aiChatController.sendMessage);
router.get('/config', aiChatController.getChatConfig);
router.get('/suggestions', aiChatController.getSuggestedQuestions);
router.get('/health', aiChatController.healthCheck);

// Enhanced AI features
router.get('/memory', aiChatController.getConversationMemory);
router.post('/memory/clear', aiChatController.clearConversationMemory);
router.get('/actions', aiChatController.getAvailableActions);
router.get('/actions/history', aiChatController.getActionHistory);

// Analytics and reporting (admin/manager only)
router.get('/analytics', aiChatController.getAnalyticsReport);

export default router; 
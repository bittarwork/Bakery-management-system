# 📋 المواصفات التقنية للميزات الجديدة - نظام AI Chat

## 🔧 1. إصلاح المشاكل الحالية

### أ) حل مشكلة Railway Deployment

#### المشكلة:

```javascript
// خطأ حالي
"Cannot read properties of undefined (reading 'containsInappropriateContent')";
```

#### الحل المقترح:

```javascript
// في aiChatController.js - تحسين معالجة الأخطاء
class AIChatController {
  async sendMessage(req, res) {
    try {
      // Content filtering محسن
      const isInappropriate = this.validateContent(message);
      if (isInappropriate.hasIssues) {
        return res.status(400).json({
          success: false,
          error: isInappropriate.reason,
        });
      }
      // باقي الكود...
    } catch (error) {
      // Error handling محسن
      logger.error("AI Chat Error:", {
        userId: req.user?.id,
        message: message?.substring(0, 100),
        error: error.message,
        stack: error.stack,
      });
      // إرجاع خطأ مفهوم
    }
  }

  validateContent(message) {
    if (!message || typeof message !== "string") {
      return { hasIssues: true, reason: "Invalid message format" };
    }

    const inappropriateWords = ["spam", "hack", "malware", "virus"];
    const lowerMessage = message.toLowerCase();

    for (const word of inappropriateWords) {
      if (lowerMessage.includes(word)) {
        return { hasIssues: true, reason: "Inappropriate content detected" };
      }
    }

    return { hasIssues: false };
  }
}
```

### ب) تحسين نظام الأمان

#### 1. تصفية محتوى متقدمة:

```javascript
// services/contentFilter.js
class ContentFilter {
  constructor() {
    this.inappropriatePatterns = [
      /\b(hack|crack|exploit)\b/gi,
      /\b(spam|scam|fraud)\b/gi,
      /\b(malware|virus|trojan)\b/gi,
    ];
    this.suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
    ];
  }

  async analyzeContent(message) {
    const analysis = {
      isInappropriate: false,
      isSuspicious: false,
      riskLevel: "low",
      reasons: [],
    };

    // فحص الكلمات المحظورة
    for (const pattern of this.inappropriatePatterns) {
      if (pattern.test(message)) {
        analysis.isInappropriate = true;
        analysis.reasons.push("Inappropriate language detected");
        break;
      }
    }

    // فحص المحتوى المشبوه
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(message)) {
        analysis.isSuspicious = true;
        analysis.riskLevel = "high";
        analysis.reasons.push("Suspicious code patterns detected");
        break;
      }
    }

    return analysis;
  }
}
```

#### 2. Rate Limiting ذكي:

```javascript
// middleware/smartRateLimit.js
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

const createSmartRateLimit = () => {
  return rateLimit({
    store: new RedisStore({
      // Redis configuration
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => {
      // حدود مختلفة حسب دور المستخدم
      switch (req.user?.role) {
        case "admin":
          return 200;
        case "manager":
          return 100;
        case "distributor":
          return 50;
        default:
          return 20;
      }
    },
    message: {
      success: false,
      error: "Too many requests. Please slow down.",
      retryAfter: "15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
    // تخطي للمستخدمين الموثوقين
    skip: (req) => {
      return req.user?.trusted === true;
    },
  });
};
```

---

## 💾 2. نظام إدارة المحادثات

### أ) قاعدة البيانات

#### 1. جدول المحادثات:

```sql
-- migrations/create_ai_conversations.sql
CREATE TABLE ai_conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    conversation_id VARCHAR(255) NOT NULL,
    message_type ENUM('user', 'ai', 'system') NOT NULL,
    content TEXT NOT NULL,
    metadata JSON,
    response_time_ms INT,
    tokens_used INT,
    model_used VARCHAR(100),
    cached BOOLEAN DEFAULT FALSE,
    rating TINYINT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_created_at (created_at),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- جدول إحصائيات المحادثات
CREATE TABLE ai_conversation_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    total_messages INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    avg_response_time DECIMAL(8,2) DEFAULT 0,
    satisfaction_score DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_user_date (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 2. نموذج البيانات:

```javascript
// models/AiConversation.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AiConversation = sequelize.define(
  "AiConversation",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    sessionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "session_id",
    },
    conversationId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "conversation_id",
    },
    messageType: {
      type: DataTypes.ENUM("user", "ai", "system"),
      allowNull: false,
      field: "message_type",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    responseTimeMs: {
      type: DataTypes.INTEGER,
      field: "response_time_ms",
    },
    tokensUsed: {
      type: DataTypes.INTEGER,
      field: "tokens_used",
    },
    modelUsed: {
      type: DataTypes.STRING(100),
      field: "model_used",
    },
    cached: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rating: {
      type: DataTypes.TINYINT,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    tableName: "ai_conversations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// العلاقات
AiConversation.belongsTo(User, { foreignKey: "userId", as: "user" });

export default AiConversation;
```

### ب) APIs للمحادثات

#### 1. Controller للمحادثات:

```javascript
// controllers/conversationController.js
class ConversationController {
  // الحصول على تاريخ المحادثات
  async getConversationHistory(req, res) {
    try {
      const { page = 1, limit = 20, conversationId, search } = req.query;
      const userId = req.user.id;

      const whereClause = { userId };

      if (conversationId) {
        whereClause.conversationId = conversationId;
      }

      if (search) {
        whereClause.content = {
          [Op.like]: `%${search}%`,
        };
      }

      const conversations = await AiConversation.findAndCountAll({
        where: whereClause,
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "full_name"],
          },
        ],
      });

      res.json({
        success: true,
        data: {
          conversations: conversations.rows,
          pagination: {
            total: conversations.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(conversations.count / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      logger.error("Error fetching conversation history:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch conversation history",
      });
    }
  }

  // تقييم المحادثة
  async rateConversation(req, res) {
    try {
      const { conversationId, rating, feedback } = req.body;
      const userId = req.user.id;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: "Rating must be between 1 and 5",
        });
      }

      await AiConversation.update(
        {
          rating,
          metadata: {
            feedback: feedback || null,
            ratedAt: new Date(),
          },
        },
        {
          where: {
            id: conversationId,
            userId,
            messageType: "ai",
          },
        }
      );

      res.json({
        success: true,
        message: "Rating saved successfully",
      });
    } catch (error) {
      logger.error("Error rating conversation:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save rating",
      });
    }
  }

  // إحصائيات المحادثات
  async getConversationStats(req, res) {
    try {
      const userId = req.user.id;
      const { period = "30d" } = req.query;

      let dateFilter;
      switch (period) {
        case "7d":
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      const stats = await AiConversation.findAll({
        where: {
          userId,
          created_at: {
            [Op.gte]: dateFilter,
          },
        },
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "totalMessages"],
          [sequelize.fn("SUM", sequelize.col("tokens_used")), "totalTokens"],
          [
            sequelize.fn("AVG", sequelize.col("response_time_ms")),
            "avgResponseTime",
          ],
          [sequelize.fn("AVG", sequelize.col("rating")), "avgRating"],
          [
            sequelize.fn(
              "COUNT",
              sequelize.literal("CASE WHEN cached = true THEN 1 END")
            ),
            "cachedResponses",
          ],
        ],
        raw: true,
      });

      res.json({
        success: true,
        data: {
          period,
          stats: stats[0] || {
            totalMessages: 0,
            totalTokens: 0,
            avgResponseTime: 0,
            avgRating: 0,
            cachedResponses: 0,
          },
        },
      });
    } catch (error) {
      logger.error("Error fetching conversation stats:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch conversation statistics",
      });
    }
  }
}

export default new ConversationController();
```

---

## 🧠 3. ذكاء اصطناعي متقدم

### أ) Context Memory ذكي

#### 1. نظام الذاكرة:

```javascript
// services/contextMemory.js
class ContextMemoryService {
  constructor() {
    this.shortTermMemory = new Map(); // في الذاكرة
    this.longTermMemoryTTL = 7 * 24 * 60 * 60 * 1000; // أسبوع
  }

  async storeContext(userId, sessionId, context) {
    // ذاكرة قصيرة المدى (في الجلسة)
    const key = `${userId}_${sessionId}`;
    this.shortTermMemory.set(key, {
      ...context,
      timestamp: Date.now(),
    });

    // ذاكرة طويلة المدى (في قاعدة البيانات)
    await this.storeLongTermContext(userId, context);
  }

  async getContext(userId, sessionId) {
    // جلب الذاكرة قصيرة المدى
    const shortTermKey = `${userId}_${sessionId}`;
    const shortTerm = this.shortTermMemory.get(shortTermKey) || {};

    // جلب الذاكرة طويلة المدى
    const longTerm = await this.getLongTermContext(userId);

    return {
      shortTerm,
      longTerm,
      preferences: await this.getUserPreferences(userId),
    };
  }

  async storeLongTermContext(userId, context) {
    // تخزين المعلومات المهمة في قاعدة البيانات
    const importantContext = this.extractImportantContext(context);

    if (Object.keys(importantContext).length > 0) {
      await AiConversation.create({
        userId,
        sessionId: "context_memory",
        conversationId: `context_${Date.now()}`,
        messageType: "system",
        content: JSON.stringify(importantContext),
        metadata: {
          type: "context_memory",
          extractedAt: new Date(),
        },
      });
    }
  }

  extractImportantContext(context) {
    const important = {};

    // استخراج المعلومات المهمة
    if (context.businessMetrics) {
      important.businessMetrics = context.businessMetrics;
    }

    if (context.userPreferences) {
      important.userPreferences = context.userPreferences;
    }

    if (context.frequentQueries) {
      important.frequentQueries = context.frequentQueries;
    }

    return important;
  }
}
```

### ب) تحليل المشاعر والنوايا

#### 1. خدمة تحليل المشاعر:

```javascript
// services/sentimentAnalysis.js
class SentimentAnalysisService {
  constructor() {
    this.positiveWords = ["ممتاز", "رائع", "جيد", "شكرا", "مفيد"];
    this.negativeWords = ["سيء", "مشكلة", "خطأ", "لا يعمل", "صعب"];
    this.neutralWords = ["كيف", "ماذا", "متى", "أين", "لماذا"];
  }

  async analyzeSentiment(message) {
    const words = message.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    words.forEach((word) => {
      if (this.positiveWords.some((pw) => word.includes(pw))) {
        positiveScore++;
      } else if (this.negativeWords.some((nw) => word.includes(nw))) {
        negativeScore++;
      } else if (this.neutralWords.some((neu) => word.includes(neu))) {
        neutralScore++;
      }
    });

    const totalScore = positiveScore + negativeScore + neutralScore;

    if (totalScore === 0) {
      return { sentiment: "neutral", confidence: 0.5 };
    }

    const sentiment =
      positiveScore > negativeScore
        ? positiveScore > neutralScore
          ? "positive"
          : "neutral"
        : negativeScore > neutralScore
        ? "negative"
        : "neutral";

    const confidence =
      Math.max(positiveScore, negativeScore, neutralScore) / totalScore;

    return {
      sentiment,
      confidence,
      scores: {
        positive: positiveScore / totalScore,
        negative: negativeScore / totalScore,
        neutral: neutralScore / totalScore,
      },
    };
  }

  async detectIntent(message) {
    const intents = {
      question: ["كيف", "ماذا", "متى", "أين", "لماذا", "هل"],
      request: ["أريد", "أحتاج", "يمكن", "من فضلك"],
      complaint: ["مشكلة", "خطأ", "لا يعمل", "سيء"],
      compliment: ["شكرا", "ممتاز", "رائع", "جيد"],
      report: ["تقرير", "إحصائيات", "بيانات", "أرقام"],
    };

    const messageLower = message.toLowerCase();
    let detectedIntent = "unknown";
    let confidence = 0;

    for (const [intent, keywords] of Object.entries(intents)) {
      const matches = keywords.filter((keyword) =>
        messageLower.includes(keyword)
      ).length;

      const currentConfidence = matches / keywords.length;
      if (currentConfidence > confidence) {
        confidence = currentConfidence;
        detectedIntent = intent;
      }
    }

    return {
      intent: detectedIntent,
      confidence,
      suggestions: this.getIntentSuggestions(detectedIntent),
    };
  }

  getIntentSuggestions(intent) {
    const suggestions = {
      question: ["يمكنني الإجابة على أسئلتك حول المبيعات والمخزون"],
      request: ["سأساعدك في تحقيق ما تحتاجه"],
      complaint: ["آسف لهذه المشكلة، دعني أساعدك في حلها"],
      compliment: ["شكراً لك! أنا سعيد لمساعدتك"],
      report: ["يمكنني إنشاء تقارير مفصلة لك"],
    };

    return suggestions[intent] || ["كيف يمكنني مساعدتك؟"];
  }
}
```

---

## 📊 4. تقارير وتحليلات متقدمة

### أ) Dashboard الإحصائيات

#### 1. خدمة التحليلات:

```javascript
// services/analyticsService.js
class AnalyticsService {
  async generateAIChatAnalytics(userId, period = "30d") {
    const dateRange = this.getDateRange(period);

    // إحصائيات الاستخدام
    const usageStats = await this.getUsageStats(userId, dateRange);

    // تحليل الأسئلة الشائعة
    const popularQuestions = await this.getPopularQuestions(userId, dateRange);

    // تحليل الرضا
    const satisfactionAnalysis = await this.getSatisfactionAnalysis(
      userId,
      dateRange
    );

    // تحليل الأداء
    const performanceMetrics = await this.getPerformanceMetrics(
      userId,
      dateRange
    );

    return {
      period,
      dateRange,
      usage: usageStats,
      popularQuestions,
      satisfaction: satisfactionAnalysis,
      performance: performanceMetrics,
      insights: await this.generateInsights(usageStats, satisfactionAnalysis),
    };
  }

  async getUsageStats(userId, dateRange) {
    const stats = await AiConversation.findAll({
      where: {
        userId,
        created_at: {
          [Op.between]: [dateRange.start, dateRange.end],
        },
      },
      attributes: [
        [sequelize.fn("DATE", sequelize.col("created_at")), "date"],
        [sequelize.fn("COUNT", sequelize.col("id")), "messageCount"],
        [sequelize.fn("SUM", sequelize.col("tokens_used")), "tokensUsed"],
        [
          sequelize.fn("AVG", sequelize.col("response_time_ms")),
          "avgResponseTime",
        ],
      ],
      group: [sequelize.fn("DATE", sequelize.col("created_at"))],
      order: [[sequelize.fn("DATE", sequelize.col("created_at")), "ASC"]],
      raw: true,
    });

    return {
      dailyStats: stats,
      totalMessages: stats.reduce(
        (sum, day) => sum + parseInt(day.messageCount),
        0
      ),
      totalTokens: stats.reduce(
        (sum, day) => sum + parseInt(day.tokensUsed || 0),
        0
      ),
      avgResponseTime:
        stats.reduce(
          (sum, day) => sum + parseFloat(day.avgResponseTime || 0),
          0
        ) / stats.length,
    };
  }

  async getPopularQuestions(userId, dateRange) {
    const questions = await AiConversation.findAll({
      where: {
        userId,
        messageType: "user",
        created_at: {
          [Op.between]: [dateRange.start, dateRange.end],
        },
      },
      attributes: [
        "content",
        [sequelize.fn("COUNT", sequelize.col("content")), "frequency"],
      ],
      group: ["content"],
      order: [[sequelize.fn("COUNT", sequelize.col("content")), "DESC"]],
      limit: 10,
      raw: true,
    });

    return questions.map((q) => ({
      question:
        q.content.substring(0, 100) + (q.content.length > 100 ? "..." : ""),
      frequency: parseInt(q.frequency),
      category: this.categorizeQuestion(q.content),
    }));
  }

  categorizeQuestion(question) {
    const categories = {
      sales: ["مبيعات", "بيع", "عائد", "ربح"],
      inventory: ["مخزون", "منتج", "كمية", "نفد"],
      reports: ["تقرير", "إحصائية", "بيانات"],
      stores: ["متجر", "فرع", "محل"],
      general: [],
    };

    const questionLower = question.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => questionLower.includes(keyword))) {
        return category;
      }
    }

    return "general";
  }
}
```

---

## 🎨 5. واجهة المستخدم المحسنة

### أ) مكونات React محسنة

#### 1. مكون الدردشة المتقدم:

```jsx
// components/ai-chat/EnhancedChatInterface.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Share,
  Download,
  Mic,
  MicOff,
} from "lucide-react";

const EnhancedChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [theme, setTheme] = useState("light");
  const messagesEndRef = useRef(null);
  const recognition = useRef(null);

  // Voice recognition setup
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = "ar-SA";

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
        setIsRecording(false);
      };

      recognition.current.onerror = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const handleVoiceInput = () => {
    if (isRecording) {
      recognition.current?.stop();
      setIsRecording(false);
    } else {
      recognition.current?.start();
      setIsRecording(true);
    }
  };

  const handleSendMessage = async (content) => {
    // إضافة رسالة المستخدم
    const userMessage = {
      id: Date.now(),
      type: "user",
      content,
      timestamp: new Date(),
      sentiment: await analyzeSentiment(content),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // إرسال الرسالة للخادم
      const response = await aiChatService.sendMessage(content);

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: response.data.message,
        timestamp: new Date(),
        cached: response.data.cached,
        provider: response.data.provider,
        actions: generateMessageActions(response.data.message),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      // معالجة الخطأ
      const errorMessage = {
        id: Date.now() + 1,
        type: "error",
        content: "عذراً، حدث خطأ أثناء معالجة رسالتك.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateMessageActions = (content) => {
    const actions = [];

    // إذا كانت الرسالة تحتوي على أرقام، أضف إمكانية النسخ
    if (/\d+/.test(content)) {
      actions.push({
        icon: Copy,
        label: "نسخ الأرقام",
        action: () => copyNumbers(content),
      });
    }

    // إذا كانت الرسالة تحتوي على تقرير، أضف إمكانية التصدير
    if (content.includes("تقرير") || content.includes("إحصائية")) {
      actions.push({
        icon: Download,
        label: "تصدير التقرير",
        action: () => exportReport(content),
      });
    }

    // إضافة إمكانية المشاركة دائماً
    actions.push({
      icon: Share,
      label: "مشاركة",
      action: () => shareMessage(content),
    });

    return actions;
  };

  return (
    <div className={`enhanced-chat-interface ${theme}`}>
      {/* شريط الأدوات العلوي */}
      <div className="chat-toolbar">
        <div className="chat-status">
          <div className="status-indicator online"></div>
          <span>مساعد المخبز الذكي</span>
        </div>

        <div className="chat-controls">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="theme-toggle"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <button
            onClick={handleVoiceInput}
            className={`voice-button ${isRecording ? "recording" : ""}`}
          >
            {isRecording ? <MicOff /> : <Mic />}
          </button>
        </div>
      </div>

      {/* منطقة الرسائل */}
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`message ${message.type}`}
            >
              <EnhancedMessageBubble
                message={message}
                onRate={handleRateMessage}
                onAction={handleMessageAction}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* مؤشر الكتابة */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="typing-indicator"
          >
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>المساعد يكتب...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* منطقة الإدخال */}
      <EnhancedChatInput
        onSendMessage={handleSendMessage}
        isRecording={isRecording}
        onVoiceInput={handleVoiceInput}
      />
    </div>
  );
};
```

هذه خطة شاملة لتطوير نظام AI Chat. هل تريد أن نبدأ بتنفيذ أي من هذه الميزات؟ أم تفضل التركيز على حل المشكلة الحالية في Railway أولاً؟

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  User,
  Clock,
  Zap,
  Star,
  Copy,
  Share,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const ChatMessage = ({
  message,
  isTyping = false,
  onRate,
  onCopy,
  onShare,
}) => {
  const isUser = message.sender === "user";
  const isAI = message.sender === "ai";
  const [showActions, setShowActions] = useState(false);
  const [rating, setRating] = useState(message.rating || 0);
  const [isRating, setIsRating] = useState(false);

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: ar,
      });
    } catch (error) {
      console.warn("Invalid timestamp:", timestamp);
      return "";
    }
  };

  const formatMessage = (text) => {
    if (!text) return "";

    // Convert line breaks to JSX
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleRate = async (newRating) => {
    if (!onRate || isRating) return;

    setIsRating(true);
    try {
      await onRate(message.id, newRating);
      setRating(newRating);
    } catch (error) {
      console.error("Error rating message:", error);
    } finally {
      setIsRating(false);
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message.message);
      if (onCopy) onCopy(message.message);
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "😊";
      case "negative":
        return "😟";
      case "neutral":
        return "😐";
      default:
        return "";
    }
  };

  const getIntentBadge = (intent) => {
    const intentColors = {
      question: "bg-blue-100 text-blue-800",
      request: "bg-green-100 text-green-800",
      complaint: "bg-red-100 text-red-800",
      compliment: "bg-purple-100 text-purple-800",
      report_request: "bg-yellow-100 text-yellow-800",
      sales_inquiry: "bg-indigo-100 text-indigo-800",
      inventory_inquiry: "bg-orange-100 text-orange-800",
      store_inquiry: "bg-teal-100 text-teal-800",
      greeting: "bg-pink-100 text-pink-800",
      goodbye: "bg-gray-100 text-gray-800",
    };

    const intentLabels = {
      question: "سؤال",
      request: "طلب",
      complaint: "شكوى",
      compliment: "مجاملة",
      report_request: "طلب تقرير",
      sales_inquiry: "استفسار مبيعات",
      inventory_inquiry: "استفسار مخزون",
      store_inquiry: "استفسار متجر",
      greeting: "تحية",
      goodbye: "وداع",
    };

    if (!intent || intent === "unknown") return null;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          intentColors[intent] || "bg-gray-100 text-gray-800"
        }`}
      >
        {intentLabels[intent] || intent}
      </span>
    );
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex gap-3 mb-6 ${
        isUser ? "justify-end" : "justify-start"
      } group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar - shown for AI messages or at start of user messages */}
      {isAI && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-[70%] ${isUser ? "order-first" : ""}`}>
        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
              : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
          }`}
        >
          {/* Typing indicator */}
          {isTyping ? (
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                {[0, 1, 2].map((dot) => (
                  <motion.div
                    key={dot}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: dot * 0.2,
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 mr-2">
                {import.meta.env.VITE_BOT_NAME || "المساعد الذكي"} يكتب...
              </span>
            </div>
          ) : (
            <div className="text-sm leading-relaxed">
              {formatMessage(message.message)}
            </div>
          )}
        </div>

        {/* Message Metadata */}
        {!isTyping && (
          <div
            className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            {/* Timestamp */}
            {message.timestamp && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatTimestamp(message.timestamp)}</span>
              </div>
            )}

            {/* AI-specific metadata */}
            {isAI && (
              <>
                {/* Cached indicator */}
                {message.cached && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Zap className="h-3 w-3" />
                    <span>مخزن مؤقتاً</span>
                  </div>
                )}

                {/* Response time */}
                {message.responseTime && (
                  <span>• {message.responseTime}ms</span>
                )}

                {/* Sentiment indicator */}
                {message.analysis?.sentiment?.sentiment && (
                  <span>
                    • {getSentimentEmoji(message.analysis.sentiment.sentiment)}
                  </span>
                )}

                {/* Provider indicator */}
                {message.provider && (
                  <div className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {message.provider === "gemini"
                      ? "Gemini"
                      : message.provider === "openai"
                      ? "OpenAI"
                      : message.provider}
                  </div>
                )}
              </>
            )}

            {/* User message sentiment and intent */}
            {isUser && message.analysis && (
              <>
                {message.analysis.sentiment?.sentiment && (
                  <span>
                    • {getSentimentEmoji(message.analysis.sentiment.sentiment)}
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* Intent Badge (for user messages) */}
        {isUser && message.analysis?.intent?.intent && (
          <div className="mt-2">
            {getIntentBadge(message.analysis.intent.intent)}
          </div>
        )}

        {/* Rating Section (for AI messages only) */}
        {isAI && !isTyping && onRate && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">تقييم الإجابة:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  disabled={isRating}
                  className={`p-1 rounded transition-colors ${
                    star <= rating
                      ? "text-yellow-500 hover:text-yellow-600"
                      : "text-gray-300 hover:text-yellow-400"
                  } ${
                    isRating
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <Star
                    size={12}
                    fill={star <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-xs text-gray-500">({rating}/5)</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!isTyping && showActions && (
          <div
            className={`flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            <button
              onClick={handleCopy}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="نسخ النص"
            >
              <Copy size={14} />
            </button>

            {onShare && (
              <button
                onClick={() => onShare(message)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="مشاركة"
              >
                <Share size={14} />
              </button>
            )}

            <button
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="المزيد"
            >
              <MoreVertical size={14} />
            </button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;

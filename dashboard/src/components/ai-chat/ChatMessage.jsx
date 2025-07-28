import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  User,
  Clock,
  Copy,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "react-hot-toast";

const ChatMessage = ({
  message,
  isTyping = false,
}) => {
  const isUser = message?.sender === "user";
  const isAI = message?.sender === "ai";
  const [copied, setCopied] = useState(false);

  // Animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      },
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
      return "";
    }
  };

  const formatMessage = (text) => {
    if (!text) return "";
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleCopy = async () => {
    if (!message?.message) return;
    
    try {
      await navigator.clipboard.writeText(message.message);
      setCopied(true);
      toast.success("تم نسخ النص");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("فشل في نسخ النص");
    }
  };

  // Typing indicator component
  if (isTyping) {
    return (
      <motion.div
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        className="flex items-start gap-3 mb-6"
      >
        {/* AI Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Bot className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Typing bubble */}
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm max-w-xs">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: dot * 0.15,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">يكتب...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex items-start gap-3 mb-6 group ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center shadow-lg">
            <User className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm relative group ${
            isUser
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
              : "bg-white border border-gray-200 text-gray-800 rounded-bl-md hover:shadow-md transition-shadow"
          }`}
        >
          {/* Special indicators */}
          {isAI && message?.isWelcome && (
            <div className="flex items-center gap-1 mb-2 text-blue-600">
              <Sparkles className="w-3 h-3" />
              <span className="text-xs font-medium">رسالة ترحيب</span>
            </div>
          )}

          {/* Message text */}
          <div className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>
            {formatMessage(message?.message)}
          </div>

          {/* Copy button for AI messages */}
          {isAI && (
            <button
              onClick={handleCopy}
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200"
              title="نسخ النص"
            >
              {copied ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        {/* Message metadata */}
        <div
          className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
            isUser ? "flex-row-reverse" : ""
          }`}
        >
          {/* Timestamp */}
          {message?.timestamp && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimestamp(message.timestamp)}</span>
            </div>
          )}

          {/* AI-specific indicators */}
          {isAI && (
            <>
              {message?.cached && (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>سريع</span>
                </div>
              )}

              {message?.provider && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {message.provider}
                </span>
              )}
            </>
          )}

          {/* Error indicator */}
          {message?.isError && (
            <span className="text-red-500 text-xs">خطأ في الإرسال</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;

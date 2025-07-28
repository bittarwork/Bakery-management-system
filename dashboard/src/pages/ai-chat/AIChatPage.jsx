import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  MessageCircle,
  Trash2,
  RefreshCw,
  Zap,
  AlertCircle,
  Plus,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ChatMessage from "../../components/ai-chat/ChatMessage";
import ChatInput from "../../components/ai-chat/ChatInput";
import SuggestedQuestions from "../../components/ai-chat/SuggestedQuestions";
import ImprovedChatManager from "../../components/ai-chat/ImprovedChatManager";
import aiChatService from "../../services/aiChatService";
import { useAuthStore } from "../../stores/authStore";
import { toast } from "react-hot-toast";

const AIChatPage = () => {
  // State
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [chatConfig, setChatConfig] = useState(null);
  const [error, setError] = useState("");
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  // Multi-chat state
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [showChatManager, setShowChatManager] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auth
  const { user } = useAuthStore();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat history and chats on mount
  useEffect(() => {
    // Load multi-chat data
    const allChats = aiChatService.getAllChats();
    const currentActiveChat = aiChatService.getActiveChat();

    setChats(allChats);
    setActiveChat(currentActiveChat);

    // Load messages from active chat
    const history = aiChatService.getChatHistory();
    setMessages(history);
  }, []);

  const loadInitialData = async () => {
    try {
      setIsConfigLoading(true);

      // Load chat configuration
      const config = await aiChatService.getChatConfig();
      setChatConfig(config);

      // Load suggested questions
      const questions = await aiChatService.getSuggestedQuestions();
      setSuggestedQuestions(questions);

      // Add welcome message if no chat history
      const history = aiChatService.getChatHistory();
      if (history.length === 0 && config.welcomeMessage) {
        const welcomeMessage = {
          id: "welcome-" + Date.now(),
          sender: "ai",
          message: config.welcomeMessage,
          timestamp: new Date(),
          isWelcome: true,
        };
        setMessages([welcomeMessage]);
        aiChatService.addToHistory("ai", config.welcomeMessage, {
          isWelcome: true,
        });
      }
    } catch (error) {
      console.error("❌ Error loading initial data:", error);
      setError("فشل في تحميل إعدادات الدردشة");
    } finally {
      setIsConfigLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    // Ensure we have an active chat
    if (!activeChat) {
      const newChat = aiChatService.createNewChat();
      const updatedChats = aiChatService.getAllChats();
      setChats(updatedChats);
      setActiveChat(newChat);
    }

    // Validate message
    const validation = aiChatService.validateMessage(messageText);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      setIsLoading(true);
      setIsTyping(true);
      setError("");

      // Add user message to UI immediately
      const userMessage = {
        id: Date.now() + "-user",
        sender: "user",
        message: messageText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send to AI service
      const response = await aiChatService.sendMessage(messageText);

      // Add AI response to UI
      const aiMessage = {
        id: Date.now() + "-ai",
        sender: "ai",
        message: response.message,
        timestamp: new Date(response.timestamp),
        cached: response.cached,
        provider: response.provider,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Update chats list
      const updatedChats = aiChatService.getAllChats();
      setChats(updatedChats);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setError("فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.");

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + "-error",
        sender: "ai",
        message: "عذراً، حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة مرة أخرى.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuestionClick = (question) => {
    handleSendMessage(question);
  };

  const handleClearChat = () => {
    if (!activeChat) return;

    if (
      window.confirm(
        `هل تريد مسح جميع الرسائل في "${activeChat.title}"؟`
      )
    ) {
      aiChatService.clearChatHistory();
      setMessages([]);

      // Add welcome message again
      if (chatConfig?.welcomeMessage) {
        const welcomeMessage = {
          id: "welcome-" + Date.now(),
          sender: "ai",
          message: chatConfig.welcomeMessage,
          timestamp: new Date(),
          isWelcome: true,
        };
        setMessages([welcomeMessage]);
        aiChatService.addToHistory("ai", chatConfig.welcomeMessage, {
          isWelcome: true,
        });
      }

      // Update chats list
      const updatedChats = aiChatService.getAllChats();
      setChats(updatedChats);
      toast.success("تم مسح المحادثة");
    }
  };

  const handleRefreshSuggestions = async () => {
    try {
      const questions = await aiChatService.getSuggestedQuestions();
      setSuggestedQuestions(questions);
      toast.success("تم تحديث الاقتراحات");
    } catch (error) {
      toast.error("فشل في تحديث الاقتراحات");
    }
  };

  const getMessageStats = () => {
    return aiChatService.getMessageStats();
  };

  // Multi-chat management functions
  const handleCreateNewChat = (title) => {
    const newChat = aiChatService.createNewChat(title);
    const updatedChats = aiChatService.getAllChats();

    setChats(updatedChats);
    setActiveChat(newChat);
    setMessages([]);

    // Add welcome message to new chat if configured
    if (chatConfig?.welcomeMessage) {
      const welcomeMessage = {
        id: "welcome-" + Date.now(),
        sender: "ai",
        message: chatConfig.welcomeMessage,
        timestamp: new Date(),
        isWelcome: true,
      };
      setMessages([welcomeMessage]);
      aiChatService.addToHistory("ai", chatConfig.welcomeMessage, {
        isWelcome: true,
      });
    }
  };

  const handleSelectChat = (chat) => {
    const selectedChat = aiChatService.selectChat(chat.id);
    if (selectedChat) {
      setActiveChat(selectedChat);
      setMessages(selectedChat.messages);
      setShowChatManager(false);
    }
  };

  const handleDeleteChat = (chatId) => {
    aiChatService.deleteChat(chatId);
    const updatedChats = aiChatService.getAllChats();
    const currentActiveChat = aiChatService.getActiveChat();

    setChats(updatedChats);
    setActiveChat(currentActiveChat);
    setMessages(currentActiveChat ? currentActiveChat.messages : []);
  };

  const handleRenameChat = (chatId, newTitle) => {
    aiChatService.renameChat(chatId, newTitle);
    const updatedChats = aiChatService.getAllChats();
    setChats(updatedChats);
    
    // Update active chat if it's the one being renamed
    if (activeChat && activeChat.id === chatId) {
      setActiveChat(prev => ({ ...prev, title: newTitle }));
    }
  };

  const handleArchiveChat = (chatId, archived) => {
    aiChatService.archiveChat(chatId, archived);
    const updatedChats = aiChatService.getAllChats();
    setChats(updatedChats);
  };

  const renderMainChatArea = () => (
    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {activeChat?.title || "مساعد المخبز الذكي"}
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                مساعدك الذكي لإدارة المخبز
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Message Stats */}
            <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 mr-4">
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg">
                <MessageCircle className="w-3 h-3" />
                <span>{getMessageStats().total}</span>
              </div>
              {getMessageStats().cachedResponses > 0 && (
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  <Zap className="w-3 h-3" />
                  <span>{getMessageStats().cacheHitRate}%</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={handleRefreshSuggestions}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <RefreshCw className="w-4 h-4" />
            </EnhancedButton>

            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="text-red-600 border-red-200 hover:bg-red-50"
              disabled={!activeChat || messages.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </EnhancedButton>
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <SuggestedQuestions
          questions={suggestedQuestions}
          onQuestionClick={handleQuestionClick}
          isLoading={false}
        />
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && <ChatMessage message={{ sender: "ai" }} isTyping={true} />}

        {/* Empty State */}
        {messages.length === 0 && !isTyping && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              مرحباً بك! 
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              أنا مساعدك الذكي لإدارة المخبز. اسألني عن أي شيء تريد معرفته!
            </p>
            {chats.length === 0 && (
              <EnhancedButton
                onClick={() => handleCreateNewChat()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                ابدأ محادثة جديدة
              </EnhancedButton>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 bg-gray-50">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          maxLength={chatConfig?.maxMessageLength || 1000}
          placeholder={
            activeChat 
              ? "اكتب رسالتك هنا..." 
              : "ابدأ محادثة جديدة..."
          }
        />
      </div>
    </div>
  );

  // Loading state
  if (isConfigLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل المساعد الذكي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile Chat Manager Overlay */}
      <AnimatePresence>
        {showChatManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
            onClick={() => setShowChatManager(false)}
          >
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 h-full bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <ImprovedChatManager
                chats={chats}
                activeChat={activeChat}
                onSelectChat={handleSelectChat}
                onCreateChat={handleCreateNewChat}
                onDeleteChat={handleDeleteChat}
                onRenameChat={handleRenameChat}
                onArchiveChat={handleArchiveChat}
                onClose={() => setShowChatManager(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex transition-all duration-300 ${showChatManager ? 'w-80' : 'w-16'}`}>
        <div className="w-full bg-white shadow-lg">
          {showChatManager ? (
            <ImprovedChatManager
              chats={chats}
              activeChat={activeChat}
              onSelectChat={handleSelectChat}
              onCreateChat={handleCreateNewChat}
              onDeleteChat={handleDeleteChat}
              onRenameChat={handleRenameChat}
              onArchiveChat={handleArchiveChat}
            />
          ) : (
            <div className="p-4 h-full flex flex-col items-center">
              <button
                onClick={() => setShowChatManager(true)}
                className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg transition-all mb-4"
              >
                <Menu className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleCreateNewChat()}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between mb-4">
          <button
            onClick={() => setShowChatManager(true)}
            className="p-2 rounded-lg bg-white shadow-md text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => handleCreateNewChat()}
            className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {renderMainChatArea()}
      </div>
    </div>
  );
};

export default AIChatPage;

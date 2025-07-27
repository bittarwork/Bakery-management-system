import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  MessageCircle,
  Trash2,
  Download,
  Settings,
  RefreshCw,
  Zap,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Brain,
  TrendingUp,
  FileText,
  Target,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ChatMessage from "../../components/ai-chat/ChatMessage";
import ChatInput from "../../components/ai-chat/ChatInput";
import SuggestedQuestions from "../../components/ai-chat/SuggestedQuestions";
import AIDashboard from "../../components/ai-chat/AIDashboard";
import DetailedReports from "../../components/ai-chat/DetailedReports";
import PredictionSystem from "../../components/ai-chat/PredictionSystem";
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
  const [activeTab, setActiveTab] = useState("chat");

  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auth
  const { user } = useAuthStore();

  // Tab configuration
  const tabs = [
    {
      id: "chat",
      label: "المحادثة",
      icon: MessageCircle,
      description: "تحدث مع المساعد الذكي",
    },
    {
      id: "dashboard",
      label: "لوحة التحكم",
      icon: Brain,
      description: "نظرة شاملة على أداء المخبز",
    },
    {
      id: "reports",
      label: "التقارير التفصيلية",
      icon: FileText,
      description: "تحليلات متقدمة ورؤى تفصيلية",
    },
    {
      id: "predictions",
      label: "التنبؤات الذكية",
      icon: Target,
      description: "توقعات مستقبلية مدعومة بالذكاء الاصطناعي",
    },
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat history on mount
  useEffect(() => {
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
    if (window.confirm("هل أنت متأكد من أنك تريد مسح سجل المحادثة؟")) {
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "chat":
        return renderChatContent();
      case "dashboard":
        return <AIDashboard />;
      case "reports":
        return <DetailedReports />;
      case "predictions":
        return <PredictionSystem />;
      default:
        return renderChatContent();
    }
  };

  const renderChatContent = () => (
    <Card className="flex-1 flex flex-col overflow-hidden">
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
          className="p-4 bg-red-50 border-b border-red-200 flex items-center gap-2 text-red-700"
        >
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: "calc(100vh - 400px)" }}
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
          <div className="text-center py-12">
            <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              مرحباً بك في المساعد الذكي!
            </h3>
            <p className="text-gray-500">
              ابدأ محادثة بكتابة سؤالك أو اختر أحد الاقتراحات أعلاه
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        maxLength={chatConfig?.maxMessageLength || 1000}
        placeholder="اسأل عن أي شيء متعلق بالمخبز..."
      />
    </Card>
  );

  // Loading state
  if (isConfigLoading) {
    return (
      <Card className="h-full">
        <CardBody className="flex items-center justify-center h-96">
          <div className="text-center">
            <LoadingSpinner className="mx-auto mb-4" />
            <p className="text-gray-600">جارٍ تحميل المساعد الذكي...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {chatConfig?.botName || "المساعد الذكي المطور"}
                </h1>
                <p className="text-sm text-gray-600">
                  مساعدك الشخصي المتطور لنظام إدارة المخبز مع تحليلات وتنبؤات
                  ذكية
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Message Stats (Only for Chat tab) */}
              {activeTab === "chat" && (
                <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 mr-4">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{getMessageStats().total} رسالة</span>
                  </div>
                  {getMessageStats().cachedResponses > 0 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Zap className="h-3 w-3" />
                      <span>{getMessageStats().cacheHitRate}% مخزن مؤقتاً</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {activeTab === "chat" && (
                <>
                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshSuggestions}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </EnhancedButton>

                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    onClick={handleClearChat}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </EnhancedButton>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs Navigation */}
      <Card className="mb-4">
        <CardBody className="p-0">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <div className="text-right">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-500 hidden sm:block">
                      {tab.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Tab Content */}
      <div className="flex-1">{renderTabContent()}</div>
    </div>
  );
};

export default AIChatPage;

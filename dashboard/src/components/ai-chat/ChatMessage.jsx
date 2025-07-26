import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Clock, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const ChatMessage = ({ message, isTyping = false }) => {
    const isUser = message.sender === 'user';
    const isAI = message.sender === 'ai';

    // Animation variants
    const messageVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { duration: 0.3 }
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        
        try {
            const date = new Date(timestamp);
            return formatDistanceToNow(date, { 
                addSuffix: true, 
                locale: ar 
            });
        } catch (error) {
            console.warn('Invalid timestamp:', timestamp);
            return '';
        }
    };

    const formatMessage = (text) => {
        if (!text) return '';
        
        // Convert line breaks to JSX
        return text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < text.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
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
            <div className={`max-w-[70%] ${isUser ? 'order-first' : ''}`}>
                {/* Message Bubble */}
                <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                        isUser
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
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
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: dot * 0.2
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 mr-2">
                                {import.meta.env.VITE_BOT_NAME || 'المساعد الذكي'} يكتب...
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
                    <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                        isUser ? 'justify-end' : 'justify-start'
                    }`}>
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

                                {/* Provider indicator */}
                                {message.provider && (
                                    <div className="px-2 py-1 bg-gray-100 rounded text-xs">
                                        {message.provider === 'gemini' ? 'Gemini' : 
                                         message.provider === 'openai' ? 'OpenAI' : 
                                         message.provider}
                                    </div>
                                )}
                            </>
                        )}
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
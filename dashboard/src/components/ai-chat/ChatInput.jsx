import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile, Loader2 } from 'lucide-react';

const ChatInput = ({ 
    onSendMessage, 
    disabled = false, 
    placeholder = "اكتب رسالتك هنا...",
    maxLength = 1000,
    showCharacterCount = true,
}) => {
    const [message, setMessage] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage('');
            
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const isMessageValid = message.trim().length > 0 && message.length <= maxLength;
    const remainingChars = maxLength - message.length;
    const isNearLimit = remainingChars < 100;

    return (
        <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Main Input Container */}
                <div className={`relative flex items-end gap-3 p-3 rounded-2xl border-2 transition-all duration-200 ${
                    isFocused 
                        ? 'border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-500/10' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                } ${disabled ? 'opacity-60' : ''}`}>
                    
                    {/* Emoji Button */}
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded-xl transition-all duration-200"
                        disabled={disabled}
                    >
                        <Smile className="w-5 h-5" />
                    </motion.button>

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={disabled ? "المساعد يفكر..." : placeholder}
                        disabled={disabled}
                        maxLength={maxLength}
                        rows={1}
                        className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-gray-900 placeholder-gray-500 text-sm leading-relaxed min-h-[40px] max-h-[120px] py-2"
                        style={{ 
                            direction: 'rtl',
                            fontFamily: 'Cairo, system-ui, sans-serif'
                        }}
                    />

                    {/* Send Button */}
                    <motion.button
                        type="submit"
                        disabled={!isMessageValid || disabled}
                        whileHover={{ scale: isMessageValid && !disabled ? 1.05 : 1 }}
                        whileTap={{ scale: isMessageValid && !disabled ? 0.95 : 1 }}
                        className={`flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 ${
                            isMessageValid && !disabled
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {disabled ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </motion.button>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-2">
                    {/* Shortcuts hint */}
                    <div className="text-xs text-gray-500">
                        {disabled ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                المساعد يعمل على الرد...
                            </div>
                        ) : (
                            "Enter للإرسال • Shift+Enter للسطر الجديد"
                        )}
                    </div>

                    {/* Character count */}
                    {showCharacterCount && !disabled && (
                        <div className={`text-xs transition-colors ${
                            isNearLimit ? 'text-orange-500 font-medium' : 
                            remainingChars < 0 ? 'text-red-500 font-medium' : 
                            'text-gray-400'
                        }`}>
                            {remainingChars < 0 && "⚠️ "}
                            {Math.abs(remainingChars)} {remainingChars < 0 ? "حرف زائد" : "حرف متبقي"}
                        </div>
                    )}
                </div>

                {/* Error message for exceeded limit */}
                {message.length > maxLength && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 px-2 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
                    >
                        <span className="text-red-500">⚠️</span>
                        الرسالة طويلة جداً. يُسمح بحد أقصى {maxLength.toLocaleString()} حرف.
                    </motion.div>
                )}

                {/* Quick suggestions when empty */}
                {!message.trim() && !disabled && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-wrap gap-2 px-2"
                    >
                        {[
                            "ما هي أحدث الطلبات؟",
                            "كيف أضيف منتج جديد؟",
                            "عرض المبيعات اليوم",
                        ].map((suggestion, index) => (
                            <motion.button
                                key={index}
                                type="button"
                                onClick={() => setMessage(suggestion)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-full transition-all duration-200 border border-gray-200 hover:border-gray-300"
                            >
                                {suggestion}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </form>
        </div>
    );
};

export default ChatInput; 
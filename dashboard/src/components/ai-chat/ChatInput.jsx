import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Paperclip, Smile } from 'lucide-react';
import EnhancedButton from '../ui/EnhancedButton';

const ChatInput = ({ 
    onSendMessage, 
    disabled = false, 
    placeholder = "اكتب رسالتك هنا...",
    maxLength = 1000,
    showCharacterCount = true,
    allowAttachments = false,
    allowVoice = false 
}) => {
    const [message, setMessage] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
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
        <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Input Container */}
                <div className={`relative rounded-2xl border-2 transition-all duration-200 ${
                    isFocused 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                        : 'border-gray-200 hover:border-gray-300'
                }`}>
                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        disabled={disabled}
                        maxLength={maxLength}
                        rows={1}
                        className="w-full px-4 py-3 pr-20 bg-transparent border-0 resize-none focus:outline-none text-gray-900 placeholder-gray-500 text-sm leading-relaxed max-h-32 overflow-y-auto"
                        style={{ 
                            minHeight: '44px',
                            direction: 'rtl',
                            fontFamily: 'Cairo, system-ui, sans-serif'
                        }}
                    />

                    {/* Action Buttons */}
                    <div className="absolute left-2 bottom-2 flex items-center gap-1">
                        {/* Voice Input (if enabled) */}
                        {allowVoice && (
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100"
                                disabled={disabled}
                            >
                                <Mic className="h-4 w-4" />
                            </motion.button>
                        )}

                        {/* Attachments (if enabled) */}
                        {allowAttachments && (
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100"
                                disabled={disabled}
                            >
                                <Paperclip className="h-4 w-4" />
                            </motion.button>
                        )}

                        {/* Emoji Picker */}
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100"
                            disabled={disabled}
                        >
                            <Smile className="h-4 w-4" />
                        </motion.button>

                        {/* Send Button */}
                        <motion.button
                            type="submit"
                            disabled={!isMessageValid || disabled}
                            whileHover={{ scale: isMessageValid ? 1.05 : 1 }}
                            whileTap={{ scale: isMessageValid ? 0.95 : 1 }}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                                isMessageValid && !disabled
                                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <Send className="h-4 w-4" />
                        </motion.button>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                        {/* Keyboard Shortcut */}
                        <span>اضغط Enter للإرسال، Shift+Enter لسطر جديد</span>
                    </div>

                    {/* Character Count */}
                    {showCharacterCount && (
                        <div className={`transition-colors ${
                            isNearLimit ? 'text-orange-500' : 
                            remainingChars < 0 ? 'text-red-500' : 
                            'text-gray-400'
                        }`}>
                            {remainingChars} حرف متبقي
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {message.length > maxLength && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1"
                    >
                        ⚠️ الرسالة طويلة جداً. الحد الأقصى {maxLength} حرف.
                    </motion.div>
                )}

                {/* Disabled Message */}
                {disabled && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-gray-500 text-center flex items-center justify-center gap-2"
                    >
                        <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
                        المساعد الذكي يعمل على إعداد الرد...
                    </motion.div>
                )}
            </form>
        </div>
    );
};

export default ChatInput; 
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Zap } from 'lucide-react';

const SuggestedQuestions = ({ 
    questions = [], 
    onQuestionClick, 
    isLoading = false,
    title = "اقتراحات سريعة" 
}) => {
    if (!questions.length && !isLoading) {
        return null;
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.3 }
        }
    };

    return (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-medium text-gray-700">{title}</h3>
                <Zap className="h-3 w-3 text-yellow-500" />
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex gap-2">
                    {[...Array(3)].map((_, index) => (
                        <div
                            key={index}
                            className="h-8 bg-gray-200 rounded-full animate-pulse"
                            style={{ width: `${80 + Math.random() * 40}px` }}
                        />
                    ))}
                </div>
            ) : (
                /* Questions Grid */
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap gap-2"
                >
                    {questions.map((question, index) => (
                        <motion.button
                            key={index}
                            variants={itemVariants}
                            whileHover={{ 
                                scale: 1.02,
                                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)"
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onQuestionClick(question)}
                            className="inline-flex items-center px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-full hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-sm"
                        >
                            <span className="text-xs mr-1">💭</span>
                            {question}
                        </motion.button>
                    ))}
                </motion.div>
            )}

            {/* Help Text */}
            <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                <span>💡</span>
                <span>انقر على أي سؤال لإرساله مباشرة</span>
            </div>
        </div>
    );
};

export default SuggestedQuestions; 
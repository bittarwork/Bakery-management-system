import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';

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
        hidden: { opacity: 0, x: 20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.3 }
        }
    };

    return (
        <div className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-gray-100">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex flex-wrap gap-2">
                    {[...Array(4)].map((_, index) => (
                        <div
                            key={index}
                            className="h-10 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl animate-pulse"
                            style={{ width: `${120 + Math.random() * 80}px` }}
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
                                scale: 1.03,
                                y: -2,
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onQuestionClick(question)}
                            className="group inline-flex items-center gap-2 px-4 py-2.5 text-sm bg-white/80 backdrop-blur-sm border border-white/50 text-gray-700 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-200 hover:text-blue-700 transition-all duration-300 font-medium"
                        >
                            <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                                {index === 0 ? "🚀" : index === 1 ? "💡" : index === 2 ? "📊" : "❓"}
                            </span>
                            <span>{question}</span>
                            <ArrowLeft className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-all duration-300 transform group-hover:-translate-x-1" />
                        </motion.button>
                    ))}
                </motion.div>
            )}

            {/* Help Text */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 bg-white/40 backdrop-blur-sm rounded-xl py-2 px-4"
            >
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>اختر سؤالاً أو اكتب سؤالك الخاص</span>
                <Sparkles className="w-3 h-3 text-purple-500" />
            </motion.div>
        </div>
    );
};

export default SuggestedQuestions; 
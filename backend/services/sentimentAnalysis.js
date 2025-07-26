import logger from '../config/logger.js';

/**
 * Advanced Sentiment Analysis and Intent Detection Service
 * Analyzes Arabic text for emotions and user intentions
 */
class SentimentAnalysisService {
    constructor() {
        // Arabic positive words and phrases
        this.positiveWords = [
            'ممتاز', 'رائع', 'جيد', 'شكرا', 'شكراً', 'مفيد', 'أحسنت', 'بارك الله فيك',
            'جميل', 'حلو', 'كويس', 'تمام', 'زين', 'حبيبي', 'يعطيك العافية',
            'مشكور', 'الله يعطيك العافية', 'أحبك', 'حبيت', 'عجبني', 'أعجبني',
            'سعيد', 'فرحان', 'مبسوط', 'راضي', 'مرتاح', 'مسرور', 'محبوب',
            'نجح', 'نجاح', 'توفيق', 'بركة', 'خير', 'نعمة', 'بشرى'
        ];

        // Arabic negative words and phrases
        this.negativeWords = [
            'سيء', 'مشكلة', 'خطأ', 'لا يعمل', 'صعب', 'معقد', 'مستحيل',
            'زعلان', 'حزين', 'مكتئب', 'متضايق', 'غضبان', 'عصبان', 'منرفز',
            'فاشل', 'فشل', 'خراب', 'خرب', 'عطلان', 'مكسور', 'تالف',
            'مش كويس', 'مش حلو', 'وحش', 'بشع', 'قبيح', 'مقرف',
            'صعوبة', 'تعب', 'إرهاق', 'ملل', 'يأس', 'إحباط', 'قلق',
            'خوف', 'رعب', 'فزع', 'هلع', 'توتر', 'ضغط', 'أزمة'
        ];

        // Neutral/question words
        this.neutralWords = [
            'كيف', 'ماذا', 'متى', 'أين', 'لماذا', 'هل', 'من', 'أي',
            'كم', 'أين', 'وين', 'شو', 'إيش', 'ليش', 'إزاي', 'إمتى'
        ];

        // Intent patterns with Arabic keywords
        this.intentPatterns = {
            question: {
                keywords: ['كيف', 'ماذا', 'متى', 'أين', 'لماذا', 'هل', 'من', 'أي', 'كم', 'شو', 'إيش', 'ليش'],
                weight: 1.0
            },
            request: {
                keywords: ['أريد', 'أحتاج', 'يمكن', 'من فضلك', 'لو سمحت', 'ممكن', 'عايز', 'بدي'],
                weight: 1.2
            },
            complaint: {
                keywords: ['مشكلة', 'خطأ', 'لا يعمل', 'سيء', 'عطلان', 'مكسور', 'فاشل', 'مش شغال'],
                weight: 1.5
            },
            compliment: {
                keywords: ['شكرا', 'شكراً', 'ممتاز', 'رائع', 'جيد', 'مشكور', 'بارك الله فيك'],
                weight: 1.1
            },
            report_request: {
                keywords: ['تقرير', 'إحصائيات', 'بيانات', 'أرقام', 'تحليل', 'نتائج', 'معلومات'],
                weight: 1.3
            },
            sales_inquiry: {
                keywords: ['مبيعات', 'بيع', 'عائد', 'ربح', 'دخل', 'إيرادات', 'مال'],
                weight: 1.2
            },
            inventory_inquiry: {
                keywords: ['مخزون', 'منتج', 'منتجات', 'كمية', 'نفد', 'متوفر', 'باقي'],
                weight: 1.2
            },
            store_inquiry: {
                keywords: ['متجر', 'فرع', 'محل', 'دكان', 'مكان', 'موقع', 'عنوان'],
                weight: 1.1
            },
            greeting: {
                keywords: ['مرحبا', 'مرحباً', 'أهلا', 'أهلاً', 'السلام عليكم', 'صباح الخير', 'مساء الخير'],
                weight: 0.8
            },
            goodbye: {
                keywords: ['وداعا', 'وداعاً', 'مع السلامة', 'إلى اللقاء', 'باي', 'تصبح على خير'],
                weight: 0.8
            }
        };

        // Emotion intensity modifiers
        this.intensityModifiers = {
            high: ['جداً', 'جدا', 'كثير', 'كتير', 'أوي', 'قوي', 'شديد', 'للغاية'],
            low: ['شوية', 'شويه', 'قليل', 'بسيط', 'خفيف', 'نوعاً ما']
        };
    }

    /**
     * Analyze sentiment of Arabic text
     * @param {string} message - The message to analyze
     * @returns {Object} Sentiment analysis results
     */
    async analyzeSentiment(message) {
        try {
            if (!message || typeof message !== 'string') {
                return this.getDefaultSentiment();
            }

            const cleanMessage = this.preprocessText(message);
            const words = cleanMessage.split(/\s+/);

            let positiveScore = 0;
            let negativeScore = 0;
            let neutralScore = 0;
            let intensityMultiplier = 1;

            // Check for intensity modifiers
            intensityMultiplier = this.calculateIntensity(cleanMessage);

            // Analyze each word
            words.forEach(word => {
                const cleanWord = word.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z]/g, '');

                if (this.positiveWords.some(pw => cleanWord.includes(pw) || pw.includes(cleanWord))) {
                    positiveScore += intensityMultiplier;
                } else if (this.negativeWords.some(nw => cleanWord.includes(nw) || nw.includes(cleanWord))) {
                    negativeScore += intensityMultiplier;
                } else if (this.neutralWords.some(neu => cleanWord.includes(neu) || neu.includes(cleanWord))) {
                    neutralScore += 0.5;
                }
            });

            // Calculate final sentiment
            const totalScore = positiveScore + negativeScore + neutralScore;

            if (totalScore === 0) {
                return this.getDefaultSentiment();
            }

            let sentiment;
            let confidence;

            if (positiveScore > negativeScore && positiveScore > neutralScore) {
                sentiment = 'positive';
                confidence = positiveScore / totalScore;
            } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
                sentiment = 'negative';
                confidence = negativeScore / totalScore;
            } else {
                sentiment = 'neutral';
                confidence = Math.max(neutralScore, Math.min(positiveScore, negativeScore)) / totalScore;
            }

            // Adjust confidence based on message length and complexity
            confidence = this.adjustConfidence(confidence, message, totalScore);

            return {
                sentiment,
                confidence: Math.min(confidence, 1.0),
                scores: {
                    positive: positiveScore / totalScore,
                    negative: negativeScore / totalScore,
                    neutral: neutralScore / totalScore
                },
                intensity: intensityMultiplier,
                wordCount: words.length,
                analysis: {
                    positiveWords: positiveScore,
                    negativeWords: negativeScore,
                    neutralWords: neutralScore
                }
            };

        } catch (error) {
            logger.error('Error in sentiment analysis:', error);
            return this.getDefaultSentiment();
        }
    }

    /**
     * Detect user intent from message
     * @param {string} message - The message to analyze
     * @returns {Object} Intent detection results
     */
    async detectIntent(message) {
        try {
            if (!message || typeof message !== 'string') {
                return this.getDefaultIntent();
            }

            const cleanMessage = this.preprocessText(message);
            const detectedIntents = [];

            // Check each intent pattern
            for (const [intentName, pattern] of Object.entries(this.intentPatterns)) {
                let score = 0;
                let matchedKeywords = [];

                pattern.keywords.forEach(keyword => {
                    if (cleanMessage.includes(keyword)) {
                        score += pattern.weight;
                        matchedKeywords.push(keyword);
                    }
                });

                if (score > 0) {
                    detectedIntents.push({
                        intent: intentName,
                        score,
                        confidence: Math.min(score / pattern.keywords.length, 1.0),
                        matchedKeywords,
                        weight: pattern.weight
                    });
                }
            }

            // Sort by score and get the best match
            detectedIntents.sort((a, b) => b.score - a.score);

            const primaryIntent = detectedIntents[0] || { intent: 'unknown', confidence: 0 };
            const secondaryIntents = detectedIntents.slice(1, 3);

            return {
                intent: primaryIntent.intent,
                confidence: primaryIntent.confidence || 0,
                score: primaryIntent.score || 0,
                matchedKeywords: primaryIntent.matchedKeywords || [],
                secondaryIntents: secondaryIntents.map(intent => ({
                    intent: intent.intent,
                    confidence: intent.confidence
                })),
                suggestions: this.getIntentSuggestions(primaryIntent.intent),
                category: this.categorizeIntent(primaryIntent.intent)
            };

        } catch (error) {
            logger.error('Error in intent detection:', error);
            return this.getDefaultIntent();
        }
    }

    /**
     * Combined analysis of sentiment and intent
     * @param {string} message - The message to analyze
     * @returns {Object} Combined analysis results
     */
    async analyzeMessage(message) {
        try {
            const [sentimentResult, intentResult] = await Promise.all([
                this.analyzeSentiment(message),
                this.detectIntent(message)
            ]);

            return {
                sentiment: sentimentResult,
                intent: intentResult,
                messageLength: message ? message.length : 0,
                language: this.detectLanguage(message),
                timestamp: new Date().toISOString(),
                processingTime: Date.now()
            };

        } catch (error) {
            logger.error('Error in message analysis:', error);
            return {
                sentiment: this.getDefaultSentiment(),
                intent: this.getDefaultIntent(),
                messageLength: 0,
                language: 'unknown',
                timestamp: new Date().toISOString(),
                processingTime: Date.now()
            };
        }
    }

    /**
     * Preprocess Arabic text
     * @param {string} text - Text to preprocess
     * @returns {string} Cleaned text
     */
    preprocessText(text) {
        if (!text) return '';

        return text
            .toLowerCase()
            .trim()
            // Normalize Arabic characters
            .replace(/[إأآا]/g, 'ا')
            .replace(/[ىي]/g, 'ي')
            .replace(/ة/g, 'ه')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove punctuation but keep Arabic text
            .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]/g, ' ')
            .trim();
    }

    /**
     * Calculate intensity multiplier based on modifiers
     * @param {string} message - The message to analyze
     * @returns {number} Intensity multiplier
     */
    calculateIntensity(message) {
        let multiplier = 1;

        // Check for high intensity modifiers
        if (this.intensityModifiers.high.some(modifier => message.includes(modifier))) {
            multiplier = 1.5;
        }
        // Check for low intensity modifiers
        else if (this.intensityModifiers.low.some(modifier => message.includes(modifier))) {
            multiplier = 0.7;
        }

        return multiplier;
    }

    /**
     * Adjust confidence based on various factors
     * @param {number} confidence - Initial confidence
     * @param {string} message - Original message
     * @param {number} totalScore - Total sentiment score
     * @returns {number} Adjusted confidence
     */
    adjustConfidence(confidence, message, totalScore) {
        let adjustedConfidence = confidence;

        // Adjust based on message length
        if (message.length < 10) {
            adjustedConfidence *= 0.8; // Lower confidence for very short messages
        } else if (message.length > 100) {
            adjustedConfidence *= 1.1; // Higher confidence for longer messages
        }

        // Adjust based on total score
        if (totalScore < 2) {
            adjustedConfidence *= 0.9; // Lower confidence for weak signals
        }

        return Math.min(adjustedConfidence, 1.0);
    }

    /**
     * Detect language of the text
     * @param {string} text - Text to analyze
     * @returns {string} Detected language
     */
    detectLanguage(text) {
        if (!text) return 'unknown';

        const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
        const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
        const totalChars = arabicChars + englishChars;

        if (totalChars === 0) return 'unknown';

        if (arabicChars / totalChars > 0.6) return 'arabic';
        if (englishChars / totalChars > 0.6) return 'english';
        return 'mixed';
    }

    /**
     * Get suggestions based on detected intent
     * @param {string} intent - Detected intent
     * @returns {Array} Array of suggestions
     */
    getIntentSuggestions(intent) {
        const suggestions = {
            question: ['يمكنني الإجابة على أسئلتك حول المبيعات والمخزون والتقارير'],
            request: ['سأساعدك في تحقيق ما تحتاجه. ما هو طلبك بالتحديد؟'],
            complaint: ['آسف لهذه المشكلة. دعني أساعدك في حلها خطوة بخطوة'],
            compliment: ['شكراً لك! أنا سعيد لمساعدتك. هل تحتاج شيئاً آخر؟'],
            report_request: ['يمكنني إنشاء تقارير مفصلة لك. أي نوع من التقارير تحتاج؟'],
            sales_inquiry: ['يمكنني تقديم معلومات شاملة عن المبيعات والإيرادات'],
            inventory_inquiry: ['سأعرض لك معلومات المخزون الحالي والمنتجات المتوفرة'],
            store_inquiry: ['يمكنني تقديم معلومات عن المتاجر والفروع'],
            greeting: ['أهلاً وسهلاً! كيف يمكنني مساعدتك اليوم؟'],
            goodbye: ['مع السلامة! لا تتردد في العودة إذا احتجت مساعدة']
        };

        return suggestions[intent] || ['كيف يمكنني مساعدتك؟'];
    }

    /**
     * Categorize intent into broader categories
     * @param {string} intent - The intent to categorize
     * @returns {string} Intent category
     */
    categorizeIntent(intent) {
        const categories = {
            business: ['sales_inquiry', 'inventory_inquiry', 'store_inquiry', 'report_request'],
            support: ['complaint', 'request', 'question'],
            social: ['greeting', 'goodbye', 'compliment'],
            general: ['unknown']
        };

        for (const [category, intents] of Object.entries(categories)) {
            if (intents.includes(intent)) {
                return category;
            }
        }

        return 'general';
    }

    /**
     * Get default sentiment result
     * @returns {Object} Default sentiment
     */
    getDefaultSentiment() {
        return {
            sentiment: 'neutral',
            confidence: 0.5,
            scores: {
                positive: 0.33,
                negative: 0.33,
                neutral: 0.34
            },
            intensity: 1,
            wordCount: 0,
            analysis: {
                positiveWords: 0,
                negativeWords: 0,
                neutralWords: 0
            }
        };
    }

    /**
     * Get default intent result
     * @returns {Object} Default intent
     */
    getDefaultIntent() {
        return {
            intent: 'unknown',
            confidence: 0,
            score: 0,
            matchedKeywords: [],
            secondaryIntents: [],
            suggestions: ['كيف يمكنني مساعدتك؟'],
            category: 'general'
        };
    }
}

export default new SentimentAnalysisService(); 
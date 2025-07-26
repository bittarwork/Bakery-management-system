import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

async function testGeminiOnly() {
    try {
        console.log('🧪 Testing Gemini AI integration...');

        // Check if API key is available
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not found in environment variables');
        }

        console.log('✅ Gemini API key found');

        // Initialize Gemini
        const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = gemini.getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
        });

        console.log('✅ Gemini model initialized');

        // Test simple message
        console.log('🤖 Testing simple message...');
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: 'مرحبا، أنا أختبر النظام' }]
            }],
            generationConfig: {
                temperature: 0.4,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });

        const response = result.response.text();
        console.log('✅ Gemini response received:');
        console.log('📝 Response:', response);

        console.log('🎉 Gemini AI test completed successfully!');

    } catch (error) {
        console.error('❌ Gemini test failed:', {
            message: error.message,
            stack: error.stack
        });
    }
}

testGeminiOnly(); 
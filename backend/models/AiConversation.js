import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * AI Conversation Model
 * Stores all AI chat conversations with metadata
 */
const AiConversation = sequelize.define('AiConversation', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    sessionId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'session_id'
    },
    conversationId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'conversation_id'
    },
    messageType: {
        type: DataTypes.ENUM('user', 'ai', 'system'),
        allowNull: false,
        field: 'message_type'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
        get() {
            const rawValue = this.getDataValue('metadata');
            return rawValue ? JSON.parse(JSON.stringify(rawValue)) : {};
        }
    },
    responseTimeMs: {
        type: DataTypes.INTEGER,
        field: 'response_time_ms',
        defaultValue: null
    },
    tokensUsed: {
        type: DataTypes.INTEGER,
        field: 'tokens_used',
        defaultValue: null
    },
    modelUsed: {
        type: DataTypes.STRING(100),
        field: 'model_used',
        defaultValue: 'gemini-1.5-flash'
    },
    cached: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    rating: {
        type: DataTypes.TINYINT,
        defaultValue: null,
        validate: {
            min: 1,
            max: 5
        }
    },
    sentiment: {
        type: DataTypes.STRING(20),
        defaultValue: null,
        validate: {
            isIn: [['positive', 'negative', 'neutral', null]]
        }
    },
    intent: {
        type: DataTypes.STRING(50),
        defaultValue: null
    },
    confidenceScore: {
        type: DataTypes.DECIMAL(3, 2),
        field: 'confidence_score',
        defaultValue: null,
        validate: {
            min: 0,
            max: 1
        }
    }
}, {
    tableName: 'ai_conversations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['session_id']
        },
        {
            fields: ['conversation_id']
        },
        {
            fields: ['created_at']
        },
        {
            fields: ['message_type']
        },
        {
            fields: ['rating']
        },
        {
            fields: ['sentiment']
        },
        {
            fields: ['user_id', { fn: 'DATE', args: ['created_at'] }],
            name: 'idx_conversations_user_date'
        }
    ],
    hooks: {
        beforeCreate: (conversation, options) => {
            // Generate conversation ID if not provided
            if (!conversation.conversationId) {
                conversation.conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }

            // Generate session ID if not provided
            if (!conversation.sessionId) {
                conversation.sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
        }
    }
});

// Instance methods
AiConversation.prototype.toSafeJSON = function () {
    const values = this.toJSON();
    // Remove sensitive data if needed
    return {
        ...values,
        content: values.content.length > 500 ? values.content.substring(0, 500) + '...' : values.content
    };
};

// Class methods
AiConversation.findByConversationId = function (conversationId, options = {}) {
    return this.findAll({
        where: { conversationId },
        order: [['created_at', 'ASC']],
        ...options
    });
};

AiConversation.findBySessionId = function (sessionId, options = {}) {
    return this.findAll({
        where: { sessionId },
        order: [['created_at', 'ASC']],
        ...options
    });
};

AiConversation.getUserStats = async function (userId, period = '30d') {
    const sequelize = this.sequelize;
    let dateFilter;

    switch (period) {
        case '7d':
            dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90d':
            dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const stats = await this.findAll({
        where: {
            userId,
            created_at: {
                [sequelize.Sequelize.Op.gte]: dateFilter
            }
        },
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalMessages'],
            [sequelize.fn('SUM', sequelize.col('tokens_used')), 'totalTokens'],
            [sequelize.fn('AVG', sequelize.col('response_time_ms')), 'avgResponseTime'],
            [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
            [sequelize.fn('COUNT', sequelize.literal('CASE WHEN cached = true THEN 1 END')), 'cachedResponses'],
            [sequelize.fn('COUNT', sequelize.literal('CASE WHEN sentiment = "positive" THEN 1 END')), 'positiveCount'],
            [sequelize.fn('COUNT', sequelize.literal('CASE WHEN sentiment = "negative" THEN 1 END')), 'negativeCount'],
            [sequelize.fn('COUNT', sequelize.literal('CASE WHEN sentiment = "neutral" THEN 1 END')), 'neutralCount']
        ],
        raw: true
    });

    return stats[0] || {
        totalMessages: 0,
        totalTokens: 0,
        avgResponseTime: 0,
        avgRating: 0,
        cachedResponses: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0
    };
};

export default AiConversation; 
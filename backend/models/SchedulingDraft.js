import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SchedulingDraft = sequelize.define('SchedulingDraft', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        },
        comment: 'الطلب المرتبط بهذه المسودة'
    },
    suggested_distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'الموزع المقترح من النظام'
    },
    suggested_distributor_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    confidence_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 100
        },
        comment: 'درجة ثقة النظام في الاقتراح (0-100%)'
    },
    suggested_delivery_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'تاريخ التسليم المقترح'
    },
    suggested_priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal',
        comment: 'الأولوية المقترحة'
    },
    reasoning: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'أسباب اختيار هذا الموزع والجدولة'
    },
    alternative_suggestions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'اقتراحات بديلة للموزعين'
    },
    route_optimization: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'معلومات تحسين المسار'
    },
    estimated_delivery_time: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'الوقت المقدر للتسليم'
    },
    estimated_duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'المدة المقدرة بالدقائق'
    },
    status: {
        type: DataTypes.ENUM('pending_review', 'reviewed', 'approved', 'rejected', 'modified'),
        defaultValue: 'pending_review',
        validate: {
            isIn: {
                args: [['pending_review', 'reviewed', 'approved', 'rejected', 'modified']],
                msg: 'حالة المسودة غير صحيحة'
            }
        }
    },
    admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'ملاحظات الإدمن على الاقتراح'
    },
    modifications: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'التعديلات التي أجراها الإدمن'
    },
    approved_distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'الموزع المعتمد من الإدمن (إذا تم التعديل)'
    },
    approved_delivery_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'تاريخ التسليم المعتمد (إذا تم التعديل)'
    },
    approved_priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: true,
        comment: 'الأولوية المعتمدة (إذا تم التعديل)'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'منشئ المسودة (النظام التلقائي)'
    },
    reviewed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'مراجع المسودة (الإدمن)'
    },
    reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'وقت المراجعة'
    }
}, {
    tableName: 'scheduling_drafts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['order_id'],
            unique: true
        },
        {
            fields: ['status']
        },
        {
            fields: ['suggested_distributor_id']
        },
        {
            fields: ['suggested_delivery_date']
        },
        {
            fields: ['confidence_score']
        }
    ]
});

// Instance methods
SchedulingDraft.prototype.approve = async function (adminId, modifications = null, transaction = null) {
    const options = transaction ? { transaction } : {};

    this.status = modifications ? 'modified' : 'approved';
    this.reviewed_by = adminId;
    this.reviewed_at = new Date();

    if (modifications) {
        this.modifications = modifications;
        this.approved_distributor_id = modifications.distributor_id || this.suggested_distributor_id;
        this.approved_delivery_date = modifications.delivery_date || this.suggested_delivery_date;
        this.approved_priority = modifications.priority || this.suggested_priority;
    } else {
        this.approved_distributor_id = this.suggested_distributor_id;
        this.approved_delivery_date = this.suggested_delivery_date;
        this.approved_priority = this.suggested_priority;
    }

    await this.save(options);
    return this;
};

SchedulingDraft.prototype.reject = async function (adminId, reason, transaction = null) {
    const options = transaction ? { transaction } : {};

    this.status = 'rejected';
    this.reviewed_by = adminId;
    this.reviewed_at = new Date();
    this.admin_notes = reason;

    await this.save(options);
    return this;
};

SchedulingDraft.prototype.getReasoningText = function () {
    if (!this.reasoning) return 'لا توجد معلومات';

    const reasons = [];
    const r = this.reasoning;

    if (r.zone_match) reasons.push(`يخدم المنطقة المطلوبة`);
    if (r.capacity_available) reasons.push(`لديه سعة متاحة`);
    if (r.performance_score) reasons.push(`أداء ممتاز (${r.performance_score}%)`);
    if (r.distance_optimal) reasons.push(`أقرب مسار ممكن`);
    if (r.experience) reasons.push(`خبرة في التعامل مع هذا المحل`);

    return reasons.length > 0 ? reasons.join('، ') : 'تحليل النظام الذكي';
};

// Class methods
SchedulingDraft.getPendingReviews = async function (limit = 10) {
    return await this.findAll({
        where: {
            status: 'pending_review'
        },
        include: [
            {
                model: sequelize.models.Order,
                as: 'order',
                include: [
                    {
                        model: sequelize.models.Store,
                        as: 'store'
                    }
                ]
            },
            {
                model: sequelize.models.User,
                as: 'suggestedDistributor',
                attributes: ['id', 'full_name', 'phone', 'email']
            }
        ],
        order: [['created_at', 'ASC']],
        limit: limit
    });
};

SchedulingDraft.getStatistics = async function (period = 'month') {
    const { Op } = require('sequelize');

    let dateFilter = {};
    const now = new Date();

    switch (period) {
        case 'today':
            dateFilter = {
                created_at: {
                    [Op.gte]: new Date(now.getFullYear(), now.getMonth(), now.getDate())
                }
            };
            break;
        case 'week':
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = {
                created_at: {
                    [Op.gte]: weekStart
                }
            };
            break;
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = {
                created_at: {
                    [Op.gte]: monthStart
                }
            };
            break;
    }

    const stats = await this.findAll({
        where: dateFilter,
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('AVG', sequelize.col('confidence_score')), 'avg_confidence']
        ],
        group: ['status'],
        raw: true
    });

    return stats;
};

export default SchedulingDraft; 
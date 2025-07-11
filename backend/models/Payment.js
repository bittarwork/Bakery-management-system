import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/database.js';
import { PAYMENT_STATUS } from '../constants/index.js';

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id'
        },
        validate: {
            notNull: {
                msg: 'معرف المتجر مطلوب'
            }
        }
    },
    store_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'distributors',
            key: 'id'
        }
    },
    distributor_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    visit_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'store_visits',
            key: 'id'
        }
    },
    amount_eur: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'المبلغ باليورو يجب أن يكون أكبر من أو يساوي صفر'
            },
            isDecimal: {
                msg: 'المبلغ باليورو يجب أن يكون رقماً صحيحاً'
            }
        }
    },
    amount_syp: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: {
                args: [0],
                msg: 'المبلغ بالليرة يجب أن يكون أكبر من أو يساوي صفر'
            },
            isDecimal: {
                msg: 'المبلغ بالليرة يجب أن يكون رقماً صحيحاً'
            }
        }
    },
    exchange_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'سعر الصرف المستخدم وقت الدفع'
    },
    payment_method: {
        type: DataTypes.ENUM('cash', 'bank_transfer', 'credit_card', 'check', 'mixed'),
        defaultValue: 'cash',
        validate: {
            isIn: {
                args: [['cash', 'bank_transfer', 'credit_card', 'check', 'mixed']],
                msg: 'طريقة الدفع غير صحيحة'
            }
        }
    },
    payment_type: {
        type: DataTypes.ENUM('collection', 'payment', 'refund', 'adjustment'),
        defaultValue: 'collection',
        validate: {
            isIn: {
                args: [['collection', 'payment', 'refund', 'adjustment']],
                msg: 'نوع الدفع غير صحيح'
            }
        }
    },
    payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
            notNull: {
                msg: 'تاريخ الدفع مطلوب'
            },
            isDate: {
                msg: 'تاريخ الدفع غير صحيح'
            }
        }
    },
    status: {
        type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
        defaultValue: PAYMENT_STATUS.PENDING,
        validate: {
            isIn: {
                args: [Object.values(PAYMENT_STATUS)],
                msg: 'حالة الدفع غير صحيحة'
            }
        }
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'تاريخ الاستحقاق'
    },
    actual_payment_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'تاريخ الدفع الفعلي'
    },
    reference_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'رقم المرجع (رقم الشيك، رقم التحويل، إلخ)'
    },
    bank_details: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'تفاصيل البنك للتحويلات البنكية'
    },
    collected_by: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'الشخص الذي قام بالتحصيل'
    },
    collection_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'موقع التحصيل GPS'
    },
    receipt_number: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'رقم الإيصال'
    },
    receipt_image_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'رابط صورة الإيصال'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    internal_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'ملاحظات داخلية'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    created_by_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    verified_by_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    verified_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['store_id']
        },
        {
            fields: ['order_id']
        },
        {
            fields: ['distributor_id']
        },
        {
            fields: ['visit_id']
        },
        {
            fields: ['payment_date']
        },
        {
            fields: ['status']
        },
        {
            fields: ['payment_method']
        },
        {
            fields: ['payment_type']
        },
        {
            fields: ['created_by']
        },
        {
            fields: ['verified_by']
        },
        {
            fields: ['reference_number']
        },
        {
            fields: ['receipt_number']
        }
    ]
});

// Instance methods
Payment.prototype.updateStatus = async function (newStatus, transaction = null) {
    if (!Object.values(PAYMENT_STATUS).includes(newStatus)) {
        throw new Error('حالة الدفع غير صحيحة');
    }

    const options = transaction ? { transaction } : {};
    this.status = newStatus;
    await this.save(options);

    return this;
};

Payment.prototype.getStatusInfo = function () {
    const statusMap = {
        [PAYMENT_STATUS.PENDING]: { label: 'معلق', color: 'gray', icon: '⏳' },
        [PAYMENT_STATUS.PARTIAL]: { label: 'جزئي', color: 'yellow', icon: '💰' },
        [PAYMENT_STATUS.PAID]: { label: 'مدفوع', color: 'green', icon: '✅' },
        [PAYMENT_STATUS.OVERDUE]: { label: 'متأخر', color: 'red', icon: '⚠️' }
    };

    return statusMap[this.status] || { label: this.status, color: 'gray', icon: '❓' };
};

Payment.prototype.getMethodInfo = function () {
    const methodMap = {
        cash: { label: 'نقدي', color: 'green', icon: '💵' },
        bank_transfer: { label: 'تحويل بنكي', color: 'blue', icon: '🏦' },
        credit_card: { label: 'بطاقة ائتمان', color: 'orange', icon: '💳' },
        check: { label: 'شيك', color: 'purple', icon: '📝' },
        mixed: { label: 'مختلط', color: 'gray', icon: '🔄' }
    };

    return methodMap[this.payment_method] || { label: this.payment_method, color: 'gray', icon: '❓' };
};

Payment.prototype.getTypeInfo = function () {
    const typeMap = {
        collection: { label: 'تحصيل', color: 'green' },
        payment: { label: 'دفعة', color: 'blue' },
        refund: { label: 'استرداد', color: 'red' },
        adjustment: { label: 'تعديل', color: 'yellow' }
    };

    return typeMap[this.payment_type] || { label: this.payment_type, color: 'gray' };
};

Payment.prototype.getTotalAmount = function () {
    const amountEur = parseFloat(this.amount_eur) || 0;
    const amountSyp = parseFloat(this.amount_syp) || 0;
    const exchangeRate = parseFloat(this.exchange_rate) || 1800;

    return amountEur + (amountSyp / exchangeRate);
};

Payment.prototype.verify = async function (verifiedBy, verifiedByName, transaction = null) {
    const options = transaction ? { transaction } : {};

    this.verified_by = verifiedBy;
    this.verified_by_name = verifiedByName;
    this.verified_at = new Date();
    this.status = PAYMENT_STATUS.PAID;
    this.actual_payment_date = new Date();

    await this.save(options);
    return this;
};

Payment.prototype.isOverdue = function () {
    if (!this.due_date) return false;
    return new Date() > new Date(this.due_date) && this.status !== PAYMENT_STATUS.PAID;
};

Payment.prototype.getDaysOverdue = function () {
    if (!this.isOverdue()) return 0;
    const now = new Date();
    const dueDate = new Date(this.due_date);
    return Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
};

Payment.prototype.isVerified = function () {
    return this.verified_by !== null && this.verified_at !== null;
};

Payment.prototype.markAsCollected = async function (collectedBy, location = null, transaction = null) {
    const options = transaction ? { transaction } : {};

    this.collected_by = collectedBy;
    this.collection_location = location;
    this.actual_payment_date = new Date();
    this.status = PAYMENT_STATUS.PAID;

    await this.save(options);
    return this;
};

Payment.prototype.addReceipt = async function (receiptNumber, imageUrl = null, transaction = null) {
    const options = transaction ? { transaction } : {};

    this.receipt_number = receiptNumber;
    this.receipt_image_url = imageUrl;

    await this.save(options);
    return this;
};

// Class methods
Payment.getStatistics = async function (period = 'month', filters = {}) {
    let dateFilter = {};
    const now = new Date();

    switch (period) {
        case 'today':
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            dateFilter = {
                payment_date: {
                    [Op.gte]: todayStart.toISOString().split('T')[0],
                    [Op.lt]: todayEnd.toISOString().split('T')[0]
                }
            };
            break;
        case 'week':
            const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            dateFilter = {
                payment_date: {
                    [Op.gte]: weekStart.toISOString().split('T')[0],
                    [Op.lt]: weekEnd.toISOString().split('T')[0]
                }
            };
            break;
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            dateFilter = {
                payment_date: {
                    [Op.gte]: monthStart.toISOString().split('T')[0],
                    [Op.lt]: monthEnd.toISOString().split('T')[0]
                }
            };
            break;
        case 'year':
            const yearStart = new Date(now.getFullYear(), 0, 1);
            const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
            dateFilter = {
                payment_date: {
                    [Op.gte]: yearStart.toISOString().split('T')[0],
                    [Op.lt]: yearEnd.toISOString().split('T')[0]
                }
            };
            break;
    }

    const whereClause = { ...dateFilter, ...filters };

    const [
        totalPayments,
        totalAmountEur,
        totalAmountSyp,
        pendingPayments,
        pendingAmountEur,
        pendingAmountSyp,
        paidPayments,
        paidAmountEur,
        paidAmountSyp,
        overduePayments,
        overdueAmountEur,
        overdueAmountSyp,
        partialPayments,
        partialAmountEur,
        partialAmountSyp,
        paymentMethods
    ] = await Promise.all([
        Payment.count({ where: whereClause }),
        Payment.sum('amount_eur', { where: whereClause }),
        Payment.sum('amount_syp', { where: whereClause }),
        Payment.count({ where: { ...whereClause, status: PAYMENT_STATUS.PENDING } }),
        Payment.sum('amount_eur', { where: { ...whereClause, status: PAYMENT_STATUS.PENDING } }),
        Payment.sum('amount_syp', { where: { ...whereClause, status: PAYMENT_STATUS.PENDING } }),
        Payment.count({ where: { ...whereClause, status: PAYMENT_STATUS.PAID } }),
        Payment.sum('amount_eur', { where: { ...whereClause, status: PAYMENT_STATUS.PAID } }),
        Payment.sum('amount_syp', { where: { ...whereClause, status: PAYMENT_STATUS.PAID } }),
        Payment.count({ where: { ...whereClause, status: PAYMENT_STATUS.OVERDUE } }),
        Payment.sum('amount_eur', { where: { ...whereClause, status: PAYMENT_STATUS.OVERDUE } }),
        Payment.sum('amount_syp', { where: { ...whereClause, status: PAYMENT_STATUS.OVERDUE } }),
        Payment.count({ where: { ...whereClause, status: PAYMENT_STATUS.PARTIAL } }),
        Payment.sum('amount_eur', { where: { ...whereClause, status: PAYMENT_STATUS.PARTIAL } }),
        Payment.sum('amount_syp', { where: { ...whereClause, status: PAYMENT_STATUS.PARTIAL } }),
        Payment.findAll({
            attributes: [
                'payment_method',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: whereClause,
            group: ['payment_method']
        })
    ]);

    const methods = {
        cash: 0,
        bank_transfer: 0,
        credit_card: 0,
        check: 0,
        mixed: 0
    };

    paymentMethods.forEach(method => {
        methods[method.payment_method] = parseInt(method.dataValues.count);
    });

    const averagePaymentEur = totalPayments > 0 ? (totalAmountEur || 0) / totalPayments : 0;
    const averagePaymentSyp = totalPayments > 0 ? (totalAmountSyp || 0) / totalPayments : 0;

    return {
        total_payments: totalPayments,
        total_amount_eur: totalAmountEur || 0,
        total_amount_syp: totalAmountSyp || 0,
        pending_payments: pendingPayments,
        pending_amount_eur: pendingAmountEur || 0,
        pending_amount_syp: pendingAmountSyp || 0,
        paid_payments: paidPayments,
        paid_amount_eur: paidAmountEur || 0,
        paid_amount_syp: paidAmountSyp || 0,
        overdue_payments: overduePayments,
        overdue_amount_eur: overdueAmountEur || 0,
        overdue_amount_syp: overdueAmountSyp || 0,
        partial_payments: partialPayments,
        partial_amount_eur: partialAmountEur || 0,
        partial_amount_syp: partialAmountSyp || 0,
        average_payment_eur: averagePaymentEur,
        average_payment_syp: averagePaymentSyp,
        payment_methods: methods,
        daily_trend: 0, // TODO: Calculate trends
        weekly_trend: 0,
        monthly_trend: 0
    };
};

Payment.findByDistributor = async function (distributorId, dateFrom = null, dateTo = null) {
    const whereClause = { distributor_id: distributorId };

    if (dateFrom || dateTo) {
        whereClause.payment_date = {};
        if (dateFrom) {
            whereClause.payment_date[Op.gte] = dateFrom;
        }
        if (dateTo) {
            whereClause.payment_date[Op.lte] = dateTo;
        }
    }

    return await Payment.findAll({
        where: whereClause,
        order: [['payment_date', 'DESC'], ['created_at', 'DESC']]
    });
};

Payment.findByVisit = async function (visitId) {
    return await Payment.findAll({
        where: { visit_id: visitId },
        order: [['created_at', 'DESC']]
    });
};

Payment.findByStore = async function (storeId, dateFrom = null, dateTo = null) {
    const whereClause = { store_id: storeId };

    if (dateFrom || dateTo) {
        whereClause.payment_date = {};
        if (dateFrom) {
            whereClause.payment_date[Op.gte] = dateFrom;
        }
        if (dateTo) {
            whereClause.payment_date[Op.lte] = dateTo;
        }
    }

    return await Payment.findAll({
        where: whereClause,
        order: [['payment_date', 'DESC'], ['created_at', 'DESC']]
    });
};

Payment.getPendingPayments = async function (daysOverdue = 0) {
    const whereClause = { status: PAYMENT_STATUS.PENDING };

    if (daysOverdue > 0) {
        const overdueDate = new Date();
        overdueDate.setDate(overdueDate.getDate() - daysOverdue);
        whereClause.due_date = { [Op.lte]: overdueDate };
    }

    return await Payment.findAll({
        where: whereClause,
        order: [['due_date', 'ASC'], ['created_at', 'ASC']]
    });
};

Payment.getOverduePayments = async function () {
    return await Payment.findAll({
        where: {
            status: { [Op.ne]: PAYMENT_STATUS.PAID },
            due_date: { [Op.lt]: new Date() }
        },
        order: [['due_date', 'ASC']]
    });
};

Payment.getUnverifiedPayments = async function () {
    return await Payment.findAll({
        where: {
            status: PAYMENT_STATUS.PAID,
            verified_by: null
        },
        order: [['actual_payment_date', 'DESC']]
    });
};

Payment.searchPayments = async function (searchTerm, filters = {}) {
    let whereClause = {};

    // Search in reference_number, receipt_number, and notes
    if (searchTerm) {
        whereClause[Op.or] = [
            { reference_number: { [Op.like]: `%${searchTerm}%` } },
            { receipt_number: { [Op.like]: `%${searchTerm}%` } },
            { notes: { [Op.like]: `%${searchTerm}%` } },
            { store_name: { [Op.like]: `%${searchTerm}%` } }
        ];
    }

    // Apply filters
    if (filters.status) {
        whereClause.status = filters.status;
    }

    if (filters.payment_method) {
        whereClause.payment_method = filters.payment_method;
    }

    if (filters.payment_type) {
        whereClause.payment_type = filters.payment_type;
    }

    if (filters.distributor_id) {
        whereClause.distributor_id = filters.distributor_id;
    }

    if (filters.store_id) {
        whereClause.store_id = filters.store_id;
    }

    if (filters.date_from && filters.date_to) {
        whereClause.payment_date = {
            [Op.between]: [filters.date_from, filters.date_to]
        };
    }

    return await Payment.findAll({
        where: whereClause,
        order: [['payment_date', 'DESC'], ['created_at', 'DESC']]
    });
};

Payment.getCollectionsByDistributor = async function (distributorId, dateFrom = null, dateTo = null) {
    const whereClause = {
        distributor_id: distributorId,
        payment_type: 'collection'
    };

    if (dateFrom || dateTo) {
        whereClause.payment_date = {};
        if (dateFrom) {
            whereClause.payment_date[Op.gte] = dateFrom;
        }
        if (dateTo) {
            whereClause.payment_date[Op.lte] = dateTo;
        }
    }

    return await Payment.findAll({
        where: whereClause,
        order: [['payment_date', 'DESC'], ['created_at', 'DESC']]
    });
};

Payment.getPaymentsByType = async function (paymentType, dateFrom = null, dateTo = null) {
    const whereClause = { payment_type: paymentType };

    if (dateFrom || dateTo) {
        whereClause.payment_date = {};
        if (dateFrom) {
            whereClause.payment_date[Op.gte] = dateFrom;
        }
        if (dateTo) {
            whereClause.payment_date[Op.lte] = dateTo;
        }
    }

    return await Payment.findAll({
        where: whereClause,
        order: [['payment_date', 'DESC'], ['created_at', 'DESC']]
    });
};

export default Payment; 
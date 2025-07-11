import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EnhancedStoreVisit = sequelize.define('EnhancedStoreVisit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    store_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    store_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    visit_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    },

    planned_arrival_time: {
        type: DataTypes.DATE,
        allowNull: true
    },

    actual_arrival_time: {
        type: DataTypes.DATE,
        allowNull: true
    },

    planned_departure_time: {
        type: DataTypes.DATE,
        allowNull: true
    },

    actual_departure_time: {
        type: DataTypes.DATE,
        allowNull: true
    },

    visit_status: {
        type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'cancelled', 'failed'),
        defaultValue: 'planned'
    },

    arrival_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'GPS coordinates when arriving at store'
    },

    departure_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'GPS coordinates when leaving store'
    },

    // Order Information
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    order_value_eur: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    order_value_syp: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    payment_collected_eur: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    payment_collected_syp: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    payment_method: {
        type: DataTypes.ENUM('cash', 'bank_transfer', 'check', 'credit', 'mixed'),
        allowNull: true
    },

    // Visit Details
    visit_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0
        }
    },

    items_delivered: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'List of items delivered during this visit'
    },

    store_condition: {
        type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'closed'),
        allowNull: true
    },

    store_feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    visit_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Problem Tracking
    problems_encountered: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'List of problems encountered during visit'
    },

    problem_severity: {
        type: DataTypes.ENUM('none', 'low', 'medium', 'high', 'critical'),
        defaultValue: 'none'
    },

    // Photos and Documentation
    photos_taken: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'List of photo URLs taken during visit'
    },

    signature_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Store owner signature image URL'
    },

    receipt_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Receipt or invoice image URL'
    },

    // Performance Metrics
    service_rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 5
        }
    },

    store_satisfaction: {
        type: DataTypes.ENUM('very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied'),
        allowNull: true
    },

    // Audit Information
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    created_by_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    updated_by_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'enhanced_store_visits',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    hooks: {
        beforeCreate: (visit) => {
            // Set default planned times if not provided
            if (!visit.planned_arrival_time && visit.planned_departure_time) {
                visit.planned_arrival_time = new Date(visit.planned_departure_time.getTime() - (30 * 60 * 1000)); // 30 minutes before
            }
        },

        beforeUpdate: (visit) => {
            // Calculate visit duration if both times are available
            if (visit.actual_arrival_time && visit.actual_departure_time) {
                const duration = Math.round((new Date(visit.actual_departure_time) - new Date(visit.actual_arrival_time)) / (1000 * 60));
                visit.visit_duration_minutes = duration;
            }

            // Update problem severity based on problems encountered
            const problems = visit.problems_encountered || [];
            if (problems.length === 0) {
                visit.problem_severity = 'none';
            } else {
                const severities = problems.map(p => p.severity || 'low');
                if (severities.includes('critical')) visit.problem_severity = 'critical';
                else if (severities.includes('high')) visit.problem_severity = 'high';
                else if (severities.includes('medium')) visit.problem_severity = 'medium';
                else visit.problem_severity = 'low';
            }
        }
    }
});

// Instance methods
EnhancedStoreVisit.prototype.startVisit = function (arrivalLocation = null) {
    this.visit_status = 'in_progress';
    this.actual_arrival_time = new Date();
    if (arrivalLocation) {
        this.arrival_location = arrivalLocation;
    }
    return this.save();
};

EnhancedStoreVisit.prototype.completeVisit = function (departureLocation = null, orderValue = 0, paymentCollected = 0, currency = 'EUR') {
    this.visit_status = 'completed';
    this.actual_departure_time = new Date();

    if (departureLocation) {
        this.departure_location = departureLocation;
    }

    if (orderValue > 0) {
        if (currency === 'EUR') {
            this.order_value_eur = parseFloat(orderValue);
        } else if (currency === 'SYP') {
            this.order_value_syp = parseFloat(orderValue);
        }
    }

    if (paymentCollected > 0) {
        if (currency === 'EUR') {
            this.payment_collected_eur = parseFloat(paymentCollected);
        } else if (currency === 'SYP') {
            this.payment_collected_syp = parseFloat(paymentCollected);
        }
    }

    // Calculate duration
    if (this.actual_arrival_time && this.actual_departure_time) {
        const duration = Math.round((new Date(this.actual_departure_time) - new Date(this.actual_arrival_time)) / (1000 * 60));
        this.visit_duration_minutes = duration;
    }

    return this.save();
};

EnhancedStoreVisit.prototype.cancelVisit = function (reason) {
    this.visit_status = 'cancelled';
    if (reason) {
        this.visit_notes = (this.visit_notes || '') + `\nCancelled: ${reason}`;
    }
    return this.save();
};

EnhancedStoreVisit.prototype.failVisit = function (reason) {
    this.visit_status = 'failed';
    if (reason) {
        this.visit_notes = (this.visit_notes || '') + `\nFailed: ${reason}`;
    }
    return this.save();
};

EnhancedStoreVisit.prototype.addProblem = function (problemType, description, severity = 'medium') {
    const problems = this.problems_encountered || [];
    problems.push({
        type: problemType,
        description: description,
        severity: severity,
        timestamp: new Date(),
        id: Date.now()
    });
    this.problems_encountered = problems;

    // Update overall problem severity
    const severities = problems.map(p => p.severity);
    if (severities.includes('critical')) this.problem_severity = 'critical';
    else if (severities.includes('high')) this.problem_severity = 'high';
    else if (severities.includes('medium')) this.problem_severity = 'medium';
    else this.problem_severity = 'low';

    return this.save();
};

EnhancedStoreVisit.prototype.addPhoto = function (photoUrl, type = 'general', description = null) {
    const photos = this.photos_taken || [];
    photos.push({
        url: photoUrl,
        type: type,
        description: description,
        timestamp: new Date()
    });
    this.photos_taken = photos;
    return this.save();
};

EnhancedStoreVisit.prototype.addDeliveredItem = function (itemId, itemName, quantity, unitPrice, currency = 'EUR') {
    const items = this.items_delivered || [];
    items.push({
        item_id: itemId,
        item_name: itemName,
        quantity: quantity,
        unit_price: unitPrice,
        currency: currency,
        total_price: quantity * unitPrice,
        timestamp: new Date()
    });
    this.items_delivered = items;
    return this.save();
};

EnhancedStoreVisit.prototype.setStoreCondition = function (condition, feedback = null) {
    this.store_condition = condition;
    if (feedback) {
        this.store_feedback = feedback;
    }
    return this.save();
};

EnhancedStoreVisit.prototype.rateService = function (rating, satisfaction = null) {
    this.service_rating = rating;
    if (satisfaction) {
        this.store_satisfaction = satisfaction;
    }
    return this.save();
};

EnhancedStoreVisit.prototype.getDuration = function () {
    if (this.actual_arrival_time && this.actual_departure_time) {
        return Math.round((new Date(this.actual_departure_time) - new Date(this.actual_arrival_time)) / (1000 * 60));
    }
    return this.visit_duration_minutes || null;
};

EnhancedStoreVisit.prototype.isDelayed = function () {
    if (!this.planned_arrival_time || !this.actual_arrival_time) return false;
    return new Date(this.actual_arrival_time) > new Date(this.planned_arrival_time);
};

EnhancedStoreVisit.prototype.getDelayMinutes = function () {
    if (!this.isDelayed()) return 0;
    return Math.round((new Date(this.actual_arrival_time) - new Date(this.planned_arrival_time)) / (1000 * 60));
};

EnhancedStoreVisit.prototype.getTotalValue = function () {
    const eurValue = parseFloat(this.order_value_eur) || 0;
    const sypValue = parseFloat(this.order_value_syp) || 0;
    return eurValue + (sypValue / 15000); // Convert SYP to EUR
};

EnhancedStoreVisit.prototype.getTotalPayment = function () {
    const eurPayment = parseFloat(this.payment_collected_eur) || 0;
    const sypPayment = parseFloat(this.payment_collected_syp) || 0;
    return eurPayment + (sypPayment / 15000); // Convert SYP to EUR
};

EnhancedStoreVisit.prototype.getPaymentRate = function () {
    const totalValue = this.getTotalValue();
    const totalPayment = this.getTotalPayment();
    return totalValue > 0 ? (totalPayment / totalValue) * 100 : 0;
};

// Static methods
EnhancedStoreVisit.getByTrip = async function (tripId) {
    return await this.findAll({
        where: { trip_id: tripId },
        order: [['visit_order', 'ASC']]
    });
};

EnhancedStoreVisit.getByStore = async function (storeId, limit = 50) {
    return await this.findAll({
        where: { store_id: storeId },
        order: [['created_at', 'DESC']],
        limit
    });
};

EnhancedStoreVisit.getByStatus = async function (status) {
    return await this.findAll({
        where: { visit_status: status },
        order: [['planned_arrival_time', 'ASC']]
    });
};

EnhancedStoreVisit.getActiveVisits = async function () {
    return await this.findAll({
        where: {
            visit_status: {
                [sequelize.Sequelize.Op.in]: ['planned', 'in_progress']
            }
        },
        order: [['planned_arrival_time', 'ASC']]
    });
};

EnhancedStoreVisit.getVisitsByDateRange = async function (startDate, endDate, storeId = null) {
    const where = {
        actual_arrival_time: {
            [sequelize.Sequelize.Op.between]: [startDate, endDate]
        }
    };

    if (storeId) {
        where.store_id = storeId;
    }

    return await this.findAll({
        where,
        order: [['actual_arrival_time', 'DESC']]
    });
};

EnhancedStoreVisit.getStatistics = async function (filters = {}) {
    let where = {};

    if (filters.trip_id) where.trip_id = filters.trip_id;
    if (filters.store_id) where.store_id = filters.store_id;
    if (filters.status) where.visit_status = filters.status;
    if (filters.date_range) {
        where.actual_arrival_time = {
            [sequelize.Sequelize.Op.between]: [filters.date_range.start, filters.date_range.end]
        };
    }

    const visits = await this.findAll({ where });

    const stats = {
        total_visits: visits.length,
        completed_visits: visits.filter(v => v.visit_status === 'completed').length,
        cancelled_visits: visits.filter(v => v.visit_status === 'cancelled').length,
        failed_visits: visits.filter(v => v.visit_status === 'failed').length,
        total_value_eur: visits.reduce((sum, v) => sum + v.getTotalValue(), 0),
        total_payment_eur: visits.reduce((sum, v) => sum + v.getTotalPayment(), 0),
        avg_visit_duration: visits.length > 0 ? visits.reduce((sum, v) => sum + (v.visit_duration_minutes || 0), 0) / visits.length : 0,
        avg_service_rating: visits.length > 0 ? visits.reduce((sum, v) => sum + (parseFloat(v.service_rating) || 0), 0) / visits.length : 0,
        delayed_visits: visits.filter(v => v.isDelayed()).length,
        visits_with_problems: visits.filter(v => v.problem_severity !== 'none').length
    };

    return stats;
};

export default EnhancedStoreVisit; 
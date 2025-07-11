import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EnhancedDistributionTrip = sequelize.define('EnhancedDistributionTrip', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    trip_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },

    trip_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    distributor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    distributor_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    vehicle_info: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Vehicle information including type, model, license plate'
    },

    route_plan: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Planned route with store IDs and order'
    },

    planned_start_time: {
        type: DataTypes.DATE,
        allowNull: true
    },

    actual_start_time: {
        type: DataTypes.DATE,
        allowNull: true
    },

    planned_end_time: {
        type: DataTypes.DATE,
        allowNull: true
    },

    actual_end_time: {
        type: DataTypes.DATE,
        allowNull: true
    },

    total_orders: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },

    total_stores: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },

    completed_stores: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },

    total_amount_eur: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    total_amount_syp: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    collected_amount_eur: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    collected_amount_syp: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    fuel_cost: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    other_expenses: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },

    distance_covered: {
        type: DataTypes.DECIMAL(8, 2),
        validate: {
            min: 0
        }
    },

    status: {
        type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'cancelled', 'suspended'),
        defaultValue: 'planned'
    },

    completion_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 100
        }
    },

    collection_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 100
        }
    },

    gps_tracking_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    start_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Starting GPS coordinates'
    },

    end_location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Ending GPS coordinates'
    },

    problems_encountered: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'List of problems encountered during the trip'
    },

    notes: {
        type: DataTypes.TEXT
    },

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    created_by_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'enhanced_distribution_trips',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    hooks: {
        beforeCreate: (trip) => {
            // Generate trip number if not provided
            if (!trip.trip_number) {
                const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const random = Math.random().toString(36).substr(2, 4);
                trip.trip_number = `TRIP-${today}-${random}`.toUpperCase();
            }
        },

        beforeUpdate: (trip) => {
            // Calculate actual duration when trip is completed
            if (trip.status === 'completed' && trip.actual_start_time && trip.actual_end_time) {
                const startTime = new Date(trip.actual_start_time);
                const endTime = new Date(trip.actual_end_time);
                trip.actual_duration = Math.round((endTime - startTime) / (1000 * 60)); // minutes
            }

            // Update completion rate
            if (trip.total_stores > 0) {
                trip.completion_rate = (trip.completed_stores / trip.total_stores) * 100;
            }
        }
    }
});

// Instance methods
EnhancedDistributionTrip.prototype.startTrip = function () {
    this.status = 'in_progress';
    this.actual_start_time = new Date();
    return this.save();
};

EnhancedDistributionTrip.prototype.completeTrip = function () {
    this.status = 'completed';
    this.actual_end_time = new Date();

    // Calculate completion and collection rates
    if (this.total_stores > 0) {
        this.completion_rate = (this.completed_stores / this.total_stores) * 100;
    }

    const totalAmount = parseFloat(this.total_amount_eur) + (parseFloat(this.total_amount_syp) / 15000);
    const collectedAmount = parseFloat(this.collected_amount_eur) + (parseFloat(this.collected_amount_syp) / 15000);

    if (totalAmount > 0) {
        this.collection_rate = (collectedAmount / totalAmount) * 100;
    }

    return this.save();
};

EnhancedDistributionTrip.prototype.cancelTrip = function (reason) {
    this.status = 'cancelled';
    if (reason) {
        this.notes = (this.notes || '') + `\nCancelled: ${reason}`;
    }
    return this.save();
};

EnhancedDistributionTrip.prototype.addProblem = function (problem) {
    const problems = this.problems_encountered || [];
    problems.push({
        ...problem,
        timestamp: new Date(),
        id: Date.now()
    });
    this.problems_encountered = problems;
    return this.save();
};

EnhancedDistributionTrip.prototype.updateProgress = function (completedStores, collectedAmountEur = 0, collectedAmountSyp = 0) {
    this.completed_stores = completedStores;
    this.collected_amount_eur = parseFloat(this.collected_amount_eur) + parseFloat(collectedAmountEur);
    this.collected_amount_syp = parseFloat(this.collected_amount_syp) + parseFloat(collectedAmountSyp);

    if (this.total_stores > 0) {
        this.completion_rate = (this.completed_stores / this.total_stores) * 100;
    }

    const totalAmount = parseFloat(this.total_amount_eur) + (parseFloat(this.total_amount_syp) / 15000);
    const collectedAmount = parseFloat(this.collected_amount_eur) + (parseFloat(this.collected_amount_syp) / 15000);

    if (totalAmount > 0) {
        this.collection_rate = (collectedAmount / totalAmount) * 100;
    }

    return this.save();
};

EnhancedDistributionTrip.prototype.getDuration = function () {
    if (this.actual_start_time && this.actual_end_time) {
        return Math.round((new Date(this.actual_end_time) - new Date(this.actual_start_time)) / (1000 * 60)); // minutes
    }
    return null;
};

EnhancedDistributionTrip.prototype.getEfficiency = function () {
    const duration = this.getDuration();
    if (duration && this.completed_stores > 0) {
        return Math.round(duration / this.completed_stores); // minutes per store
    }
    return null;
};

// Static methods
EnhancedDistributionTrip.getTripsByDateRange = async function (startDate, endDate, distributorId = null) {
    const where = {
        trip_date: {
            [sequelize.Sequelize.Op.between]: [startDate, endDate]
        }
    };

    if (distributorId) {
        where.distributor_id = distributorId;
    }

    return await this.findAll({
        where,
        order: [['trip_date', 'DESC'], ['created_at', 'DESC']]
    });
};

EnhancedDistributionTrip.getActiveTrips = async function (distributorId = null) {
    const where = {
        status: {
            [sequelize.Sequelize.Op.in]: ['planned', 'in_progress']
        }
    };

    if (distributorId) {
        where.distributor_id = distributorId;
    }

    return await this.findAll({
        where,
        order: [['trip_date', 'ASC'], ['planned_start_time', 'ASC']]
    });
};

EnhancedDistributionTrip.getStatistics = async function (distributorId = null, dateRange = null) {
    let where = {};

    if (distributorId) {
        where.distributor_id = distributorId;
    }

    if (dateRange) {
        where.trip_date = {
            [sequelize.Sequelize.Op.between]: [dateRange.start, dateRange.end]
        };
    }

    const trips = await this.findAll({ where });

    const stats = {
        total_trips: trips.length,
        completed_trips: trips.filter(t => t.status === 'completed').length,
        cancelled_trips: trips.filter(t => t.status === 'cancelled').length,
        total_stores_visited: trips.reduce((sum, t) => sum + t.completed_stores, 0),
        total_amount_eur: trips.reduce((sum, t) => sum + parseFloat(t.total_amount_eur), 0),
        total_amount_syp: trips.reduce((sum, t) => sum + parseFloat(t.total_amount_syp), 0),
        collected_amount_eur: trips.reduce((sum, t) => sum + parseFloat(t.collected_amount_eur), 0),
        collected_amount_syp: trips.reduce((sum, t) => sum + parseFloat(t.collected_amount_syp), 0),
        total_distance: trips.reduce((sum, t) => sum + (parseFloat(t.distance_covered) || 0), 0),
        avg_completion_rate: trips.length > 0 ? trips.reduce((sum, t) => sum + parseFloat(t.completion_rate), 0) / trips.length : 0,
        avg_collection_rate: trips.length > 0 ? trips.reduce((sum, t) => sum + parseFloat(t.collection_rate), 0) / trips.length : 0
    };

    return stats;
};

export default EnhancedDistributionTrip; 
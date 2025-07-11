import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
        // Check if order_items table exists
        const tableExists = await queryInterface.showAllTables().then(tables =>
            tables.includes('order_items')
        );

        if (!tableExists) {
            // Create order_items table if it doesn't exist
            await queryInterface.createTable('order_items', {
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
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                product_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'products',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                quantity: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    validate: {
                        min: 1
                    }
                },
                unit_price: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    validate: {
                        min: 0
                    }
                },
                total_price: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    validate: {
                        min: 0
                    }
                },
                discount_amount: {
                    type: DataTypes.DECIMAL(10, 2),
                    defaultValue: 0.00,
                    validate: {
                        min: 0
                    }
                },
                final_price: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    validate: {
                        min: 0
                    }
                },
                gift_quantity: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                    validate: {
                        min: 0
                    }
                },
                gift_reason: {
                    type: DataTypes.STRING(100),
                    allowNull: true
                },
                notes: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                },
                updated_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
                }
            }, { transaction });

            // Add indexes
            await queryInterface.addIndex('order_items', ['order_id'], { transaction });
            await queryInterface.addIndex('order_items', ['product_id'], { transaction });
            await queryInterface.addIndex('order_items', ['order_id', 'product_id'], {
                unique: true,
                transaction
            });
        } else {
            // Check if quantity_delivered column exists and remove it if it does
            const tableDescription = await queryInterface.describeTable('order_items');

            if (tableDescription.quantity_delivered) {
                await queryInterface.removeColumn('order_items', 'quantity_delivered', { transaction });
            }

            // Ensure all required columns exist
            const requiredColumns = {
                gift_quantity: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                    validate: {
                        min: 0
                    }
                },
                gift_reason: {
                    type: DataTypes.STRING(100),
                    allowNull: true
                },
                discount_amount: {
                    type: DataTypes.DECIMAL(10, 2),
                    defaultValue: 0.00,
                    validate: {
                        min: 0
                    }
                },
                final_price: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    validate: {
                        min: 0
                    }
                }
            };

            for (const [columnName, columnDefinition] of Object.entries(requiredColumns)) {
                if (!tableDescription[columnName]) {
                    await queryInterface.addColumn('order_items', columnName, columnDefinition, { transaction });
                }
            }
        }

        await transaction.commit();
        console.log('✅ Order items table migration completed successfully');
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Error in order items migration:', error);
        throw error;
    }
};

export const down = async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
        // Remove added columns
        const tableDescription = await queryInterface.describeTable('order_items');

        const columnsToRemove = ['gift_quantity', 'gift_reason', 'discount_amount', 'final_price'];

        for (const columnName of columnsToRemove) {
            if (tableDescription[columnName]) {
                await queryInterface.removeColumn('order_items', columnName, { transaction });
            }
        }

        await transaction.commit();
        console.log('✅ Order items table rollback completed successfully');
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Error in order items rollback:', error);
        throw error;
    }
}; 
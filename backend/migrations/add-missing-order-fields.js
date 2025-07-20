import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

export async function up() {
    const transaction = await sequelize.transaction();

    try {
        // Add missing columns to orders table (only the ones that don't exist)
        await sequelize.query(`
            ALTER TABLE orders 
            ADD COLUMN total_cost_eur DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            ADD COLUMN total_cost_syp DECIMAL(15,2) NOT NULL DEFAULT 0.00,
            ADD COLUMN commission_eur DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            ADD COLUMN commission_syp DECIMAL(15,2) NOT NULL DEFAULT 0.00,
            ADD COLUMN scheduled_delivery_date DATE NULL
        `, { transaction });

        await transaction.commit();
        console.log('✅ Added missing fields to orders table');
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Error adding missing fields to orders table:', error);
        throw error;
    }
}

export async function down() {
    const transaction = await sequelize.transaction();

    try {
        // Remove the added columns
        await sequelize.query(`
            ALTER TABLE orders 
            DROP COLUMN total_cost_eur,
            DROP COLUMN total_cost_syp,
            DROP COLUMN commission_eur,
            DROP COLUMN commission_syp,
            DROP COLUMN scheduled_delivery_date
        `, { transaction });

        await transaction.commit();
        console.log('✅ Removed missing fields from orders table');
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Error removing missing fields from orders table:', error);
        throw error;
    }
} 
'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const vehicles = [
            {
                vehicle_type: 'van',
                vehicle_model: 'Ford Transit',
                vehicle_plate: 'ABC-123',
                vehicle_year: 2020,
                fuel_type: 'diesel',
                transmission: 'manual',
                engine_size: '2.0L',
                mileage: 45000,
                status: 'active',
                assigned_distributor_id: null,
                insurance_expiry_date: '2024-12-31',
                registration_expiry_date: '2024-12-31',
                last_maintenance_date: '2024-01-15',
                next_maintenance_date: '2024-07-15',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                vehicle_type: 'car',
                vehicle_model: 'Toyota Corolla',
                vehicle_plate: 'XYZ-789',
                vehicle_year: 2021,
                fuel_type: 'gasoline',
                transmission: 'automatic',
                engine_size: '1.8L',
                mileage: 32000,
                status: 'active',
                assigned_distributor_id: null,
                insurance_expiry_date: '2024-11-30',
                registration_expiry_date: '2024-11-30',
                last_maintenance_date: '2024-02-20',
                next_maintenance_date: '2024-08-20',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                vehicle_type: 'truck',
                vehicle_model: 'Mercedes Sprinter',
                vehicle_plate: 'DEF-456',
                vehicle_year: 2019,
                fuel_type: 'diesel',
                transmission: 'manual',
                engine_size: '2.2L',
                mileage: 78000,
                status: 'active',
                assigned_distributor_id: null,
                insurance_expiry_date: '2024-10-15',
                registration_expiry_date: '2024-10-15',
                last_maintenance_date: '2024-03-10',
                next_maintenance_date: '2024-09-10',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                vehicle_type: 'motorcycle',
                vehicle_model: 'Honda CB150R',
                vehicle_plate: 'GHI-012',
                vehicle_year: 2022,
                fuel_type: 'gasoline',
                transmission: 'manual',
                engine_size: '150cc',
                mileage: 15000,
                status: 'active',
                assigned_distributor_id: null,
                insurance_expiry_date: '2024-09-30',
                registration_expiry_date: '2024-09-30',
                last_maintenance_date: '2024-04-05',
                next_maintenance_date: '2024-10-05',
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        await queryInterface.bulkInsert('vehicles', vehicles, {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('vehicles', null, {});
    }
}; 
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
try {
    dotenv.config({ path: path.join(__dirname, 'config.env') });
} catch (err) {
    dotenv.config();
}

// Database configuration for production
const sequelize = new Sequelize(
    process.env.DB_NAME || 'railway',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    {
        host: process.env.DB_HOST || 'shinkansen.proxy.rlwy.net',
        port: process.env.DB_PORT || 24785,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
);

// Vehicle data
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

async function seedVehicles() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('Database connection established successfully.');

        // Insert vehicles
        const result = await sequelize.query(`
      INSERT INTO vehicles (
        vehicle_type, vehicle_model, vehicle_plate, vehicle_year,
        fuel_type, transmission, engine_size, mileage, status,
        assigned_distributor_id, insurance_expiry_date, registration_expiry_date,
        last_maintenance_date, next_maintenance_date, created_at, updated_at
      ) VALUES ?
    `, {
            replacements: [vehicles.map(v => [
                v.vehicle_type, v.vehicle_model, v.vehicle_plate, v.vehicle_year,
                v.fuel_type, v.transmission, v.engine_size, v.mileage, v.status,
                v.assigned_distributor_id, v.insurance_expiry_date, v.registration_expiry_date,
                v.last_maintenance_date, v.next_maintenance_date, v.created_at, v.updated_at
            ])],
            type: sequelize.QueryTypes.INSERT
        });

        console.log('Vehicles seeded successfully!');
        console.log('Inserted vehicles:', result[1]);

    } catch (error) {
        console.error('Error seeding vehicles:', error);
    } finally {
        await sequelize.close();
    }
}

seedVehicles(); 
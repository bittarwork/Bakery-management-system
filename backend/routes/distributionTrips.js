import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import mysql from 'mysql2/promise';

const router = express.Router();

// Database configuration for Railway production
const dbConfig = {
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'ZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA',
    database: 'railway',
    port: 24785
};

async function getDBConnection() {
    return await mysql.createConnection(dbConfig);
}

// @desc    Get all distribution trips
// @route   GET /api/distribution/trips
// @access  Private (Manager/Admin)
router.get('/', protect, authorize('manager', 'admin'), async (req, res) => {
    try {
        const { date, distributor_id, status } = req.query;
        const connection = await getDBConnection();

        let query = `
            SELECT 
                dt.id,
                dt.trip_number,
                dt.trip_date,
                dt.distributor_id,
                dt.distributor_name,
                dt.vehicle_info,
                dt.route_plan,
                dt.planned_start_time,
                dt.actual_start_time,
                dt.planned_end_time,
                dt.actual_end_time,
                dt.total_orders,
                dt.total_stores,
                dt.completed_stores,
                dt.total_amount_eur,
                dt.total_amount_syp,
                dt.status,
                dt.notes,
                dt.created_by_name,
                dt.created_at
            FROM distribution_trips dt
            WHERE 1=1
        `;

        const params = [];

        if (date) {
            query += ' AND dt.trip_date = ?';
            params.push(date);
        }

        if (distributor_id) {
            query += ' AND dt.distributor_id = ?';
            params.push(distributor_id);
        }

        if (status) {
            query += ' AND dt.status = ?';
            params.push(status);
        }

        query += ' ORDER BY dt.trip_date DESC, dt.created_at DESC';

        const [trips] = await connection.execute(query, params);

        // Parse JSON fields
        const formattedTrips = trips.map(trip => ({
            ...trip,
            vehicle_info: trip.vehicle_info ? JSON.parse(trip.vehicle_info) : null,
            route_plan: trip.route_plan ? JSON.parse(trip.route_plan) : null
        }));

        await connection.end();

        res.json({
            success: true,
            data: formattedTrips,
            message: 'تم جلب رحلات التوزيع بنجاح',
            count: formattedTrips.length
        });

    } catch (error) {
        console.error('Error fetching distribution trips:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب رحلات التوزيع',
            error: error.message
        });
    }
});

// @desc    Get store visits
// @route   GET /api/distribution/visits
// @access  Private (Manager/Admin/Distributor)
router.get('/visits', protect, async (req, res) => {
    try {
        const { trip_id, store_id, visit_status, date } = req.query;
        const connection = await getDBConnection();

        let query = `
            SELECT 
                sv.*,
                dt.trip_number,
                dt.trip_date,
                dt.distributor_name,
                s.name as store_name_full,
                s.address as store_address,
                s.phone as store_phone
            FROM store_visits sv
            LEFT JOIN distribution_trips dt ON sv.trip_id = dt.id
            LEFT JOIN stores s ON sv.store_id = s.id
            WHERE 1=1
        `;

        const params = [];

        if (trip_id) {
            query += ' AND sv.trip_id = ?';
            params.push(trip_id);
        }

        if (store_id) {
            query += ' AND sv.store_id = ?';
            params.push(store_id);
        }

        if (visit_status) {
            query += ' AND sv.visit_status = ?';
            params.push(visit_status);
        }

        if (date) {
            query += ' AND dt.trip_date = ?';
            params.push(date);
        }

        query += ' ORDER BY dt.trip_date DESC, sv.visit_order ASC';

        const [visits] = await connection.execute(query, params);

        // Format the response
        const formattedVisits = visits.map(visit => ({
            ...visit,
            arrival_location: visit.arrival_location ? JSON.parse(visit.arrival_location) : null,
            departure_location: visit.departure_location ? JSON.parse(visit.departure_location) : null,
            problems_encountered: visit.problems_encountered ? JSON.parse(visit.problems_encountered) : null
        }));

        await connection.end();

        res.json({
            success: true,
            data: formattedVisits,
            message: 'تم جلب زيارات المحلات بنجاح',
            count: formattedVisits.length
        });

    } catch (error) {
        console.error('Error fetching store visits:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب زيارات المحلات',
            error: error.message
        });
    }
});

export default router;
import Payment from '../models/Payment.js';
import Store from '../models/Store.js';
import Order from '../models/Order.js';
import { PAYMENT_STATUS } from '../constants/index.js';
import { Op } from 'sequelize';

// @desc    الحصول على جميع المدفوعات
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            search,
            store_id,
            status,
            payment_method,
            payment_type,
            date_from,
            date_to,
            amount_from,
            amount_to,
            currency,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const whereClause = {};

        // Search filter
        if (search) {
            whereClause[Op.or] = [
                { id: { [Op.like]: `%${search}%` } },
                { reference_number: { [Op.like]: `%${search}%` } },
                { notes: { [Op.like]: `%${search}%` } }
            ];
        }

        // Store filter
        if (store_id) {
            whereClause.store_id = store_id;
        }

        // Status filter
        if (status) {
            whereClause.status = status;
        }

        // Payment method filter
        if (payment_method) {
            whereClause.payment_method = payment_method;
        }

        // Payment type filter
        if (payment_type) {
            whereClause.payment_type = payment_type;
        }

        // Date range filter
        if (date_from || date_to) {
            whereClause.payment_date = {};
            if (date_from) whereClause.payment_date[Op.gte] = date_from;
            if (date_to) whereClause.payment_date[Op.lte] = date_to;
        }

        // Amount range filter - support both currencies
        if (amount_from || amount_to) {
            if (currency === 'EUR') {
                whereClause.amount_eur = {};
                if (amount_from) whereClause.amount_eur[Op.gte] = parseFloat(amount_from);
                if (amount_to) whereClause.amount_eur[Op.lte] = parseFloat(amount_to);
            } else if (currency === 'SYP') {
                whereClause.amount_syp = {};
                if (amount_from) whereClause.amount_syp[Op.gte] = parseFloat(amount_from);
                if (amount_to) whereClause.amount_syp[Op.lte] = parseFloat(amount_to);
            }
        }

        const { count, rows: payments } = await Payment.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name', 'owner_name']
                },
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'order_number', 'total_amount_eur', 'total_amount_syp']
                }
            ],
            order: [[sort_by, sort_order]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(count / limit);

        // Transform data for frontend
        const transformedPayments = payments.map(payment => ({
            id: payment.id,
            store_id: payment.store_id,
            store_name: payment.store?.name,
            order_id: payment.order_id,
            order_number: payment.order?.order_number,
            amount_eur: payment.amount_eur,
            amount_syp: payment.amount_syp,
            payment_method: payment.payment_method,
            payment_type: payment.payment_type,
            payment_date: payment.payment_date,
            status: payment.status,
            reference_number: payment.reference_number,
            notes: payment.notes,
            is_verified: payment.is_verified,
            verified_at: payment.verified_at,
            created_at: payment.created_at,
            updated_at: payment.updated_at
        }));

        res.json({
            success: true,
            data: transformedPayments,
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_items: count,
                items_per_page: parseInt(limit)
            },
            message: 'تم جلب المدفوعات بنجاح'
        });
    } catch (error) {
        console.error('[PAYMENTS] Failed to fetch payments:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
};

// @desc    الحصول على إحصائيات المدفوعات
// @route   GET /api/payments/statistics
// @access  Private
export const getPaymentStatistics = async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        const statistics = await Payment.getStatistics(period);

        res.json({
            success: true,
            data: statistics,
            message: 'تم جلب إحصائيات المدفوعات بنجاح'
        });
    } catch (error) {
        console.error('[PAYMENTS] Failed to fetch payment statistics:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم',
            error: error.message
        });
    }
};

// @desc    الحصول على دفعة واحدة
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await Payment.findByPk(id, {
            include: [
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name', 'owner_name', 'phone', 'email']
                },
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'order_number', 'total_amount_eur', 'total_amount_syp', 'status']
                }
            ]
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'الدفعة غير موجودة'
            });
        }

        res.json({
            success: true,
            data: payment,
            message: 'تم جلب الدفعة بنجاح'
        });
    } catch (error) {
        console.error('[PAYMENTS] Failed to fetch payment:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم'
        });
    }
};

// @desc    إنشاء دفعة جديدة
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res) => {
    try {
        const {
            store_id,
            order_id,
            amount_eur = 0,
            amount_syp = 0,
            payment_method = 'cash',
            payment_type = 'payment',
            payment_date,
            reference_number,
            notes,
            collection_gps_coordinates,
            collected_by_distributor_id,
            receipt_photo_url,
            mixed_payment_details
        } = req.body;

        // Validate required fields
        if (!store_id || (!amount_eur && !amount_syp)) {
            return res.status(400).json({
                success: false,
                message: 'متجر ومبلغ الدفع مطلوبان'
            });
        }

        // Verify store exists
        const store = await Store.findByPk(store_id);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المتجر غير موجود'
            });
        }

        // Verify order exists if provided
        if (order_id) {
            const order = await Order.findByPk(order_id);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'الطلب غير موجود'
                });
            }
        }

        // Create payment
        const payment = await Payment.create({
            store_id,
            order_id,
            amount_eur,
            amount_syp,
            payment_method,
            payment_type,
            payment_date: payment_date || new Date(),
            reference_number,
            notes,
            collection_gps_coordinates,
            collected_by_distributor_id,
            receipt_photo_url,
            mixed_payment_details,
            status: 'pending',
            created_by: req.user.id,
            created_by_name: req.user.full_name || req.user.username
        });

        res.status(201).json({
            success: true,
            data: payment,
            message: 'تم إنشاء الدفعة بنجاح'
        });
    } catch (error) {
        console.error('[PAYMENTS] Failed to create payment:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الدفعة',
            error: error.message
        });
    }
};

// @desc    تحديث دفعة
// @route   PUT /api/payments/:id
// @access  Private
export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            store_id,
            order_id,
            amount_eur,
            amount_syp,
            payment_method,
            payment_type,
            payment_date,
            reference_number,
            notes,
            collection_gps_coordinates,
            collected_by_distributor_id,
            receipt_photo_url,
            mixed_payment_details
        } = req.body;

        const payment = await Payment.findByPk(id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'الدفعة غير موجودة'
            });
        }

        // Check if payment can be updated
        if (payment.status === 'completed' || payment.is_verified) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكن تحديث دفعة مكتملة أو مؤكدة'
            });
        }

        // Update payment
        const updateData = {};
        if (store_id !== undefined) updateData.store_id = store_id;
        if (order_id !== undefined) updateData.order_id = order_id;
        if (amount_eur !== undefined) updateData.amount_eur = amount_eur;
        if (amount_syp !== undefined) updateData.amount_syp = amount_syp;
        if (payment_method !== undefined) updateData.payment_method = payment_method;
        if (payment_type !== undefined) updateData.payment_type = payment_type;
        if (payment_date !== undefined) updateData.payment_date = payment_date;
        if (reference_number !== undefined) updateData.reference_number = reference_number;
        if (notes !== undefined) updateData.notes = notes;
        if (collection_gps_coordinates !== undefined) updateData.collection_gps_coordinates = collection_gps_coordinates;
        if (collected_by_distributor_id !== undefined) updateData.collected_by_distributor_id = collected_by_distributor_id;
        if (receipt_photo_url !== undefined) updateData.receipt_photo_url = receipt_photo_url;
        if (mixed_payment_details !== undefined) updateData.mixed_payment_details = mixed_payment_details;

        await payment.update(updateData);

        res.json({
            success: true,
            data: payment,
            message: 'تم تحديث الدفعة بنجاح'
        });
    } catch (error) {
        console.error('[PAYMENTS] Failed to update payment:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الدفعة',
            error: error.message
        });
    }
};

// @desc    حذف دفعة
// @route   DELETE /api/payments/:id
// @access  Private
export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await Payment.findByPk(id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'الدفعة غير موجودة'
            });
        }

        // Check if payment can be deleted
        if (payment.status === 'completed' || payment.is_verified) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكن حذف دفعة مكتملة أو مؤكدة'
            });
        }

        await payment.destroy();

        res.json({
            success: true,
            message: 'تم حذف الدفعة بنجاح'
        });
    } catch (error) {
        console.error('[PAYMENTS] Failed to delete payment:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الدفعة',
            error: error.message
        });
    }
};

// @desc    تحديث حالة الدفعة
// @route   PATCH /api/payments/:id/status
// @access  Private
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const payment = await Payment.findByPk(id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'الدفعة غير موجودة'
            });
        }

        // Validate status
        const allowedStatuses = ['pending', 'completed', 'rejected', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'حالة الدفع غير صحيحة'
            });
        }

        await payment.update({ status });

        res.json({
            success: true,
            data: { payment_id: id, status },
            message: 'تم تحديث حالة الدفعة بنجاح'
        });
    } catch (error) {
        console.error('[PAYMENTS] Failed to update payment status:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث حالة الدفعة',
            error: error.message
        });
    }
};

// @desc    تأكيد الدفعة
// @route   PATCH /api/payments/:id/verify
// @access  Private (Admin/Manager only)
export const verifyPayment = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بتأكيد الدفعات'
            });
        }

        const { id } = req.params;
        const { is_verified } = req.body;

        const payment = await Payment.findByPk(id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'الدفعة غير موجودة'
            });
        }

        await payment.update({
            is_verified: is_verified,
            verified_at: is_verified ? new Date() : null,
            verified_by: is_verified ? req.user.id : null,
            verified_by_name: is_verified ? (req.user.full_name || req.user.username) : null
        });

        res.json({
            success: true,
            data: { payment_id: id, is_verified },
            message: is_verified ? 'تم تأكيد الدفعة بنجاح' : 'تم إلغاء تأكيد الدفعة'
        });
    } catch (error) {
        console.error('[PAYMENTS] Failed to verify payment:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تأكيد الدفعة',
            error: error.message
        });
    }
};

// @desc    تصدير المدفوعات
// @route   GET /api/payments/export
// @access  Private
export const exportPayments = async (req, res) => {
    try {
        const { format = 'csv' } = req.query;

        const payments = await Payment.findAll({
            include: [
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name', 'owner_name']
                },
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'order_number']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        if (format === 'csv') {
            const csvContent = payments.map(payment => ({
                id: payment.id,
                store_name: payment.store?.name || '',
                order_number: payment.order?.order_number || '',
                amount_eur: payment.amount_eur,
                amount_syp: payment.amount_syp,
                payment_method: payment.payment_method,
                payment_type: payment.payment_type,
                status: payment.status,
                is_verified: payment.is_verified,
                payment_date: payment.payment_date,
                created_at: payment.created_at
            }));

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');

            const csvHeader = Object.keys(csvContent[0] || {}).join(',') + '\n';
            const csvRows = csvContent.map(row => Object.values(row).join(',')).join('\n');

            res.send(csvHeader + csvRows);
        } else {
            res.json({
                success: true,
                data: payments
            });
        }
    } catch (error) {
        console.error('[PAYMENTS] Failed to export payments:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تصدير المدفوعات',
            error: error.message
        });
    }
};

// @desc    الحصول على مدفوعات محل معين
// @route   GET /api/payments/store/:storeId
// @access  Private
export const getStorePayments = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        const whereClause = { store_id: storeId };
        if (status) whereClause.status = status;

        const offset = (page - 1) * limit;

        const { count, rows: payments } = await Payment.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'order_number', 'total_amount_eur', 'total_amount_syp']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: payments,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(count / limit),
                total_items: count,
                items_per_page: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('[PAYMENTS] Failed to fetch store payments:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب مدفوعات المحل',
            error: error.message
        });
    }
}; 
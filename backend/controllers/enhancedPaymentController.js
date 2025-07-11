import EnhancedPayment from '../models/EnhancedPayment.js';
import EnhancedStore from '../models/EnhancedStore.js';
import EnhancedUser from '../models/EnhancedUser.js';
import EnhancedStoreVisit from '../models/EnhancedStoreVisit.js';
import { Op } from 'sequelize';

// ===============================
// إدارة المدفوعات
// ===============================

export const createPayment = async (req, res) => {
    try {
        const {
            store_id,
            amount,
            currency = 'EUR',
            payment_method = 'cash',
            payment_date,
            description,
            reference_number,
            bank_details,
            check_details,
            visit_id,
            distributor_id,
            notes
        } = req.body;

        // التحقق من البيانات المطلوبة
        if (!store_id || !amount || !payment_date) {
            return res.status(400).json({
                success: false,
                message: 'معرف المحل والمبلغ وتاريخ الدفع مطلوبة'
            });
        }

        // التحقق من وجود المحل
        const store = await EnhancedStore.findByPk(store_id);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'المحل غير موجود'
            });
        }

        // التحقق من صحة العملة
        if (!['EUR', 'SYP'].includes(currency)) {
            return res.status(400).json({
                success: false,
                message: 'العملة يجب أن تكون EUR أو SYP'
            });
        }

        // التحقق من صحة طريقة الدفع
        const validPaymentMethods = ['cash', 'check', 'bank_transfer', 'card'];
        if (!validPaymentMethods.includes(payment_method)) {
            return res.status(400).json({
                success: false,
                message: 'طريقة الدفع غير صحيحة'
            });
        }

        // التحقق من تفاصيل الدفع حسب الطريقة
        if (payment_method === 'bank_transfer' && !bank_details) {
            return res.status(400).json({
                success: false,
                message: 'تفاصيل البنك مطلوبة للتحويل البنكي'
            });
        }

        if (payment_method === 'check' && !check_details) {
            return res.status(400).json({
                success: false,
                message: 'تفاصيل الشيك مطلوبة'
            });
        }

        // إنشاء المدفوعة
        const payment = await EnhancedPayment.create({
            store_id,
            amount,
            currency,
            payment_method,
            payment_date,
            description,
            reference_number,
            bank_details,
            check_details,
            visit_id,
            distributor_id,
            notes,
            created_by: req.user.id,
            status: 'pending'
        });

        // تحديث رصيد المحل
        await store.updateBalance(amount, currency);

        // جلب المدفوعة مع البيانات المرتبطة
        const createdPayment = await EnhancedPayment.findByPk(payment.id, {
            include: [
                { model: EnhancedStore, as: 'store' },
                { model: EnhancedUser, as: 'creator' },
                { model: EnhancedStoreVisit, as: 'visit' }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء المدفوعة بنجاح',
            data: createdPayment
        });

    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء المدفوعة',
            error: error.message
        });
    }
};

export const getPayments = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            store_id,
            start_date,
            end_date,
            payment_method,
            currency,
            status,
            distributor_id,
            search,
            sort_by = 'payment_date',
            sort_order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        // فلاتر البحث
        if (store_id) where.store_id = store_id;
        if (payment_method) where.payment_method = payment_method;
        if (currency) where.currency = currency;
        if (status) where.status = status;
        if (distributor_id) where.distributor_id = distributor_id;

        if (start_date) where.payment_date = { [Op.gte]: start_date };
        if (end_date) where.payment_date = { ...where.payment_date, [Op.lte]: end_date };

        if (search) {
            where[Op.or] = [
                { payment_number: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { reference_number: { [Op.like]: `%${search}%` } }
            ];
        }

        const { rows: payments, count } = await EnhancedPayment.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[sort_by, sort_order.toUpperCase()]],
            include: [
                { model: EnhancedStore, as: 'store', attributes: ['id', 'name', 'owner_name'] },
                { model: EnhancedUser, as: 'creator', attributes: ['id', 'full_name'] },
                { model: EnhancedStoreVisit, as: 'visit' }
            ]
        });

        // حساب الإجماليات
        const totals = await EnhancedPayment.getTotals(where);

        res.json({
            success: true,
            data: {
                payments,
                totals,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_records: count,
                    per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المدفوعات',
            error: error.message
        });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await EnhancedPayment.findByPk(id, {
            include: [
                { model: EnhancedStore, as: 'store' },
                { model: EnhancedUser, as: 'creator' },
                { model: EnhancedUser, as: 'verifier' },
                { model: EnhancedStoreVisit, as: 'visit' }
            ]
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'المدفوعة غير موجودة'
            });
        }

        res.json({
            success: true,
            data: payment
        });

    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب بيانات المدفوعة',
            error: error.message
        });
    }
};

export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const payment = await EnhancedPayment.findByPk(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'المدفوعة غير موجودة'
            });
        }

        // التحقق من إمكانية التعديل
        if (payment.status === 'verified') {
            return res.status(400).json({
                success: false,
                message: 'لا يمكن تعديل مدفوعة تم التحقق منها'
            });
        }

        // حفظ القيم القديمة للمقارنة
        const oldAmount = payment.amount;
        const oldCurrency = payment.currency;

        await payment.update({
            ...updateData,
            updated_by: req.user.id
        });

        // تحديث رصيد المحل إذا تغير المبلغ أو العملة
        if (updateData.amount !== oldAmount || updateData.currency !== oldCurrency) {
            const store = await EnhancedStore.findByPk(payment.store_id);
            if (store) {
                // إلغاء المبلغ القديم
                await store.updateBalance(-oldAmount, oldCurrency);
                // إضافة المبلغ الجديد
                await store.updateBalance(payment.amount, payment.currency);
            }
        }

        res.json({
            success: true,
            message: 'تم تحديث المدفوعة بنجاح',
            data: payment
        });

    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث المدفوعة',
            error: error.message
        });
    }
};

export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await EnhancedPayment.findByPk(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'المدفوعة غير موجودة'
            });
        }

        // التحقق من إمكانية الحذف
        if (payment.status === 'verified') {
            return res.status(400).json({
                success: false,
                message: 'لا يمكن حذف مدفوعة تم التحقق منها'
            });
        }

        // تحديث رصيد المحل
        const store = await EnhancedStore.findByPk(payment.store_id);
        if (store) {
            await store.updateBalance(-payment.amount, payment.currency);
        }

        await payment.destroy();

        res.json({
            success: true,
            message: 'تم حذف المدفوعة بنجاح'
        });

    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف المدفوعة',
            error: error.message
        });
    }
};

// ===============================
// إدارة التحقق من المدفوعات
// ===============================

export const verifyPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { verification_notes } = req.body;

        const payment = await EnhancedPayment.findByPk(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'المدفوعة غير موجودة'
            });
        }

        // التحقق من الصلاحيات
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بالتحقق من المدفوعات'
            });
        }

        await payment.verify(req.user.id, verification_notes);

        res.json({
            success: true,
            message: 'تم التحقق من المدفوعة بنجاح',
            data: payment
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في التحقق من المدفوعة',
            error: error.message
        });
    }
};

export const rejectPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejection_reason } = req.body;

        if (!rejection_reason) {
            return res.status(400).json({
                success: false,
                message: 'سبب الرفض مطلوب'
            });
        }

        const payment = await EnhancedPayment.findByPk(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'المدفوعة غير موجودة'
            });
        }

        // التحقق من الصلاحيات
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك برفض المدفوعات'
            });
        }

        await payment.reject(req.user.id, rejection_reason);

        // تحديث رصيد المحل
        const store = await EnhancedStore.findByPk(payment.store_id);
        if (store) {
            await store.updateBalance(-payment.amount, payment.currency);
        }

        res.json({
            success: true,
            message: 'تم رفض المدفوعة',
            data: payment
        });

    } catch (error) {
        console.error('Error rejecting payment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في رفض المدفوعة',
            error: error.message
        });
    }
};

export const getPendingPayments = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { rows: payments, count } = await EnhancedPayment.findAndCountAll({
            where: { status: 'pending' },
            limit: parseInt(limit),
            offset,
            order: [['created_at', 'ASC']],
            include: [
                { model: EnhancedStore, as: 'store', attributes: ['id', 'name', 'owner_name'] },
                { model: EnhancedUser, as: 'creator', attributes: ['id', 'full_name'] }
            ]
        });

        res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_records: count,
                    per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching pending payments:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المدفوعات المعلقة',
            error: error.message
        });
    }
};

// ===============================
// الإحصائيات والتقارير
// ===============================

export const getPaymentStatistics = async (req, res) => {
    try {
        const { start_date, end_date, store_id, currency } = req.query;

        const stats = await EnhancedPayment.getStatistics(start_date, end_date, store_id, currency);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching payment statistics:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب إحصائيات المدفوعات',
            error: error.message
        });
    }
};

export const getPaymentReport = async (req, res) => {
    try {
        const {
            start_date,
            end_date,
            store_id,
            payment_method,
            currency,
            format = 'json'
        } = req.query;

        const report = await EnhancedPayment.generateReport(
            start_date,
            end_date,
            { store_id, payment_method, currency }
        );

        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=payments_report.csv');
            return res.send(report.csv);
        }

        res.json({
            success: true,
            data: report
        });

    } catch (error) {
        console.error('Error generating payment report:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء تقرير المدفوعات',
            error: error.message
        });
    }
};

export const getPaymentsByStore = async (req, res) => {
    try {
        const { store_id } = req.params;
        const { page = 1, limit = 20, start_date, end_date, status } = req.query;

        const offset = (page - 1) * limit;
        const where = { store_id };

        if (start_date) where.payment_date = { [Op.gte]: start_date };
        if (end_date) where.payment_date = { ...where.payment_date, [Op.lte]: end_date };
        if (status) where.status = status;

        const { rows: payments, count } = await EnhancedPayment.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['payment_date', 'DESC']],
            include: [
                { model: EnhancedUser, as: 'creator', attributes: ['id', 'full_name'] },
                { model: EnhancedUser, as: 'verifier', attributes: ['id', 'full_name'] }
            ]
        });

        // إحصائيات المحل
        const storeStats = await EnhancedPayment.getStoreStatistics(store_id, start_date, end_date);

        res.json({
            success: true,
            data: {
                payments,
                statistics: storeStats,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_records: count,
                    per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching payments by store:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب مدفوعات المحل',
            error: error.message
        });
    }
};

// ===============================
// تحويل العملات
// ===============================

export const convertCurrency = async (req, res) => {
    try {
        const { amount, from_currency, to_currency } = req.body;

        if (!amount || !from_currency || !to_currency) {
            return res.status(400).json({
                success: false,
                message: 'المبلغ والعملة المصدر والعملة المستهدفة مطلوبة'
            });
        }

        const convertedAmount = await EnhancedPayment.convertCurrency(amount, from_currency, to_currency);

        res.json({
            success: true,
            data: {
                original_amount: amount,
                from_currency,
                to_currency,
                converted_amount: convertedAmount,
                conversion_rate: convertedAmount / amount
            }
        });

    } catch (error) {
        console.error('Error converting currency:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحويل العملة',
            error: error.message
        });
    }
};

// ===============================
// مدفوعات الموزعين
// ===============================

export const getDistributorPayments = async (req, res) => {
    try {
        const { distributor_id } = req.params;
        const { page = 1, limit = 20, start_date, end_date } = req.query;

        const offset = (page - 1) * limit;
        const where = { distributor_id };

        if (start_date) where.payment_date = { [Op.gte]: start_date };
        if (end_date) where.payment_date = { ...where.payment_date, [Op.lte]: end_date };

        const { rows: payments, count } = await EnhancedPayment.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['payment_date', 'DESC']],
            include: [
                { model: EnhancedStore, as: 'store', attributes: ['id', 'name', 'owner_name'] },
                { model: EnhancedStoreVisit, as: 'visit' }
            ]
        });

        // إحصائيات الموزع
        const distributorStats = await EnhancedPayment.getDistributorStatistics(distributor_id, start_date, end_date);

        res.json({
            success: true,
            data: {
                payments,
                statistics: distributorStats,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_records: count,
                    per_page: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching distributor payments:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب مدفوعات الموزع',
            error: error.message
        });
    }
}; 
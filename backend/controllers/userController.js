import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { Op } from 'sequelize';

// @desc    الحصول على جميع الموظفين
// @route   GET /api/users
// @access  Private (Admin/Manager)
export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
        const offset = (page - 1) * limit;

        // بناء شروط البحث
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { full_name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { username: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }

        if (role) {
            whereClause.role = role;
        }

        if (status) {
            whereClause.status = status;
        }

        // جلب البيانات مع التصفح
        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // حساب الإحصائيات الحقيقية
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { status: 'active' } });
        const inactiveUsers = await User.count({ where: { status: 'inactive' } });

        res.json({
            success: true,
            message: 'تم جلب بيانات الموظفين بنجاح',
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit)
                },
                statistics: {
                    totalUsers,
                    activeUsers,
                    inactiveUsers
                }
            }
        });

    } catch (error) {
        console.error('[USERS] Get users failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب بيانات الموظفين'
        });
    }
};

// @desc    الحصول على موظف واحد
// @route   GET /api/users/:id
// @access  Private (Admin/Manager)
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'الموظف غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم جلب بيانات الموظف بنجاح',
            data: user
        });

    } catch (error) {
        console.error('[USERS] Get user failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب بيانات الموظف'
        });
    }
};

// @desc    إنشاء موظف جديد
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req, res) => {
    try {
        // التحقق من صحة البيانات
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const { username, email, password, full_name, phone, role = 'distributor' } = req.body;

        // التحقق من عدم وجود المستخدم
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'اسم المستخدم أو البريد الإلكتروني مُستخدم بالفعل'
            });
        }

        // إنشاء الموظف
        const user = await User.create({
            username,
            email,
            password,
            full_name,
            phone,
            role,
            status: 'active',
            created_by: req.userId,
            created_by_name: req.user?.full_name || 'System'
        });

        // إرجاع البيانات بدون كلمة المرور
        const userData = user.toJSON();
        delete userData.password;

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الموظف بنجاح',
            data: userData
        });

    } catch (error) {
        console.error('[USERS] Create user failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الموظف'
        });
    }
};

// @desc    تحديث بيانات موظف
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
    try {
        // التحقق من صحة البيانات
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { username, email, full_name, phone, role, status } = req.body;

        // البحث عن الموظف
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'الموظف غير موجود'
            });
        }

        // التحقق من عدم تكرار البريد الإلكتروني أو اسم المستخدم
        if (email !== user.email || username !== user.username) {
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [
                        { email },
                        { username }
                    ],
                    id: { [Op.ne]: id }
                }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'اسم المستخدم أو البريد الإلكتروني مُستخدم بالفعل'
                });
            }
        }

        // تحديث البيانات
        await user.update({
            username,
            email,
            full_name,
            phone,
            role,
            status
        });

        // إرجاع البيانات المحدثة
        const userData = user.toJSON();
        delete userData.password;

        res.json({
            success: true,
            message: 'تم تحديث بيانات الموظف بنجاح',
            data: userData
        });

    } catch (error) {
        console.error('[USERS] Update user failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث بيانات الموظف'
        });
    }
};

// @desc    حذف موظف
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // البحث عن الموظف
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'الموظف غير موجود'
            });
        }

        // منع حذف المدير الرئيسي
        if (user.role === 'admin' && user.username === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'لا يمكن حذف المدير الرئيسي'
            });
        }

        // حذف الموظف
        await user.destroy();

        res.json({
            success: true,
            message: 'تم حذف الموظف بنجاح'
        });

    } catch (error) {
        console.error('[USERS] Delete user failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الموظف'
        });
    }
};

// @desc    تغيير حالة موظف
// @route   PATCH /api/users/:id/status
// @access  Private (Admin)
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // البحث عن الموظف
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'الموظف غير موجود'
            });
        }

        // تحديث الحالة
        await user.update({ status });

        res.json({
            success: true,
            message: `تم ${status === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} الموظف بنجاح`,
            data: {
                id: user.id,
                status: user.status
            }
        });

    } catch (error) {
        console.error('[USERS] Toggle user status failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تغيير حالة الموظف'
        });
    }
};

// @desc    الحصول على إحصائيات الموظفين
// @route   GET /api/users/statistics
// @access  Private (Admin/Manager)
export const getUserStatistics = async (req, res) => {
    try {
        // إحصائيات عامة
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { status: 'active' } });
        const inactiveUsers = await User.count({ where: { status: 'inactive' } });

        // إحصائيات حسب الدور
        const roleStats = await User.findAll({
            attributes: [
                'role',
                [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
            ],
            group: ['role']
        });

        // إحصائيات حسب الشهر
        const monthlyStats = await User.findAll({
            attributes: [
                [User.sequelize.fn('DATE_FORMAT', User.sequelize.col('created_at'), '%Y-%m'), 'month'],
                [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
            ],
            where: {
                created_at: {
                    [Op.gte]: User.sequelize.fn('DATE_SUB', User.sequelize.fn('NOW'), User.sequelize.literal('INTERVAL 12 MONTH'))
                }
            },
            group: ['month'],
            order: [['month', 'DESC']]
        });

        res.json({
            success: true,
            message: 'تم جلب إحصائيات الموظفين بنجاح',
            data: {
                general: {
                    totalUsers,
                    activeUsers,
                    inactiveUsers
                },
                byRole: roleStats,
                byMonth: monthlyStats
            }
        });

    } catch (error) {
        console.error('[USERS] Get statistics failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب إحصائيات الموظفين'
        });
    }
};

// @desc    تصدير بيانات الموظفين
// @route   GET /api/users/export
// @access  Private (Admin/Manager)
export const exportUsers = async (req, res) => {
    try {
        const { format = 'json' } = req.query;

        // جلب جميع الموظفين
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']]
        });

        if (format === 'csv') {
            // تصدير بصيغة CSV
            const csvData = users.map(user => ({
                'الاسم الكامل': user.full_name,
                'البريد الإلكتروني': user.email,
                'رقم الهاتف': user.phone,
                'الدور': user.role,
                'الحالة': user.status,
                'تاريخ الإنشاء': user.created_at
            }));

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=users.csv');

            // تحويل إلى CSV
            const csv = Object.keys(csvData[0]).join(',') + '\n' +
                csvData.map(row => Object.values(row).join(',')).join('\n');

            res.send(csv);
        } else {
            // تصدير بصيغة JSON
            res.json({
                success: true,
                message: 'تم تصدير بيانات الموظفين بنجاح',
                data: users
            });
        }

    } catch (error) {
        console.error('[USERS] Export users failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'خطأ في تصدير بيانات الموظفين'
        });
    }
}; 
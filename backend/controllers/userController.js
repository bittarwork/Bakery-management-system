import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { Op } from 'sequelize';

// @desc    Get all users with enhanced filtering and role-specific data
// @route   GET /api/users
// @access  Private (Admin/Manager)
export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
        const offset = (page - 1) * limit;

        // Build search conditions
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

        // Fetch data with pagination
        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Calculate real statistics
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { status: 'active' } });
        const inactiveUsers = await User.count({ where: { status: 'inactive' } });
        const distributors = await User.count({ where: { role: 'distributor' } });
        const admins = await User.count({ where: { role: 'admin' } });
        const managers = await User.count({ where: { role: 'manager' } });

        res.json({
            success: true,
            message: 'Users retrieved successfully',
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
                    inactiveUsers,
                    distributors,
                    admins,
                    managers
                }
            }
        });

    } catch (error) {
        console.error('[USERS] Get users failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error retrieving users'
        });
    }
};

// @desc    Get single user with role-specific data
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
                message: 'User not found'
            });
        }

        // Add role-specific data
        let roleSpecificData = {};

        if (user.role === 'distributor') {
            roleSpecificData = {
                performance_metrics: {
                    current_workload: user.current_workload || 0,
                    performance_rating: user.performance_rating || 0,
                    work_status: user.work_status || 'offline',
                    last_active: user.last_active
                },
                location_info: {
                    current_location: user.current_location,
                    location_updated_at: user.location_updated_at
                },
                vehicle_info: user.vehicle_info,
                license_number: user.license_number
            };
        }

        res.json({
            success: true,
            message: 'User retrieved successfully',
            data: {
                ...user.toJSON(),
                role_specific_data: roleSpecificData
            }
        });

    } catch (error) {
        console.error('[USERS] Get user failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user'
        });
    }
};

// @desc    Create new user with enhanced validation
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req, res) => {
    try {
        // Validate input data
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data provided',
                errors: errors.array()
            });
        }

        const {
            username,
            email,
            password,
            full_name,
            phone,
            role = 'distributor',
            address,
            hired_date,
            salary,
            license_number,
            emergency_contact,
            vehicle_info
        } = req.body;

        // Check if user already exists
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
                message: 'Username or email already exists'
            });
        }

        // Create user data
        const userData = {
            username,
            email,
            password,
            full_name,
            phone,
            role,
            status: 'active',
            created_by: req.userId,
            created_by_name: req.user?.full_name || 'System'
        };

        // Add optional fields
        if (address) userData.address = address;
        if (hired_date) userData.hired_date = hired_date;
        if (salary) userData.salary = salary;
        if (license_number) userData.license_number = license_number;
        if (emergency_contact) userData.emergency_contact = emergency_contact;
        if (vehicle_info) userData.vehicle_info = vehicle_info;

        // Set default work status for distributors
        if (role === 'distributor') {
            userData.work_status = 'available';
            userData.current_workload = 0;
            userData.performance_rating = 0.00;
        }

        // Create user
        const user = await User.create(userData);

        // Return data without password
        const responseData = user.toJSON();
        delete responseData.password;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: responseData
        });

    } catch (error) {
        console.error('[USERS] Create user failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error creating user'
        });
    }
};

// @desc    Update user with enhanced data handling
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
    try {
        // Validate input data
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data provided',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const {
            username,
            email,
            full_name,
            phone,
            role,
            status,
            address,
            hired_date,
            salary,
            license_number,
            emergency_contact,
            vehicle_info
        } = req.body;

        // Find user
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check for duplicate email/username
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
                    message: 'Username or email already exists'
                });
            }
        }

        // Prepare update data
        const updateData = {
            username,
            email,
            full_name,
            phone,
            role,
            status
        };

        // Add optional fields
        if (address !== undefined) updateData.address = address;
        if (hired_date !== undefined) updateData.hired_date = hired_date;
        if (salary !== undefined) updateData.salary = salary;
        if (license_number !== undefined) updateData.license_number = license_number;
        if (emergency_contact !== undefined) updateData.emergency_contact = emergency_contact;
        if (vehicle_info !== undefined) updateData.vehicle_info = vehicle_info;

        // Update user
        await user.update(updateData);

        // Return updated data
        const userData = user.toJSON();
        delete userData.password;

        res.json({
            success: true,
            message: 'User updated successfully',
            data: userData
        });

    } catch (error) {
        console.error('[USERS] Update user failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating user'
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

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename=users.csv');

            // تحويل إلى CSV مع BOM
            const BOM = '\uFEFF';
            const csv = BOM + Object.keys(csvData[0]).join(',') + '\n' +
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

// @desc    Get distributor-specific data and performance
// @route   GET /api/users/distributors/:id/details
// @access  Private (Admin/Manager)
export const getDistributorDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const distributor = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: 'Distributor not found'
            });
        }

        if (distributor.role !== 'distributor') {
            return res.status(400).json({
                success: false,
                message: 'User is not a distributor'
            });
        }

        // Calculate performance metrics
        const performanceData = {
            current_workload: distributor.current_workload || 0,
            performance_rating: distributor.performance_rating || 0,
            work_status: distributor.work_status || 'offline',
            last_active: distributor.last_active,
            location_info: {
                current_location: distributor.current_location,
                location_updated_at: distributor.location_updated_at
            },
            vehicle_info: distributor.vehicle_info,
            license_number: distributor.license_number,
            daily_performance: distributor.daily_performance || {}
        };

        res.json({
            success: true,
            message: 'Distributor details retrieved successfully',
            data: {
                ...distributor.toJSON(),
                performance_data: performanceData
            }
        });

    } catch (error) {
        console.error('[USERS] Get distributor details failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error retrieving distributor details'
        });
    }
};

// @desc    Get all distributors with performance data
// @route   GET /api/users/distributors
// @access  Private (Admin/Manager)
export const getAllDistributors = async (req, res) => {
    try {
        const { status = 'active', work_status } = req.query;

        const whereClause = {
            role: 'distributor'
        };

        if (status) {
            whereClause.status = status;
        }

        if (work_status) {
            whereClause.work_status = work_status;
        }

        const distributors = await User.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            order: [['full_name', 'ASC']]
        });

        // Add performance summary for each distributor
        const distributorsWithPerformance = distributors.map(distributor => ({
            ...distributor.toJSON(),
            performance_summary: {
                current_workload: distributor.current_workload || 0,
                performance_rating: distributor.performance_rating || 0,
                work_status: distributor.work_status || 'offline',
                last_active: distributor.last_active,
                has_location: !!distributor.current_location
            }
        }));

        res.json({
            success: true,
            message: 'Distributors retrieved successfully',
            data: {
                distributors: distributorsWithPerformance,
                total: distributorsWithPerformance.length,
                active_count: distributorsWithPerformance.filter(d => d.status === 'active').length,
                online_count: distributorsWithPerformance.filter(d => d.work_status === 'available').length
            }
        });

    } catch (error) {
        console.error('[USERS] Get distributors failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error retrieving distributors'
        });
    }
};

// @desc    Update distributor location and work status
// @route   PATCH /api/users/distributors/:id/status
// @access  Private (Admin/Manager/Self)
export const updateDistributorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { work_status, location } = req.body;

        const distributor = await User.findByPk(id);

        if (!distributor) {
            return res.status(404).json({
                success: false,
                message: 'Distributor not found'
            });
        }

        if (distributor.role !== 'distributor') {
            return res.status(400).json({
                success: false,
                message: 'User is not a distributor'
            });
        }

        const updateData = {};

        if (work_status) {
            const validStatuses = ['available', 'busy', 'offline', 'break'];
            if (!validStatuses.includes(work_status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid work status'
                });
            }
            updateData.work_status = work_status;
            updateData.last_active = new Date();
        }

        if (location) {
            updateData.current_location = {
                ...location,
                timestamp: new Date()
            };
            updateData.location_updated_at = new Date();
        }

        await distributor.update(updateData);

        res.json({
            success: true,
            message: 'Distributor status updated successfully',
            data: {
                id: distributor.id,
                work_status: distributor.work_status,
                current_location: distributor.current_location,
                last_active: distributor.last_active
            }
        });

    } catch (error) {
        console.error('[USERS] Update distributor status failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating distributor status'
        });
    }
};

// @desc    Get admin details with system permissions
// @route   GET /api/users/admins/:id/details
// @access  Private (Admin)
export const getAdminDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if (!['admin', 'manager'].includes(admin.role)) {
            return res.status(400).json({
                success: false,
                message: 'User is not an admin or manager'
            });
        }

        // Add admin-specific data
        const adminData = {
            ...admin.toJSON(),
            permissions: getAdminPermissions(admin.role),
            system_access: {
                last_login: admin.last_login,
                created_at: admin.created_at,
                is_super_admin: admin.role === 'admin' && admin.username === 'admin'
            }
        };

        res.json({
            success: true,
            message: 'Admin details retrieved successfully',
            data: adminData
        });

    } catch (error) {
        console.error('[USERS] Get admin details failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error retrieving admin details'
        });
    }
};

// @desc    Get all admins and managers
// @route   GET /api/users/admins
// @access  Private (Admin)
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await User.findAll({
            where: {
                role: {
                    [Op.in]: ['admin', 'manager']
                }
            },
            attributes: { exclude: ['password'] },
            order: [['role', 'ASC'], ['full_name', 'ASC']]
        });

        const adminsWithPermissions = admins.map(admin => ({
            ...admin.toJSON(),
            permissions: getAdminPermissions(admin.role),
            is_super_admin: admin.role === 'admin' && admin.username === 'admin'
        }));

        res.json({
            success: true,
            message: 'Admins retrieved successfully',
            data: {
                admins: adminsWithPermissions,
                total: adminsWithPermissions.length,
                super_admins: adminsWithPermissions.filter(a => a.role === 'admin').length,
                managers: adminsWithPermissions.filter(a => a.role === 'manager').length
            }
        });

    } catch (error) {
        console.error('[USERS] Get admins failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error retrieving admins'
        });
    }
};

// @desc    Update user password
// @route   PATCH /api/users/:id/password
// @access  Private (Admin/Self)
export const updateUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { current_password, new_password } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // If not admin, verify current password
        if (req.user.role !== 'admin' && req.userId !== parseInt(id)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to change this password'
            });
        }

        if (req.userId === parseInt(id) && current_password) {
            const isValidPassword = await user.comparePassword(current_password);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
        }

        // Validate new password
        if (!new_password || new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        await user.update({ password: new_password });

        res.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('[USERS] Update password failed:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating password'
        });
    }
};

// Helper function to get admin permissions
function getAdminPermissions(role) {
    const permissions = {
        admin: [
            'user_management',
            'store_management',
            'product_management',
            'order_management',
            'vehicle_management',
            'financial_reports',
            'system_settings',
            'data_export',
            'user_creation',
            'user_deletion'
        ],
        manager: [
            'store_management',
            'product_management',
            'order_management',
            'vehicle_management',
            'basic_reports',
            'distributor_management'
        ],
        distributor: [
            'order_delivery',
            'location_update',
            'status_update'
        ],
        cashier: [
            'sales_processing',
            'payment_handling'
        ],
        accountant: [
            'financial_reports',
            'payment_tracking',
            'expense_management'
        ]
    };

    return permissions[role] || [];
} 
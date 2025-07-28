import User from '../models/User.js';
import Order from '../models/Order.js';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
import OrderItem from '../models/OrderItem.js';
import Payment from '../models/Payment.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

/**
 * Mobile Distributor Controller
 * Handles all mobile app specific endpoints for distributors
 */
class MobileDistributorController {

    /**
     * @desc    Distributor login for mobile app
     * @route   POST /api/mobile/auth/login
     * @access  Public
     */
    static async login(req, res) {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username and password are required'
                });
            }

            // Find user
            const user = await User.findOne({
                where: {
                    username: username,
                    role: 'distributor',
                    status: 'active'
                }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            // Update last login
            await user.update({ last_login: new Date() });

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        full_name: user.full_name,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        vehicle_info: user.vehicle_info
                    },
                    token
                },
                message: 'Login successful'
            });

        } catch (error) {
            console.error('Mobile login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during login'
            });
        }
    }

    /**
     * @desc    Get distributor's assigned orders for today
     * @route   GET /api/mobile/orders/today
     * @access  Private (Distributor)
     */
    static async getTodayOrders(req, res) {
        try {
            const distributorId = req.user.userId;
            const today = new Date().toISOString().split('T')[0];

            const orders = await Order.findAll({
                where: {
                    assigned_distributor_id: distributorId,
                    delivery_date: today,
                    distribution_status: {
                        [Op.in]: ['pending', 'in_progress', 'out_for_delivery']
                    }
                },
                include: [
                    {
                        model: Store,
                        as: 'store',
                        attributes: ['id', 'name', 'address', 'phone', 'latitude', 'longitude']
                    },
                    {
                        model: OrderItem,
                        as: 'items',
                        include: [{
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'unit_price_eur', 'unit_price_syp']
                        }]
                    }
                ],
                order: [['created_at', 'ASC']]
            });

            res.json({
                success: true,
                data: orders.map(order => ({
                    id: order.id,
                    order_number: order.order_number,
                    store: order.store,
                    total_amount_eur: parseFloat(order.total_amount_eur || 0),
                    total_amount_syp: parseFloat(order.total_amount_syp || 0),
                    distribution_status: order.distribution_status,
                    delivery_priority: order.delivery_priority,
                    notes: order.notes,
                    items: order.items.map(item => ({
                        id: item.id,
                        product: item.product,
                        quantity: item.quantity,
                        unit_price_eur: parseFloat(item.unit_price_eur || 0),
                        unit_price_syp: parseFloat(item.unit_price_syp || 0),
                        total_price_eur: parseFloat(item.total_price_eur || 0),
                        total_price_syp: parseFloat(item.total_price_syp || 0)
                    }))
                })),
                message: 'Today orders retrieved successfully'
            });

        } catch (error) {
            console.error('Get today orders error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving today orders'
            });
        }
    }

    /**
     * @desc    Update order delivery status
     * @route   PUT /api/mobile/orders/:orderId/status
     * @access  Private (Distributor)
     */
    static async updateOrderStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status, notes, delivery_proof } = req.body;
            const distributorId = req.user.userId;

            // Validate status
            const validStatuses = ['pending', 'in_progress', 'out_for_delivery', 'delivered', 'returned', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status value'
                });
            }

            // Find order
            const order = await Order.findOne({
                where: {
                    id: orderId,
                    assigned_distributor_id: distributorId
                }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found or not assigned to you'
                });
            }

            // Update order
            const updateData = {
                distribution_status: status,
                distribution_notes: notes
            };

            // Set delivery timestamp if delivered
            if (status === 'delivered') {
                updateData.actual_delivery_time = new Date();
            }

            await order.update(updateData);

            res.json({
                success: true,
                data: {
                    id: order.id,
                    distribution_status: order.distribution_status,
                    distribution_notes: order.distribution_notes,
                    actual_delivery_time: order.actual_delivery_time
                },
                message: 'Order status updated successfully'
            });

        } catch (error) {
            console.error('Update order status error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating order status'
            });
        }
    }

    /**
     * @desc    Get distributor dashboard summary
     * @route   GET /api/mobile/dashboard/summary
     * @access  Private (Distributor)
     */
    static async getDashboardSummary(req, res) {
        try {
            const distributorId = req.user.userId;
            const today = new Date().toISOString().split('T')[0];

            // Get today's orders count
            const todayOrdersCount = await Order.count({
                where: {
                    assigned_distributor_id: distributorId,
                    delivery_date: today
                }
            });

            // Get completed orders today
            const completedOrdersCount = await Order.count({
                where: {
                    assigned_distributor_id: distributorId,
                    delivery_date: today,
                    distribution_status: 'delivered'
                }
            });

            // Get total collection amount today
            const todayPayments = await Payment.sum('amount_received_eur', {
                include: [{
                    model: Order,
                    as: 'order',
                    where: {
                        assigned_distributor_id: distributorId,
                        delivery_date: today
                    }
                }]
            });

            // Get pending orders
            const pendingOrdersCount = await Order.count({
                where: {
                    assigned_distributor_id: distributorId,
                    delivery_date: today,
                    distribution_status: {
                        [Op.in]: ['pending', 'in_progress', 'out_for_delivery']
                    }
                }
            });

            res.json({
                success: true,
                data: {
                    today_orders: todayOrdersCount || 0,
                    completed_orders: completedOrdersCount || 0,
                    pending_orders: pendingOrdersCount || 0,
                    total_collection_eur: parseFloat(todayPayments || 0),
                    completion_rate: todayOrdersCount > 0 ? Math.round((completedOrdersCount / todayOrdersCount) * 100) : 0
                },
                message: 'Dashboard summary retrieved successfully'
            });

        } catch (error) {
            console.error('Get dashboard summary error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving dashboard summary'
            });
        }
    }

    /**
     * @desc    Record payment for an order
     * @route   POST /api/mobile/payments
     * @access  Private (Distributor)
     */
    static async recordPayment(req, res) {
        try {
            const { order_id, amount_eur, amount_syp, payment_method, notes } = req.body;
            const distributorId = req.user.userId;

            // Validate input
            if (!order_id || (!amount_eur && !amount_syp)) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID and payment amount are required'
                });
            }

            // Find order
            const order = await Order.findOne({
                where: {
                    id: order_id,
                    assigned_distributor_id: distributorId
                }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found or not assigned to you'
                });
            }

            // Create payment record
            const payment = await Payment.create({
                order_id: order_id,
                store_id: order.store_id,
                amount_received_eur: amount_eur || 0,
                amount_received_syp: amount_syp || 0,
                payment_method: payment_method || 'cash',
                payment_date: new Date(),
                notes: notes,
                created_by: distributorId
            });

            res.status(201).json({
                success: true,
                data: {
                    id: payment.id,
                    order_id: payment.order_id,
                    amount_received_eur: parseFloat(payment.amount_received_eur),
                    amount_received_syp: parseFloat(payment.amount_received_syp),
                    payment_method: payment.payment_method,
                    payment_date: payment.payment_date,
                    notes: payment.notes
                },
                message: 'Payment recorded successfully'
            });

        } catch (error) {
            console.error('Record payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error recording payment'
            });
        }
    }

    /**
     * @desc    Get distributor profile
     * @route   GET /api/mobile/profile
     * @access  Private (Distributor)
     */
    static async getProfile(req, res) {
        try {
            const distributorId = req.user.userId;

            const user = await User.findByPk(distributorId, {
                attributes: [
                    'id', 'username', 'full_name', 'email', 'phone',
                    'vehicle_info', 'hire_date', 'status', 'created_at'
                ]
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: user,
                message: 'Profile retrieved successfully'
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving profile'
            });
        }
    }

}

export default MobileDistributorController; 
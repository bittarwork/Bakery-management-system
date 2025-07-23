import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
    Package, 
    User, 
    Clock, 
    CheckCircle, 
    AlertCircle,
    RefreshCw,
    Users,
    BarChart3
} from 'lucide-react';

/**
 * Simple Distribution Management Page
 * Replaces the complex auto-scheduling system with a straightforward interface
 */
const SimpleDistributionPage = () => {
    const [orders, setOrders] = useState([]);
    const [distributors, setDistributors] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            // Load all data in parallel
            const [ordersRes, distributorsRes, statsRes] = await Promise.all([
                fetch('/api/simple-distribution/orders', { headers }),
                fetch('/api/simple-distribution/distributors', { headers }),
                fetch('/api/simple-distribution/stats', { headers })
            ]);

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setOrders(ordersData.data.orders || []);
            }

            if (distributorsRes.ok) {
                const distributorsData = await distributorsRes.json();
                setDistributors(distributorsData.data || []);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData.data || null);
            }

        } catch (err) {
            setError('فشل في تحميل البيانات: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const assignOrderToDistributor = async (orderId, distributorId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/simple-distribution/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ order_id: orderId, distributor_id: distributorId })
            });

            if (response.ok) {
                await loadData(); // Refresh data
                alert('تم تعيين الموزع بنجاح');
            } else {
                const errorData = await response.json();
                alert('فشل في تعيين الموزع: ' + errorData.message);
            }
        } catch (err) {
            alert('خطأ في تعيين الموزع: ' + err.message);
        }
    };

    const unassignOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/simple-distribution/unassign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ order_id: orderId, reason: 'manual_unassignment' })
            });

            if (response.ok) {
                await loadData(); // Refresh data
                alert('تم إلغاء تعيين الموزع بنجاح');
            } else {
                const errorData = await response.json();
                alert('فشل في إلغاء التعيين: ' + errorData.message);
            }
        } catch (err) {
            alert('خطأ في إلغاء التعيين: ' + err.message);
        }
    };

    const autoAssignAllOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/simple-distribution/auto-assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                await loadData(); // Refresh data
                alert(`تم التعيين التلقائي: ${result.data.assigned} طلب تم تعيينه، ${result.data.failed} طلب فشل`);
            } else {
                const errorData = await response.json();
                alert('فشل في التعيين التلقائي: ' + errorData.message);
            }
        } catch (err) {
            alert('خطأ في التعيين التلقائي: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { color: 'secondary', text: 'مسودة' },
            confirmed: { color: 'primary', text: 'مؤكد' },
            in_progress: { color: 'warning', text: 'قيد التنفيذ' },
            delivered: { color: 'success', text: 'تم التسليم' },
            cancelled: { color: 'destructive', text: 'ملغي' }
        };
        
        const config = statusConfig[status] || { color: 'secondary', text: status };
        return <Badge variant={config.color}>{config.text}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="ml-2">جاري التحميل...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">إدارة التوزيع البسيط</h1>
                    <p className="text-muted-foreground">
                        نظام بسيط وفعال لتوزيع الطلبات على الموزعين
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={loadData} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        تحديث
                    </Button>
                    <Button onClick={autoAssignAllOrders} disabled={loading}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        تعيين تلقائي لجميع الطلبات
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <Package className="w-8 h-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.total_orders}</p>
                                    <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.assigned_orders}</p>
                                    <p className="text-sm text-muted-foreground">الطلبات المعينة</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-8 h-8 text-orange-600" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.pending_orders}</p>
                                    <p className="text-sm text-muted-foreground">الطلبات المعلقة</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <BarChart3 className="w-8 h-8 text-purple-600" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.assignment_rate}%</p>
                                    <p className="text-sm text-muted-foreground">معدل التعيين</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2 text-red-800">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Orders List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Package className="w-5 h-5" />
                        <span>الطلبات والتوزيع</span>
                    </CardTitle>
                    <CardDescription>
                        عرض جميع الطلبات مع حالة التوزيع وإمكانية التحكم
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>لا توجد طلبات حالياً</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div 
                                    key={order.id} 
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-2">
                                                <h3 className="font-semibold text-lg">
                                                    {order.order_number}
                                                </h3>
                                                {getStatusBadge(order.status)}
                                                <span className="text-sm text-muted-foreground">
                                                    €{order.total_amount_eur}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p><strong>المحل:</strong> {order.store?.name}</p>
                                                    <p><strong>العنوان:</strong> {order.store?.address}</p>
                                                </div>
                                                <div>
                                                    {order.assigned_distributor ? (
                                                        <div className="flex items-center space-x-2">
                                                            <User className="w-4 h-4 text-green-600" />
                                                            <span>
                                                                <strong>الموزع:</strong> {order.assigned_distributor.full_name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-2 text-orange-600">
                                                            <AlertCircle className="w-4 h-4" />
                                                            <span>لم يتم تعيين موزع</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2 ml-4">
                                            {order.assigned_distributor ? (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => unassignOrder(order.id)}
                                                >
                                                    إلغاء التعيين
                                                </Button>
                                            ) : (
                                                <select 
                                                    className="px-3 py-2 border rounded text-sm"
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            assignOrderToDistributor(order.id, parseInt(e.target.value));
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                    defaultValue=""
                                                >
                                                    <option value="">اختر موزع</option>
                                                    {distributors.map((distributor) => (
                                                        <option key={distributor.id} value={distributor.id}>
                                                            {distributor.full_name} (الحمل: {distributor.current_workload || 0})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Distributors Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>الموزعين المتاحين</span>
                    </CardTitle>
                    <CardDescription>
                        عرض حالة الموزعين وحملهم الحالي
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {distributors.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>لا يوجد موزعين نشطين</p>
                            <p className="text-sm mt-2">يجب إضافة موزعين لتفعيل النظام التلقائي</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {distributors.map((distributor) => (
                                <div 
                                    key={distributor.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <User className="w-8 h-8 text-blue-600" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{distributor.full_name}</h4>
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                <span>الحمل: {distributor.current_workload || 0}</span>
                                                <span>•</span>
                                                <span>التقييم: {distributor.performance_rating || 0}/5</span>
                                            </div>
                                            <Badge 
                                                variant={distributor.status === 'active' ? 'success' : 'secondary'}
                                                className="mt-1"
                                            >
                                                {distributor.status === 'active' ? 'نشط' : 'غير نشط'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SimpleDistributionPage; 
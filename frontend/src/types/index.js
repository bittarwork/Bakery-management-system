/**
 * أنواع البيانات المستخدمة في التطبيق
 */

// نوع المستخدم
export const UserType = {
    id: 'number',
    username: 'string',
    full_name: 'string',
    email: 'string',
    role: 'string',
    is_active: 'boolean',
    created_at: 'string',
    updated_at: 'string'
};

// نوع الطلب
export const OrderType = {
    id: 'number',
    store_id: 'number',
    creator_id: 'number',
    order_date: 'string',
    delivery_date: 'string',
    status: 'string',
    payment_status: 'string',
    total_amount: 'number',
    discount_amount: 'number',
    notes: 'string',
    created_at: 'string',
    updated_at: 'string',
    store: 'object',
    creator: 'object',
    items: 'array'
};

// نوع عنصر الطلب
export const OrderItemType = {
    id: 'number',
    order_id: 'number',
    product_id: 'number',
    quantity: 'number',
    unit_price: 'number',
    discount_amount: 'number',
    gift_quantity: 'number',
    gift_reason: 'string',
    notes: 'string',
    product: 'object'
};

// نوع المتجر
export const StoreType = {
    id: 'number',
    name: 'string',
    address: 'string',
    phone: 'string',
    email: 'string',
    contact_person: 'string',
    is_active: 'boolean',
    created_at: 'string',
    updated_at: 'string'
};

// نوع المنتج
export const ProductType = {
    id: 'number',
    name: 'string',
    description: 'string',
    unit_price: 'number',
    category: 'string',
    is_active: 'boolean',
    created_at: 'string',
    updated_at: 'string'
};

// نوع استجابة API
export const ApiResponseType = {
    success: 'boolean',
    message: 'string',
    data: 'any',
    errors: 'array'
};

// نوع بيانات التصفح
export const PaginationType = {
    page: 'number',
    limit: 'number',
    total: 'number',
    totalPages: 'number',
    hasNext: 'boolean',
    hasPrev: 'boolean'
};

// نوع الفلاتر
export const FiltersType = {
    search: 'string',
    status: 'string',
    payment_status: 'string',
    store_id: 'number',
    date_from: 'string',
    date_to: 'string',
    page: 'number',
    limit: 'number'
};

// نوع الإحصائيات
export const StatisticsType = {
    total_orders: 'number',
    total_amount: 'number',
    pending_orders: 'number',
    delivered_orders: 'number',
    cancelled_orders: 'number',
    pending_payments: 'number',
    overdue_payments: 'number'
};

// دوال التحقق من الأنواع
export const isValidUser = (user) => {
    return user && typeof user.id === 'number' && typeof user.username === 'string';
};

export const isValidOrder = (order) => {
    return order && typeof order.id === 'number' && typeof order.store_id === 'number';
};

export const isValidApiResponse = (response) => {
    return response && typeof response.success === 'boolean';
}; 
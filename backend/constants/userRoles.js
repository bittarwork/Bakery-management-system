/**
 * ثوابت أدوار المستخدمين
 */

export const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    DISTRIBUTOR: 'distributor',
    VIEWER: 'viewer'
};

export const USER_ROLE_LABELS = {
    [USER_ROLES.ADMIN]: 'مدير النظام',
    [USER_ROLES.MANAGER]: 'مدير',
    [USER_ROLES.DISTRIBUTOR]: 'موزع',
    [USER_ROLES.VIEWER]: 'مشاهد'
};

export const USER_ROLE_PERMISSIONS = {
    [USER_ROLES.ADMIN]: [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'orders.create',
        'orders.read',
        'orders.update',
        'orders.delete',
        'stores.create',
        'stores.read',
        'stores.update',
        'stores.delete',
        'products.create',
        'products.read',
        'products.update',
        'products.delete',
        'reports.read',
        'settings.update'
    ],
    [USER_ROLES.MANAGER]: [
        'orders.create',
        'orders.read',
        'orders.update',
        'orders.delete',
        'stores.read',
        'stores.update',
        'products.read',
        'products.update',
        'reports.read'
    ],
    [USER_ROLES.DISTRIBUTOR]: [
        'orders.read',
        'orders.update',
        'stores.read',
        'products.read'
    ],
    [USER_ROLES.VIEWER]: [
        'orders.read',
        'stores.read',
        'products.read',
        'reports.read'
    ]
};

// الأدوار التي يمكنها إدارة المستخدمين
export const MANAGEMENT_ROLES = [
    USER_ROLES.ADMIN,
    USER_ROLES.MANAGER
];

// الأدوار التي يمكنها إنشاء الطلبات
export const ORDER_CREATION_ROLES = [
    USER_ROLES.ADMIN,
    USER_ROLES.MANAGER
];

export default USER_ROLES; 